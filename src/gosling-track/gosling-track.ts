import type { Graphics, InteractionEvent } from 'pixi.js';
import PubSub from 'pubsub-js';
import * as uuid from 'uuid';
import { isEqual, sampleSize, uniqBy } from 'lodash-es';
import { format } from 'd3-format';
import type { ScaleLinear } from 'd3-scale';
import type { SingleTrack, OverlaidTrack, Datum, EventStyle } from '@gosling.schema';
import type { CompleteThemeDeep } from 'src/core/utils/theme';
import { drawMark, drawPostEmbellishment, drawPreEmbellishment } from '../core/mark';
import { GoslingTrackModel } from '../core/gosling-track-model';
import { validateTrack } from '../core/utils/validate';
import { shareScaleAcrossTracks } from '../core/utils/scales';
import { resolveSuperposedTracks } from '../core/utils/overlay';
import colorToHex from '../core/utils/color-to-hex';
import {
    aggregateCoverage,
    calculateData,
    concatString,
    displace,
    filterData,
    calculateGenomicLength,
    parseSubJSON,
    replaceString,
    splitExon,
    inferSvType
} from '../core/utils/data-transform';
import { getTabularData } from './data-abstraction';
import { publish } from '../core/pubsub';
import { getRelativeGenomicPosition } from '../core/utils/assembly';
import { getTextStyle } from '../core/utils/text-style';
import { Is2DTrack, IsChannelDeep, IsMouseEventsDeep, IsXAxis } from '../core/gosling.schema.guards';
import { spawn } from 'threads';
import { HIGLASS_AXIS_SIZE } from '../core/higlass-model';
import type { MouseEventData } from '../gosling-mouse-event/mouse-event-model';
import { flatArrayToPairArray } from '../core/utils/array';
import { BAMDataFetcher } from '../data-fetcher/bam';
import { GoslingVcfData } from '../data-fetcher/vcf';
import BamWorker from '../data-fetcher/bam/bam-worker.js?worker&inline';
import VcfWorker from '../data-fetcher/vcf/vcf-worker.js?worker&inline';
import { LinearBrushModel } from '../gosling-brush/linear-brush-model';

// Set `true` to print in what order each function is called
export const PRINT_RENDERING_CYCLE = false;

// Experimental function to test with prerelease rendering
function usePrereleaseRendering(spec: SingleTrack | OverlaidTrack) {
    return spec.data?.type === 'bam' || spec.data?.type === 'vcf';
}

// For using libraries, refer to https://github.com/higlass/higlass/blob/f82c0a4f7b2ab1c145091166b0457638934b15f3/app/scripts/configs/available-for-plugins.js
// `getTilePosAndDimensions()` definition: https://github.com/higlass/higlass/blob/1e1146409c7d7c7014505dd80d5af3e9357c77b6/app/scripts/Tiled1DPixiTrack.js#L133
// Refer to the following already supported graphics:
// https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/PixiTrack.js#L115

const DEFAULT_MARK_HIGHLIGHT_STYLE: Required<EventStyle> = {
    stroke: 'black',
    strokeWidth: 1,
    strokeOpacity: 1,
    color: 'none',
    opacity: 1
};

interface GoslingTrackOption {
    spec: SingleTrack | OverlaidTrack;
    showMousePosition: boolean;
    theme: CompleteThemeDeep;
}

/**
 * Each GoslingTrack draws either a track of multiple tracks with SAME DATA that are overlaid.
 * @param HGC
 * @param args
 * @returns
 */
function GoslingTrack(HGC: any, ...args: any[]): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    // Services
    const { tileProxy } = HGC.services;
    const { showMousePosition } = HGC.utils;

    class GoslingTrackClass extends HGC.tracks.BarTrack {
        private viewUid: string;
        private options!: GoslingTrackOption;
        private tileSize: number;
        private worker: any;
        private isRangeBrushActivated: boolean;
        private mRangeBrush: LinearBrushModel;
        private _xScale!: ScaleLinear<number, number>;
        private _yScale!: ScaleLinear<number, number>;
        private pMouseHover: Graphics;
        private pMouseSelection: Graphics;
        // TODO: add members that are used explicitly in the code

        constructor(params: any[]) {
            const [context, options] = params;

            // Check whether to load a worker
            let dataWorker;
            if (usePrereleaseRendering(options.spec)) {
                try {
                    if (options.spec.data?.type === 'bam') {
                        dataWorker = spawn(new BamWorker());
                        context.dataFetcher = new BAMDataFetcher(HGC, context.dataConfig, dataWorker);
                    } else if (options.spec.data?.type === 'vcf') {
                        dataWorker = spawn(new VcfWorker());
                        context.dataFetcher = new GoslingVcfData(HGC, context.dataConfig, dataWorker);
                    }
                } catch (e) {
                    console.warn('Error loading worker', e);
                }
            }

            super(context, options);

            this.worker = dataWorker;
            context.dataFetcher.track = this;
            this.context = context;
            this.viewUid = context.viewUid;

            // Add unique IDs to each of the overlaid tracks that will be rendered independently.
            if ('overlay' in this.options.spec) {
                this.options.spec.overlay = (this.options.spec as OverlaidTrack).overlay.map(o => {
                    return { ...o, _renderingId: uuid.v1() };
                });
            } else {
                this.options.spec._renderingId = uuid.v1();
            }

            this.tileSize = this.tilesetInfo?.tile_size ?? 1024;

            // This is tracking the xScale of an entire view, which is used when no tiling concepts are used
            this.drawnAtScale = HGC.libraries.d3Scale.scaleLinear();
            this.scalableGraphics = {};

            const { valid, errorMessages } = validateTrack(this.options.spec);

            if (!valid) {
                console.warn('The specification of the following track is invalid', errorMessages, this.options.spec);
            }

            this.extent = { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER };

            // Graphics for highlighting visual elements under the cursor
            this.pMouseHover = new HGC.libraries.PIXI.Graphics();
            this.pMouseSelection = new HGC.libraries.PIXI.Graphics();
            this.pMain.addChild(this.pMouseHover);
            this.pMain.addChild(this.pMouseSelection);

            // Brushes on the color legend
            this.gLegend = HGC.libraries.d3Selection.select(this.context.svgElement).append('g');

            // Enable click event
            this.isRangeBrushActivated = false;
            this.pMask.interactive = true;
            this.gBrush = HGC.libraries.d3Selection.select(this.context.svgElement).append('g');
            this.mRangeBrush = new LinearBrushModel(
                this.gBrush,
                HGC.libraries,
                this.onRangeBrush.bind(this),
                this.options.spec.style?.brush
            );
            this.pMask.mousedown = (e: InteractionEvent) =>
                this.onMouseDown(
                    e.data.getLocalPosition(this.pMain).x,
                    e.data.getLocalPosition(this.pMain).y,
                    e.data.originalEvent.altKey
                );
            this.pMask.mouseup = (e: InteractionEvent) =>
                this.onMouseUp(e.data.getLocalPosition(this.pMain).x, e.data.getLocalPosition(this.pMain).y);
            this.pMask.mousemove = (e: InteractionEvent) => this.onMouseMove(e.data.getLocalPosition(this.pMain).x);
            this.pMask.mouseout = () => this.onMouseOut();

            // Remove a mouse graphic if created by a parent, and draw ourselves
            // https://github.com/higlass/higlass/blob/38f0c4415f0595c3b9d685a754d6661dc9612f7c/app/scripts/utils/show-mouse-position.js#L28
            // this.getIsFlipped = () => { return this.originalSpec.orientation === 'vertical' };
            this.flipText = this.options.spec.orientation === 'vertical';

            if (this.hideMousePosition) {
                this.hideMousePosition();
                this.hideMousePosition = undefined;
            }
            if (this.options?.showMousePosition && !this.hideMousePosition) {
                this.hideMousePosition = showMousePosition(
                    this,
                    Is2DTrack(resolveSuperposedTracks(this.options.spec)[0]),
                    this.isShowGlobalMousePosition()
                );
            }

            // We do not use HiGlass' trackNotFoundText
            this.pLabel.removeChild(this.trackNotFoundText);

            /* Custom loading label */
            const loadingTextStyle = getTextStyle({ color: 'black', size: 12 });
            this.loadingTextStyleObj = new HGC.libraries.PIXI.TextStyle(loadingTextStyle);
            this.loadingTextBg = new HGC.libraries.PIXI.Graphics();
            this.loadingText = new HGC.libraries.PIXI.Text('', loadingTextStyle);
            this.loadingText.anchor.x = 1;
            this.loadingText.anchor.y = 1;
            this.pLabel.addChild(this.loadingTextBg);
            this.pLabel.addChild(this.loadingText);

            this.svgData = [];
            this.textGraphics = [];
            this.textsBeingUsed = 0; // this variable is being used to improve the performance of text rendering
            this.loadingStatus = { loading: 0, processing: 0, rendering: 0 };

            // This improves the arc/link rendering performance
            HGC.libraries.PIXI.GRAPHICS_CURVES.adaptive = this.options.spec.style?.enableSmoothPath ?? false;
            if (HGC.libraries.PIXI.GRAPHICS_CURVES.adaptive) {
                HGC.libraries.PIXI.GRAPHICS_CURVES.maxLength = 1;
                HGC.libraries.PIXI.GRAPHICS_CURVES.maxSegments = 2048 * 10;
            }
        }

        /* ----------------------------------- RENDERING CYCLE ----------------------------------- */

        /**
         * Draw all tiles from the bottom.
         * (https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/TiledPixiTrack.js#L727)
         */
        draw() {
            if (PRINT_RENDERING_CYCLE) console.warn('draw()');

            this.clearMouseEventData();
            this.svgData = [];
            this.textsBeingUsed = 0;
            this.pMouseHover?.clear();

            // this.pMain.clear();
            // this.pMain.removeChildren();

            // this.pBackground.clear();
            // this.pBackground.removeChildren();
            // this.pBorder.clear();
            // this.pBorder.removeChildren();

            const processTilesAndDraw = () => {
                // Preprocess all tiles at once so that we can share scales across tiles.
                this.preprocessAllTiles();

                // This function calls `drawTile` on each tile.
                super.draw();

                // Record tiles so that we ignore loading same tiles again
                this.prevVisibleAndFetchedTiles = this.visibleAndFetchedTiles();
            };

            if (
                usePrereleaseRendering(this.options.spec) &&
                !isEqual(this.visibleAndFetchedTiles(), this.prevVisibleAndFetchedTiles)
            ) {
                this.updateTileAsync(processTilesAndDraw);
            } else {
                processTilesAndDraw();
            }

            // Based on the updated marks, update range selection
            this.mRangeBrush.drawBrush(true);
        }

        /*
         * Do whatever is necessary before rendering a new tile. This function is called from `receivedTiles()`.
         * (Refer to https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/HorizontalLine1DPixiTrack.js#L50)
         */
        initTile(tile: any) {
            if (PRINT_RENDERING_CYCLE) console.warn('initTile(tile)');

            // super.initTile(tile); // This calls `drawTile()`

            // Since `super.initTile(tile)` prints warning, we call `drawTile` ourselves without calling `super.initTile(tile)`.
            this.drawTile(tile);
        }

        updateTile(/* tile: any */) {} // Never mind about this function for the simplicity.
        renderTile(/* tile: any */) {} // Never mind about this function for the simplicity.

        /**
         * Display a tile upon receiving a new one or when explicitly called by a developer, e.g., calling `this.draw()`
         */
        drawTile(tile: any) {
            if (PRINT_RENDERING_CYCLE) console.warn('drawTile(tile)');

            tile.drawnAtScale = this._xScale.copy(); // being used in `super.draw()`

            if (!tile.goslingModels) {
                // We do not have a track model prepared to visualize
                return;
            }

            tile.graphics.clear();
            tile.graphics.removeChildren();

            // !! A single tile contains one track or multiple tracks overlaid
            /* Render marks and embellishments */
            tile.goslingModels.forEach((model: GoslingTrackModel) => {
                // check visibility condition
                const trackWidth = this.dimensions[0];
                const zoomLevel = this._xScale.invert(trackWidth) - this._xScale.invert(0);

                if (!model.trackVisibility({ zoomLevel })) {
                    return;
                }

                // This is for testing the upcoming rendering methods
                // if (usePrereleaseRendering(this.originalSpec)) {
                //     // Use worker to create visual properties
                //     drawScaleMark(HGC, this, tile, tm);
                //     return;
                // }

                drawPreEmbellishment(HGC, this, tile, model, this.options.theme);
                drawMark(HGC, this, tile, model);
                drawPostEmbellishment(HGC, this, tile, model, this.options.theme);
            });

            this.forceDraw();
        }

        /**
         * Render this track again using a new option when a user changed the option.
         * (Refer to https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/HorizontalLine1DPixiTrack.js#L75)
         */
        rerender(newOptions: GoslingTrackOption) {
            if (PRINT_RENDERING_CYCLE) console.warn('rerender(options)');
            // !! We only call draw for the simplicity
            // super.rerender(newOptions); // This calls `renderTile()` on every tiles

            this.options = newOptions;

            if (this.options.spec.layout === 'circular') {
                // TODO (May-27-2022): remove the following line when we support a circular brush.
                // If the spec is changed to use the circular layout, we remove the current linear brush
                // because circular brush is not supported.
                this.mRangeBrush.remove();
            }

            this.clearMouseEventData();
            this.svgData = [];
            this.textsBeingUsed = 0;

            // this.flipText = this.originalSpec.orientation === 'vertical';

            // if (this.hideMousePosition) {
            //     this.hideMousePosition();
            //     this.hideMousePosition = undefined;
            // }
            // if (this.options?.showMousePosition && !this.hideMousePosition) {
            //     this.hideMousePosition = showMousePosition(
            //       this,
            //       Is2DTrack(resolveSuperposedTracks(this.originalSpec)[0]),
            //       this.isShowGlobalMousePosition(),
            //     );
            // }

            this.preprocessAllTiles(true);
            this.draw();
            this.forceDraw();
        }

        clearMouseEventData() {
            const models: GoslingTrackModel[] = this.visibleAndFetchedTiles()
                .map(tile => tile.goslingModels ?? [])
                .flat();
            models.forEach(model => model.getMouseEventModel().clear());
        }

        /**
         * End of the rendering cycle. This function is called when the track is removed entirely.
         */
        remove() {
            super.remove();

            if (this.gLegend) {
                this.gLegend.remove();
                this.gLegend = null;
            }
            this.mRangeBrush.remove();
        }
        /*
         * Rerender all tiles when track size is changed.
         * (Refer to https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/PixiTrack.js#L186).
         */
        setDimensions(newDimensions: [number, number]) {
            if (PRINT_RENDERING_CYCLE) console.warn('setDimensions()');

            this.oldDimensions = this.dimensions; // initially, [1, 1]
            super.setDimensions(newDimensions); // This simply updates `this._xScale` and `this._yScale`

            this.mRangeBrush.setSize(newDimensions[1]);

            // const visibleAndFetched = this.visibleAndFetchedTiles();
            // visibleAndFetched.map((tile: any) => this.initTile(tile));
        }

        /**
         * Record new position.
         */
        setPosition(newPosition: [number, number]) {
            super.setPosition(newPosition); // This simply changes `this.position`

            [this.pMain.position.x, this.pMain.position.y] = this.position;

            this.mRangeBrush.setOffset(...newPosition);
        }

        /**
         * A function to redraw this track. Typically called when an asynchronous event occurs (i.e. tiles loaded)
         * (Refer to https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/TiledPixiTrack.js#L71)
         */
        forceDraw() {
            this.animate();
        }

        /**
         * Called when location or zoom level has been changed by click-and-drag interaction
         * (https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/HorizontalLine1DPixiTrack.js#L215)
         * For brushing, refer to https://github.com/higlass/higlass/blob/caf230b5ee41168ea491572618612ac0cc804e5a/app/scripts/HeatmapTiledPixiTrack.js#L1493
         */
        zoomed(newXScale: ScaleLinear<number, number>, newYScale: ScaleLinear<number, number>) {
            if (PRINT_RENDERING_CYCLE) console.warn('zoomed()');

            const range = this.mRangeBrush.getRange();
            this.mRangeBrush.updateRange(
                range ? [newXScale(this._xScale.invert(range[0])), newXScale(this._xScale.invert(range[1]))] : null
            );

            // super.zoomed(newXScale, newYScale); // This function updates `this._xScale` and `this._yScale` and call this.draw();
            this.xScale(newXScale);
            this.yScale(newYScale);

            this.refreshTiles();

            // if (this.scalableGraphics) {
            // this.scaleScalableGraphics(Object.values(this.scalableGraphics), newXScale, this.drawnAtScale);
            // }

            // if (!usePrereleaseRendering(this.originalSpec)) {
            this.draw();
            // }
            this.forceDraw();
        }

        /**
         * This is currently for testing the new way of rendering visual elements.
         */
        updateTileAsync(callback: () => void) {
            this.xDomain = this._xScale.domain();
            this.xRange = this._xScale.range();

            this.drawLoadingCue();

            this.worker.then((tileFunctions: any) => {
                tileFunctions
                    .getTabularData(
                        this.dataFetcher.uid,
                        Object.values(this.fetchedTiles).map((x: any) => x.remoteId)
                    )
                    .then((toRender: any) => {
                        this.drawLoadingCue();
                        const tiles = this.visibleAndFetchedTiles();

                        const tabularData = JSON.parse(Buffer.from(toRender).toString());
                        if (tiles?.[0]) {
                            const tile = tiles[0];
                            tile.tileData.tabularData = tabularData;
                            const [refTile] = HGC.utils.trackUtils.calculate1DVisibleTiles(
                                this.tilesetInfo,
                                this._xScale
                            );
                            tile.tileData.zoomLevel = refTile[0];
                            tile.tileData.tilePos = [refTile[1]];
                        }

                        this.drawLoadingCue();
                        callback();
                        this.drawLoadingCue();
                    });
            });
        }

        /**
         * Stretch out the scaleble graphics to have proper effect upon zoom and pan.
         */
        scaleScalableGraphics(graphics: Graphics[], xScale: any, drawnAtScale: any) {
            const drawnAtScaleExtent = drawnAtScale.domain()[1] - drawnAtScale.domain()[0];
            const xScaleExtent = xScale.domain()[1] - xScale.domain()[0];

            const tileK = drawnAtScaleExtent / xScaleExtent;
            const newRange = xScale.domain().map(drawnAtScale);

            const posOffset = newRange[0];
            graphics.forEach(g => {
                g.scale.x = tileK;
                g.position.x = -posOffset * tileK;
            });
        }

        /**
         * Return the set of ids of all tiles which are both visible and fetched.
         */
        visibleAndFetchedIds() {
            return Object.keys(this.fetchedTiles).filter(x => this.visibleTileIds.has(x));
        }

        /**
         * Return the set of all tiles which are both visible and fetched.
         */
        visibleAndFetchedTiles() {
            return this.visibleAndFetchedIds().map((x: any) => this.fetchedTiles[x]);
        }

        // !! This is called in the constructor, `super(context, options)`. So be aware to use variables that is prepared.
        calculateVisibleTiles() {
            if (usePrereleaseRendering(this.options.spec)) {
                const tiles = HGC.utils.trackUtils.calculate1DVisibleTiles(this.tilesetInfo, this._xScale);

                for (const tile of tiles) {
                    const { tileWidth } = this.getTilePosAndDimensions(
                        tile[0],
                        [tile[1], tile[1]],
                        this.tilesetInfo.tile_size
                    );

                    // base pairs
                    const DEFAULT_MAX_TILE_WIDTH =
                        this.options.spec.data?.type === 'bam' ? 2e4 : Number.MAX_SAFE_INTEGER;

                    if (tileWidth > (this.tilesetInfo.max_tile_width || DEFAULT_MAX_TILE_WIDTH)) {
                        this.forceDraw();
                        return;
                    }
                    this.forceDraw();
                }

                this.setVisibleTiles(tiles);
            } else {
                if (!this.tilesetInfo) {
                    // if we don't know anything about this dataset, no point in trying to get tiles
                    return;
                }

                // calculate the zoom level given the scales and the data bounds
                this.zoomLevel = this.calculateZoomLevel();

                if (this.tilesetInfo.resolutions) {
                    const sortedResolutions = this.tilesetInfo.resolutions
                        .map((x: number) => +x)
                        .sort((a: number, b: number) => b - a);

                    this.xTiles = tileProxy.calculateTilesFromResolution(
                        sortedResolutions[this.zoomLevel],
                        this._xScale,
                        this.tilesetInfo.min_pos[0],
                        this.tilesetInfo.max_pos[0]
                    );

                    if (Is2DTrack(resolveSuperposedTracks(this.options.spec)[0])) {
                        // it makes sense only when the y-axis is being used for a genomic field
                        this.yTiles = tileProxy.calculateTilesFromResolution(
                            sortedResolutions[this.zoomLevel],
                            this._yScale,
                            this.tilesetInfo.min_pos[0],
                            this.tilesetInfo.max_pos[0]
                        );
                    }

                    const tiles = this.tilesToId(this.xTiles, this.yTiles, this.zoomLevel);
                    this.setVisibleTiles(tiles);
                } else {
                    this.xTiles = tileProxy.calculateTiles(
                        this.zoomLevel,
                        this.relevantScale(),
                        this.tilesetInfo.min_pos[0],
                        this.tilesetInfo.max_pos[0],
                        this.tilesetInfo.max_zoom,
                        this.tilesetInfo.max_width
                    );

                    if (Is2DTrack(resolveSuperposedTracks(this.options.spec)[0])) {
                        // it makes sense only when the y-axis is being used for a genomic field
                        this.yTiles = tileProxy.calculateTiles(
                            this.zoomLevel,
                            this._yScale,
                            this.tilesetInfo.min_pos[1],
                            this.tilesetInfo.max_pos[1],
                            this.tilesetInfo.max_zoom,
                            this.tilesetInfo.max_width1 || this.tilesetInfo.max_width
                        );
                    }

                    const tiles = this.tilesToId(this.xTiles, this.yTiles, this.zoomLevel);
                    this.setVisibleTiles(tiles);
                }
            }
        }

        /**
         * Get the tile's position in its coordinate system.
         */
        getTilePosAndDimensions(zoomLevel: number, tilePos: [number, number], binsPerTileIn?: number) {
            const binsPerTile = binsPerTileIn || this.tilesetInfo.bins_per_dimension || 256;

            if (this.tilesetInfo.resolutions) {
                const sortedResolutions = this.tilesetInfo.resolutions
                    .map((x: number) => +x)
                    .sort((a: number, b: number) => b - a);

                // A resolution specifies the number of BP per bin
                const chosenResolution = sortedResolutions[zoomLevel];

                const [xTilePos, yTilePos] = tilePos;

                const tileWidth = chosenResolution * binsPerTile;
                const tileHeight = tileWidth;

                const tileX = tileWidth * xTilePos;
                const tileY = tileHeight * yTilePos;

                return {
                    tileX,
                    tileY,
                    tileWidth,
                    tileHeight
                };
            } else {
                const [xTilePos, yTilePos] = tilePos;

                const minX = this.tilesetInfo.min_pos[0];

                const minY = this.tilesetInfo.min_pos[1];

                const tileWidth = this.tilesetInfo.max_width / 2 ** zoomLevel;
                const tileHeight = this.tilesetInfo.max_width / 2 ** zoomLevel;

                const tileX = minX + xTilePos * tileWidth;
                const tileY = minY + yTilePos * tileHeight;

                return {
                    tileX,
                    tileY,
                    tileWidth,
                    tileHeight
                };
            }
        }

        /**
         * Convert tile positions to tile IDs
         */
        tilesToId(xTiles: any[], yTiles: any[], zoomLevel: any) {
            if (xTiles && !yTiles) {
                // this means only the `x` axis is being used
                return xTiles.map(x => [zoomLevel, x]);
            } else {
                // this means both `x` and `y` axes are being used together
                const tiles: any = [];
                xTiles.forEach(x => yTiles.forEach(y => tiles.push([zoomLevel, x, y])));
                return tiles;
            }
        }

        /**
         * Show visual cue during waiting for visualizations being rendered.
         */
        drawLoadingCue() {
            if (this.fetching.size) {
                const margin = 6;

                // Show textual message
                const text = `Fetching... ${Array.from(this.fetching).join(' ')}`;
                this.loadingText.text = text;
                this.loadingText.x = this.position[0] + this.dimensions[0] - margin / 2.0;
                this.loadingText.y = this.position[1] + this.dimensions[1] - margin / 2.0;

                // Show background
                const metric = HGC.libraries.PIXI.TextMetrics.measureText(text, this.loadingTextStyleObj);
                const { width: w, height: h } = metric;

                this.loadingTextBg.clear();
                this.loadingTextBg.lineStyle(1, colorToHex('grey'), 1, 0.5);
                this.loadingTextBg.beginFill(colorToHex('white'), 0.8);
                this.loadingTextBg.drawRect(
                    this.position[0] + this.dimensions[0] - w - margin - 1,
                    this.position[1] + this.dimensions[1] - h - margin - 1,
                    w + margin,
                    h + margin
                );

                this.loadingText.visible = true;
                this.loadingTextBg.visible = true;
            } else {
                this.loadingText.visible = false;
                this.loadingTextBg.visible = false;
            }
        }

        /**
         * This function reorganize the tileset information so that it can be more conveniently managed afterwards.
         */
        reorganizeTileInfo() {
            const tiles = this.visibleAndFetchedTiles();

            this.tileSize = this.tilesetInfo?.tile_size ?? 1024;

            tiles.forEach((t: any) => {
                // A new object to store all datasets
                t.gos = {};

                // ! `tileData` is an array-like object
                const keys = Object.keys(t.tileData).filter(d => !+d && d !== '0'); // ignore array indexes

                // Store objects first
                keys.forEach(k => {
                    t.gos[k] = t.tileData[k];
                });

                // Store raw data
                t.gos.raw = Array.from(t.tileData);
            });
        }

        updateScaleOffsetFromOriginalSpec(
            _renderingId: string,
            scaleOffset: [number, number],
            channelKey: 'color' | 'stroke'
        ) {
            resolveSuperposedTracks(this.options.spec).map(spec => {
                if (spec._renderingId === _renderingId) {
                    const channel = spec[channelKey];
                    if (IsChannelDeep(channel)) {
                        channel.scaleOffset = scaleOffset;
                    }
                }
            });
        }

        shareScaleOffsetAcrossTracksAndTiles(scaleOffset: [number, number], channelKey: 'color' | 'stroke') {
            const models: GoslingTrackModel[] = [];
            this.visibleAndFetchedTiles().forEach((tile: any) => {
                models.push(...tile.goslingModels);
            });
            models.forEach(d => {
                const channel = d.spec()[channelKey];
                if (IsChannelDeep(channel)) {
                    channel.scaleOffset = scaleOffset;
                }
                const channelOriginal = d.originalSpec()[channelKey];
                if (IsChannelDeep(channelOriginal)) {
                    channelOriginal.scaleOffset = scaleOffset;
                }
            });
        }

        /**
         * Check whether tiles should be merged.
         */
        shouldCombineTiles() {
            return (
                ((this.options.spec as SingleTrack | OverlaidTrack).dataTransform?.find(t => t.type === 'displace') &&
                    this.visibleAndFetchedTiles()?.[0]?.tileData &&
                    // we do not need to combine tiles w/ multivec, vector, matrix
                    !this.visibleAndFetchedTiles()?.[0]?.tileData.dense) ||
                this.options.spec.data?.type === 'bam'
            ); // BAM data fetcher already combines the datasets;
        }

        /**
         * Combile multiple tiles into a single large tile.
         * This is sometimes necessary, for example, when applying a displacement algorithm.
         */
        combineAllTilesIfNeeded() {
            if (!this.shouldCombineTiles()) {
                // This means we do not need to combine tiles
                return;
            }

            const tiles = this.visibleAndFetchedTiles();

            if (!tiles || tiles.length === 0) {
                // Does not make sense to combine tiles
                return;
            }

            // Increase the size of tiles by length
            this.tileSize = (this.tilesetInfo?.tile_size ?? 1024) * tiles.length;

            let newData: Datum[] = [];

            tiles.forEach((t: any, i: number) => {
                // Combine data
                newData = [...newData, ...t.tileData];

                // Flag to force using only one tile
                t.mergedToAnotherTile = i !== 0;
            });

            tiles[0].gos.raw = newData;

            // Remove duplicated if possible
            if (tiles[0].gos.raw[0]?.uid) {
                tiles[0].gos.raw = uniqBy(tiles[0].gos.raw, 'uid');
            }
        }

        preprocessAllTiles(force = false) {
            const models: GoslingTrackModel[] = [];

            this.reorganizeTileInfo();

            this.combineAllTilesIfNeeded();

            this.visibleAndFetchedTiles().forEach((tile: any) => {
                if (force) {
                    tile.goslingModels = [];
                }
                // tile preprocessing is done only once per tile
                const tileModels = this.preprocessTile(tile);
                tileModels?.forEach((m: GoslingTrackModel) => {
                    models.push(m);
                });
            });

            shareScaleAcrossTracks(models);

            const flatTileData = ([] as Datum[]).concat(...models.map(d => d.data()));
            if (flatTileData.length !== 0) {
                publish('rawData', { id: this.viewUid, data: flatTileData });
            }

            // console.log('processed gosling model', models);

            // IMPORTANT: If no genomic fields specified, no point to use multiple tiles, i.e., we need to draw a track only once with the data combined.
            /*
            if (!getGenomicChannelKeyFromTrack(this.originalSpec) && false) {
                // TODO:
                const visibleModels: GoslingTrackModel[][] = this.visibleAndFetchedTiles().map(
                    (d: any) => d.goslingModels
                );
                const modelsWeUse: GoslingTrackModel[] = visibleModels[0];
                const modelsWeIgnore: GoslingTrackModel[][] = visibleModels.slice(1);

                // concatenate the rows in the data
                modelsWeIgnore.forEach((ignored, i) => {
                    modelsWeUse.forEach(m => {
                        m.addDataRows(ignored[0].data());
                    });
                    this.visibleAndFetchedTiles()[i + 1].goslingModels = [];
                });
            }
            */
        }

        /**
         * Construct tabular data from a higlass tileset and a gosling track model.
         * Return the generated gosling track model.
         */
        preprocessTile(tile: any) {
            if (tile.mergedToAnotherTile) {
                tile.goslingModels = [];
                return;
            }

            if (tile.goslingModels && tile.goslingModels.length !== 0) {
                // already have the gosling models constructed
                return tile.goslingModels;
            }

            if (!tile.gos.tilePos) {
                // we do not have this information ready yet, so we cannot get tileX
                return;
            }

            // Single tile can contain multiple gosling models if multiple tracks are superposed.
            tile.goslingModels = [];

            const spec = JSON.parse(JSON.stringify(this.options.spec));

            const [trackWidth, trackHeight] = this.dimensions; // actual size of a track

            resolveSuperposedTracks(spec).forEach(resolved => {
                if (resolved.mark === 'brush') {
                    // interactive brushes are drawn by another plugin track, called `gosling-brush`
                    return;
                }

                if (!tile.gos.tabularData) {
                    // If the data is not already stored in a tabular form, convert them.
                    const { tileX, tileY, tileWidth, tileHeight } = this.getTilePosAndDimensions(
                        tile.gos.zoomLevel,
                        tile.gos.tilePos,
                        this.tilesetInfo.bins_per_dimension || this.tilesetInfo?.tile_size
                    );

                    tile.gos.tabularData = getTabularData(resolved, {
                        ...tile.gos,
                        tileX,
                        tileY,
                        tileWidth,
                        tileHeight,
                        tileSize: this.tileSize
                    });
                }

                tile.gos.tabularDataFiltered = Array.from(tile.gos.tabularData);

                /*
                 * Data Transformation applied to each of the overlaid tracks.
                 */
                if (resolved.dataTransform) {
                    resolved.dataTransform.forEach(t => {
                        switch (t.type) {
                            case 'filter':
                                tile.gos.tabularDataFiltered = filterData(t, tile.gos.tabularDataFiltered);
                                break;
                            case 'concat':
                                tile.gos.tabularDataFiltered = concatString(t, tile.gos.tabularDataFiltered);
                                break;
                            case 'replace':
                                tile.gos.tabularDataFiltered = replaceString(t, tile.gos.tabularDataFiltered);
                                break;
                            case 'log':
                                tile.gos.tabularDataFiltered = calculateData(t, tile.gos.tabularDataFiltered);
                                break;
                            case 'exonSplit':
                                tile.gos.tabularDataFiltered = splitExon(
                                    t,
                                    tile.gos.tabularDataFiltered,
                                    resolved.assembly
                                );
                                break;
                            case 'genomicLength':
                                tile.gos.tabularDataFiltered = calculateGenomicLength(t, tile.gos.tabularDataFiltered);
                                break;
                            case 'svType':
                                tile.gos.tabularDataFiltered = inferSvType(t, tile.gos.tabularDataFiltered);
                                break;
                            case 'coverage':
                                tile.gos.tabularDataFiltered = aggregateCoverage(
                                    t,
                                    tile.gos.tabularDataFiltered,
                                    this._xScale.copy()
                                );
                                break;
                            case 'subjson':
                                tile.gos.tabularDataFiltered = parseSubJSON(t, tile.gos.tabularDataFiltered);
                                break;
                            case 'displace':
                                tile.gos.tabularDataFiltered = displace(
                                    t,
                                    tile.gos.tabularDataFiltered,
                                    this._xScale.copy()
                                );
                                break;
                        }
                    });
                }

                // TODO: Remove the following block entirely and use the `rawData` API in the Editor (June-02-2022)
                // Send data preview to the editor so that it can be shown to users.
                try {
                    if (PubSub) {
                        const NUM_OF_ROWS_IN_PREVIEW = 100;
                        const numOrRows = tile.gos.tabularDataFiltered.length;
                        PubSub.publish('data-preview', {
                            id: this.viewUid,
                            dataConfig: JSON.stringify({ data: resolved.data }),
                            data:
                                NUM_OF_ROWS_IN_PREVIEW > numOrRows
                                    ? tile.gos.tabularDataFiltered
                                    : sampleSize(tile.gos.tabularDataFiltered, NUM_OF_ROWS_IN_PREVIEW)
                            // ...
                        });
                    }
                } catch (e) {
                    // ..
                }

                // Replace width and height information with the actual values for responsive encoding
                const axisSize = IsXAxis(resolved) ? HIGLASS_AXIS_SIZE : 0; // Why the axis size must be added here?
                const [w, h] = [trackWidth, trackHeight + axisSize];
                const circularFactor = Math.min(w, h) / Math.min(resolved.width, resolved.height);
                if (resolved.innerRadius) {
                    resolved.innerRadius = resolved.innerRadius * circularFactor;
                }
                if (resolved.outerRadius) {
                    resolved.outerRadius = resolved.outerRadius * circularFactor;
                }
                resolved.width = w;
                resolved.height = h;

                // Construct separate gosling models for individual tiles
                const gm = new GoslingTrackModel(resolved, tile.gos.tabularDataFiltered, this.options.theme);

                // Add a track model to the tile object
                tile.goslingModels.push(gm);
            });

            return tile.goslingModels;
        }

        getIndicesOfVisibleDataInTile(tile: any) {
            const visible = this._xScale.range();

            if (!this.tilesetInfo) return [null, null];

            const { tileX, tileWidth } = this.getTilePosAndDimensions(
                tile.gos.zoomLevel,
                tile.gos.tilePos,
                this.tilesetInfo.bins_per_dimension || this.tilesetInfo?.tile_size
            );

            const tileXScale = HGC.libraries.d3Scale
                .scaleLinear()
                .domain([0, this.tilesetInfo?.tile_size || this.tilesetInfo?.bins_per_dimension])
                .range([tileX, tileX + tileWidth]);

            const start = Math.max(0, Math.round(tileXScale.invert(this._xScale.invert(visible[0]))));
            const end = Math.min(tile.gos.dense.length, Math.round(tileXScale.invert(this._xScale.invert(visible[1]))));

            return [start, end];
        }

        /**
         * Returns the minimum in the visible area (not visible tiles)
         */
        minVisibleValue() {}

        /**
         * Returns the maximum in the visible area (not visible tiles)
         */
        maxVisibleValue() {}

        exportSVG() {} // We do not support SVG export

        /**
         * From all tiles and overlaid tracks, collect element(s) that are withing a mouse position.
         */
        getElementsWithinMouse(mouseX: number, mouseY: number) {
            // Collect all gosling track models
            const models: GoslingTrackModel[] = this.visibleAndFetchedTiles()
                .map(tile => tile.goslingModels ?? [])
                .flat();

            // TODO: `Omit` this properties in the schema of individual overlaid tracks.
            // These should be defined only once for a group of overlaid traks (09-May-2022)
            // See https://github.com/gosling-lang/gosling.js/issues/677
            const mouseEvents = this.options.spec.experimental?.mouseEvents;
            const multiHovering = IsMouseEventsDeep(mouseEvents) && mouseEvents.enableMouseOverOnMultipleMarks;
            const idField = IsMouseEventsDeep(mouseEvents) && mouseEvents.groupMarksByField;

            // Collect all mouse event data from tiles and overlaid tracks
            const mergedCapturedElements: MouseEventData[] = models
                .map(model => model.getMouseEventModel().findAll(mouseX, mouseY, true))
                .flat();

            if (!multiHovering) {
                // Select only one on the top of a cursor
                mergedCapturedElements.splice(1, mergedCapturedElements.length - 1);
            }

            // Iterate again to select sibling marks (e.g., entire glyphs)
            if (mergedCapturedElements.length !== 0 && idField) {
                const source = Array.from(mergedCapturedElements);
                models.forEach(model => {
                    const siblings = model.getMouseEventModel().getSiblings(source, idField);
                    mergedCapturedElements.push(...siblings);
                });
            }

            return mergedCapturedElements;
        }

        /**
         * Highlight marks that are either mouse overed or selected.
         */
        highlightMarks(
            g: Graphics,
            marks: MouseEventData[],
            style: {
                stroke: string;
                strokeWidth: number;
                strokeOpacity: number;
                color: string;
                opacity: number;
            }
        ) {
            g.lineStyle(
                style.strokeWidth,
                colorToHex(style.stroke),
                style.strokeOpacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );
            g.beginFill(colorToHex(style.color), style.color === 'none' ? 0 : style.opacity);

            marks.forEach(d => {
                if (d.type === 'point') {
                    const [x, y, r = 3] = d.polygon;
                    g.drawCircle(x, y, r);
                } else if (d.type === 'line') {
                    g.moveTo(d.polygon[0], d.polygon[1]);
                    flatArrayToPairArray(d.polygon).map(d => g.lineTo(d[0], d[1]));
                } else {
                    g.drawPolygon(d.polygon);
                }
            });
        }

        onRangeBrush(range: [number, number] | null, skipApiTrigger = false) {
            this.pMouseSelection.clear();

            if (range === null) {
                // brush just removed
                if (!skipApiTrigger) {
                    publish('rangeSelect', { id: this.viewUid, genomicRange: null, data: [] });
                }
                return;
            }

            const [startX, endX] = range;

            // Collect all gosling track models
            const models: GoslingTrackModel[] = this.visibleAndFetchedTiles()
                .map(tile => tile.goslingModels ?? [])
                .flat();

            // Collect all mouse event data from tiles and overlaid tracks
            let capturedElements: MouseEventData[] = models
                .map(model => model.getMouseEventModel().findAllWithinRange(startX, endX, true))
                .flat();

            // Deselect marks if their siblings are not selected.
            // e.g., if only one exon is selected in a gene, we do not select it.
            const mouseEvents = this.options.spec.experimental?.mouseEvents;
            const idField = IsMouseEventsDeep(mouseEvents) && mouseEvents.groupMarksByField;
            if (capturedElements.length !== 0 && idField) {
                models.forEach(model => {
                    const siblings = model.getMouseEventModel().getSiblings(capturedElements, idField);
                    const siblingIds = Array.from(new Set(siblings.map(d => d.value[idField])));
                    capturedElements = capturedElements.filter(d => siblingIds.indexOf(d.value[idField]) === -1);
                });
            }

            if (capturedElements.length !== 0) {
                // selection effect graphics
                const g = this.pMouseSelection;

                if (this.options.spec.style?.select?.arrange !== 'behind') {
                    // place on the top
                    this.pMain.removeChild(g);
                    this.pMain.addChild(g);
                }

                this.highlightMarks(
                    g,
                    capturedElements,
                    Object.assign({}, DEFAULT_MARK_HIGHLIGHT_STYLE, this.options.spec.style?.select)
                );
            }

            /* API call */
            if (!skipApiTrigger) {
                const genomicRange: [string, string] = [
                    getRelativeGenomicPosition(Math.floor(this._xScale.invert(startX))),
                    getRelativeGenomicPosition(Math.floor(this._xScale.invert(endX)))
                ];

                publish('rangeSelect', {
                    id: this.viewUid,
                    genomicRange,
                    data: capturedElements.map(d => d.value)
                });
            }

            this.forceDraw();
        }

        onMouseDown(mouseX: number, mouseY: number, isAltPressed: boolean) {
            // Record these so that we do not triger click event when dragged.
            this.mouseDownX = mouseX;
            this.mouseDownY = mouseY;

            // Determine whether to activate a range brush
            const mouseEvents = this.options.spec.experimental?.mouseEvents;
            const rangeSelectEnabled = !!mouseEvents || (IsMouseEventsDeep(mouseEvents) && !!mouseEvents.rangeSelect);
            this.isRangeBrushActivated = rangeSelectEnabled && isAltPressed;

            this.pMouseHover.clear();
        }

        onMouseMove(mouseX: number) {
            if (this.options.spec.layout === 'circular') {
                // TODO: We do not yet support range selection on circular tracks
                return;
            }

            if (this.isRangeBrushActivated) {
                this.mRangeBrush.updateRange([mouseX, this.mouseDownX]).drawBrush().visible().disable();
            }
        }

        onMouseUp(mouseX: number, mouseY: number) {
            const mouseEvents = this.options.spec.experimental?.mouseEvents;
            const clickEnabled = !!mouseEvents || (IsMouseEventsDeep(mouseEvents) && !!mouseEvents.click);
            const isDrag = Math.sqrt((this.mouseDownX - mouseX) ** 2 + (this.mouseDownY - mouseY) ** 2) > 1;

            if (!this.isRangeBrushActivated && !isDrag) {
                // Clicking outside the brush should remove the brush and the selection.
                this.mRangeBrush.clear();
                this.pMouseSelection.clear();
            } else {
                // Dragging ended, so enable adjusting the range brush
                this.mRangeBrush.enable();
            }

            this.isRangeBrushActivated = false;

            if (!this.tilesetInfo) {
                // Do not have enough information
                return;
            }

            // click API
            if (!isDrag && clickEnabled) {
                // Identify the current position
                const genomicPosition = getRelativeGenomicPosition(Math.floor(this._xScale.invert(mouseX)));

                // Get elements within mouse
                const capturedElements = this.getElementsWithinMouse(mouseX, mouseY);

                if (capturedElements.length !== 0) {
                    publish('click', {
                        id: this.viewUid,
                        genomicPosition,
                        data: capturedElements.map(d => d.value)
                    });
                }
            }
        }

        onMouseOut() {
            this.isRangeBrushActivated = false;
            document.body.style.cursor = 'default';
            this.pMouseHover.clear();
        }

        getMouseOverHtml(mouseX: number, mouseY: number) {
            if (this.isRangeBrushActivated) {
                // In the middle of drawing range brush.
                return;
            }

            if (!this.tilesetInfo) {
                // Do not have enough information
                return;
            }

            this.pMouseHover.clear();

            // Current position
            const genomicPosition = getRelativeGenomicPosition(Math.floor(this._xScale.invert(mouseX)));

            // Get elements within mouse
            const capturedElements = this.getElementsWithinMouse(mouseX, mouseY);

            // Change cursor
            // https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
            if (capturedElements.length !== 0) {
                document.body.style.cursor = 'pointer';
            } else {
                document.body.style.cursor = 'default';
            }

            if (capturedElements.length !== 0) {
                const mouseEvents = this.options.spec.experimental?.mouseEvents;
                const mouseOverEnabled = !!mouseEvents || (IsMouseEventsDeep(mouseEvents) && !!mouseEvents.mouseOver);
                if (mouseOverEnabled) {
                    // Display mouse over effects
                    const g = this.pMouseHover;

                    if (this.options.spec.style?.mouseOver?.arrange !== 'behind') {
                        // place on the top
                        this.pMain.removeChild(g);
                        this.pMain.addChild(g);
                    }

                    this.highlightMarks(
                        g,
                        capturedElements,
                        Object.assign({}, DEFAULT_MARK_HIGHLIGHT_STYLE, this.options.spec.style?.mouseOver)
                    );

                    // API call
                    publish('mouseOver', {
                        id: this.viewUid,
                        genomicPosition,
                        data: capturedElements.map(d => d.value)
                    });
                }

                // Display a tooltip
                const models = this.visibleAndFetchedTiles()
                    .map(tile => tile.goslingModels ?? [])
                    .flat();

                const firstTooltipSpec = models
                    .find(m => m.spec().tooltip && m.spec().tooltip?.length !== 0)
                    ?.spec().tooltip;

                if (firstTooltipSpec) {
                    let content = firstTooltipSpec
                        .map((d: any) => {
                            const rawValue = capturedElements[0].value[d.field];
                            let value = rawValue;
                            if (d.type === 'quantitative' && d.format) {
                                value = format(d.format)(+rawValue);
                            } else if (d.type === 'genomic') {
                                // e.g., chr1:204133
                                value = getRelativeGenomicPosition(+rawValue);
                            }

                            return (
                                '<tr>' +
                                `<td style='padding: 4px 8px'>${d.alt ?? d.field}</td>` +
                                `<td style='padding: 4px 8px'><b>${value}</b></td>` +
                                '</tr>'
                            );
                        })
                        .join('');

                    content = `<table style='text-align: left; margin-top: 12px'>${content}</table>`;
                    if (capturedElements.length > 1) {
                        content +=
                            `<div style='padding: 4px 8px; margin-top: 4px; text-align: center; color: grey'>` +
                            `${capturedElements.length - 1} Additional Selections...` +
                            '</div>';
                    }
                    return `<div>${content}</div>`;
                }
            }
        }
    }
    return new GoslingTrackClass(args);
}

const goslingIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width={30} height={30}>
    <rect style={{ fill: 'none' }} width="400" height="400" />
    <circle cx="110.62" cy="129.64" r="41.69" />
    <circle style={{ fill: '#fff' }} cx="124.14" cy="114.12" r="10.76" />
    <circle cx="288.56" cy="129.64" r="41.69" />
    <circle style={{ fill: '#fff' }} cx="302.07" cy="114.12" r="10.76" />
    <path
        style={{ fill: '#e18241' }}
        d="M313.1,241.64l8.61-22.09a430.11,430.11,0,0,0-88-15.87L224,225.63A384.54,384.54,0,0,1,313.1,241.64Z"
    />
    <path
        style={{ fill: '#e18241' }}
        d="M208.63,260.53a299.77,299.77,0,0,1,90.56,16.79L308,254.79a371.68,371.68,0,0,0-90-15.47Z"
    />
    <path
        style={{ fill: '#e18241' }}
        d="M174.4,225.56l-9-22a431.34,431.34,0,0,0-88,15.43l8.9,22A385.08,385.08,0,0,1,174.4,225.56Z"
    />
    <path
        style={{ fill: '#e18241' }}
        d="M100.71,276.35a300.51,300.51,0,0,1,87.91-15.82L180,239.29a372.51,372.51,0,0,0-88.3,14.76Z"
    />
    <path
        style={{ fill: '#e18241' }}
        d="M106.52,290.71c27.53,13.92,59.05,21.34,92.05,21.34h0c33.68,0,65.83-7.72,93.75-22.2a291.31,291.31,0,0,0-186.33-.4Z"
    />
</svg>`;

GoslingTrack.config = {
    type: 'gosling-track',
    datatype: ['multivec', 'epilogos'],
    rotatable: true,
    local: false,
    orientation: '1d-horizontal',
    thumbnail: new DOMParser().parseFromString(goslingIcon, 'text/xml').documentElement,
    availableOptions: [
        'labelPosition',
        'labelColor',
        'labelTextOpacity',
        'labelBackgroundOpacity',
        'trackBorderWidth',
        'trackBorderColor',
        'trackType',
        'scaledHeight',
        'backgroundColor',
        'barBorder',
        'sortLargestOnTop',
        'theme',
        'axisPositionHorizontal' // TODO: support this
    ],
    defaultOptions: {
        labelPosition: 'none',
        labelColor: 'black',
        labelTextOpacity: 0.4,
        trackBorderWidth: 0,
        trackBorderColor: 'black',
        backgroundColor: 'white',
        barBorder: false,
        sortLargestOnTop: true,
        axisPositionHorizontal: 'left',
        theme: 'light'
    }
};

export default GoslingTrack;
