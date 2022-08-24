import type * as PIXI from 'pixi.js';
import * as uuid from 'uuid';
import { isEqual, sampleSize, uniqBy } from 'lodash-es';
import type { ScaleLinear } from 'd3-scale';
import type { SingleTrack, OverlaidTrack, Datum, EventStyle, GenomicPosition, Assembly } from '@gosling.schema';
import type { CompleteThemeDeep } from '../core/utils/theme';
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
import {
    Is2DTrack,
    IsChannelDeep,
    IsMouseEventsDeep,
    IsXAxis,
    isTabularDataFetcher,
    hasDataTransform
} from '../core/gosling.schema.guards';
import { HIGLASS_AXIS_SIZE } from '../core/higlass-model';
import type { MouseEventData } from '../gosling-mouse-event/mouse-event-model';
import { flatArrayToPairArray } from '../core/utils/array';
import { BamDataFetcher } from '../data-fetchers';
import { LinearBrushModel } from '../gosling-brush/linear-brush-model';
import { isPointInsideDonutSlice } from '../gosling-mouse-event/polygon';
import type { Tile as _Tile, TileData, TileDataBase } from '@higlass/services';
import type { TabularDataFetcher } from 'src/data-fetchers/utils';
import { createPluginTrack, PluginTrackFactory } from 'src/core/utils/define-plugin-track';
import type { TrackConfig } from '@higlass/types';
import { getTheme } from 'gosling-theme';

// Set `true` to print in what order each function is called
export const PRINT_RENDERING_CYCLE = false;

// For using libraries, refer to https://github.com/higlass/higlass/blob/f82c0a4f7b2ab1c145091166b0457638934b15f3/app/scripts/configs/available-for-plugins.js
// `getTilePosAndDimensions()` definition: https://github.com/higlass/higlass/blob/1e1146409c7d7c7014505dd80d5af3e9357c77b6/app/scripts/Tiled1DPixiTrack.js#L133
// Refer to the following already supported graphics:
// https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/PixiTrack.js#L115

const DEFAULT_MOUSE_EVENT_STYLE: Required<EventStyle> = {
    stroke: 'black',
    strokeWidth: 1,
    strokeOpacity: 1,
    color: 'none',
    opacity: 1,
    arrange: 'front'
};

interface GoslingTrackOptions {
    spec: SingleTrack | OverlaidTrack;
    theme: CompleteThemeDeep;
    showMousePosition?: boolean;
}

/** Tile data used in Gosling data fetchers */
interface TabularTileData extends TileDataBase {
    tabularData: Datum[];
}

/** Mutated type of `Tile` that includes Gosling's tile data, i.e., tabular tile data */
export interface Tile extends Omit<_Tile, 'tileData'> {
    tileData: TileData | TabularTileData;
}

interface ProcessedTileInfo {
    /** Single tile can contain multiple gosling models if multiple tracks are superposed */
    goslingModels: GoslingTrackModel[];
    tabularData: Datum[];
    /** Flag variable that indicate that rendering of this tile should be skipped */
    skipRendering: boolean;
}

function initProcessedTileInfo(): ProcessedTileInfo {
    return { goslingModels: [], tabularData: [], skipRendering: false };
}

const config: TrackConfig<GoslingTrackOptions> = {
    type: 'gosling-track',
    datatype: ['multivec', 'epilogos'],
    orientation: '1d-horizontal',
    // @ts-expect-error missing default spec
    defaultOptions: {
        // TODO: Are any of these used?
        // labelPosition: 'none',
        // labelColor: 'black',
        // labelTextOpacity: 0.4,
        // trackBorderWidth: 0,
        // trackBorderColor: 'black',
        // backgroundColor: 'white',
        // barBorder: false,
        // sortLargestOnTop: true,
        // axisPositionHorizontal: 'left',
        theme: getTheme('light'),
    }
};

const factory: PluginTrackFactory<Tile, GoslingTrackOptions> = (HGC, context, options) => {

    // Services
    const { tileProxy } = HGC.services;

    /* Custom loading label */
    const loadingTextStyle = getTextStyle({ color: 'black', size: 12 });

    class GoslingTrackClass extends HGC.tracks.BarTrack<Tile, typeof options> {
        // This is tracking the xScale of an entire view, which is used when no tiling concepts are used
        drawnAtScale = HGC.libraries.d3Scale.scaleLinear();
        scalableGraphics: Record<string, PIXI.Graphics> = {};
        extent = { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER };
        hideMousePosition?: () => void;

        private tileSize: number;
        private mRangeBrush: LinearBrushModel;

        private assembly?: Assembly;
        private processedTileInfo: Record<string, ProcessedTileInfo>;
        // TODO: add members that are used explicitly in the code
        //
        // Brushes on the color legend
        private gLegend? = HGC.libraries.d3Selection.select(context.svgElement).append('g');
        private pMouseHover = new HGC.libraries.PIXI.Graphics();
        private pMouseSelection = new HGC.libraries.PIXI.Graphics();
        private isRangeBrushActivated = false;
        private gBrush = HGC.libraries.d3Selection.select(context.svgElement).append('g');

        private loadingTextStyleObj = new HGC.libraries.PIXI.TextStyle(loadingTextStyle);
        private loadingTextBg = new HGC.libraries.PIXI.Graphics();
        private loadingText = new HGC.libraries.PIXI.Text('', loadingTextStyle);

        private svgData: unknown[] = [];
        private textGraphics: unknown[] = [];
        /** used to improve the performance of text rendering */
        private textsBeingUsed = 0;
        private loadingStatus = { loading: 0, processing: 0, rendering: 0 };

        private prevVisibleAndFetchedTiles?: Tile[];
        private oldDimensions?: [number, number];
        private xDomain?: number[];
        private xRange?: number[];

        private mouseDownX = 0;
        private mouseDownY = 0;

        constructor() {
            super(context, options);

            context.dataFetcher.track = this;
            this.processedTileInfo = {};
            this.assembly = this.options.spec.assembly;

            // Add unique IDs to each of the overlaid tracks that will be rendered independently.
            if ('overlay' in this.options.spec) {
                this.options.spec.overlay = (this.options.spec as OverlaidTrack).overlay.map(o => {
                    return { ...o, _renderingId: uuid.v1() };
                });
            } else {
                this.options.spec._renderingId = uuid.v1();
            }

            this.fetchedTiles = {};
            this.tileSize = this.tilesetInfo?.tile_size ?? 1024;

            const { valid, errorMessages } = validateTrack(this.options.spec);

            if (!valid) {
                console.warn('The specification of the following track is invalid', errorMessages, this.options.spec);
            }

            // Graphics for highlighting visual elements under the cursor
            this.pMain.addChild(this.pMouseHover);
            this.pMain.addChild(this.pMouseSelection);

            // Enable click event
            this.pMask.interactive = true;
            this.mRangeBrush = new LinearBrushModel(this.gBrush, HGC.libraries, this.options.spec.style?.brush);
            this.mRangeBrush.on('brush', this.onRangeBrush.bind(this));

            this.pMask.on('mousedown', (e: PIXI.InteractionEvent) => {
                const { x, y } = e.data.getLocalPosition(this.pMain);
                this.onMouseDown(x, y, e.data.originalEvent.altKey);
            });
            this.pMask.on('mouseup', (e: PIXI.InteractionEvent) => {
                const { x, y } = e.data.getLocalPosition(this.pMain);
                this.onMouseUp(x, y);
            });
            this.pMask.on('mousemove', (e: PIXI.InteractionEvent) => {
                const { x } = e.data.getLocalPosition(this.pMain);
                this.onMouseMove(x);
            });
            this.pMask.on('mouseout', this.onMouseOut.bind(this));

            // Remove a mouse graphic if created by a parent, and draw ourselves
            // https://github.com/higlass/higlass/blob/38f0c4415f0595c3b9d685a754d6661dc9612f7c/app/scripts/utils/show-mouse-position.js#L28
            // this.getIsFlipped = () => { return this.originalSpec.orientation === 'vertical' };
            this.flipText = this.options.spec.orientation === 'vertical';

            if (this.hideMousePosition) {
                this.hideMousePosition();
                this.hideMousePosition = undefined;
            }
            if (this.options?.showMousePosition && !this.hideMousePosition) {
                this.hideMousePosition = HGC.utils.showMousePosition(
                    this,
                    Is2DTrack(resolveSuperposedTracks(this.options.spec)[0]),
                    this.isShowGlobalMousePosition()
                );
            }

            // We do not use HiGlass' trackNotFoundText
            this.pLabel.removeChild(this.trackNotFoundText);

            this.loadingText.anchor.x = 1;
            this.loadingText.anchor.y = 1;
            this.pLabel.addChild(this.loadingTextBg);
            this.pLabel.addChild(this.loadingText);

            // This improves the arc/link rendering performance
            HGC.libraries.PIXI.GRAPHICS_CURVES.adaptive = this.options.spec.style?.enableSmoothPath ?? false;
            if (HGC.libraries.PIXI.GRAPHICS_CURVES.adaptive) {
                HGC.libraries.PIXI.GRAPHICS_CURVES.maxLength = 1;
                HGC.libraries.PIXI.GRAPHICS_CURVES.maxSegments = 2048 * 10;
            }
        }

        /* ----------------------------------- RENDERING CYCLE ----------------------------------- */

        // !! Be aware that this function is called in the middle of `constructor()` by a parent class (i.e., `super(...)`).
        // https://github.com/higlass/higlass/blob/387a03e877dcfa4c2cfeabc0869375b58c0b362d/app/scripts/TiledPixiTrack.js#L216
        // This means, some class properties can be still `undefined`.
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
                this.processAllTiles();

                // This function calls `drawTile` on each tile.
                super.draw();

                // Record tiles so that we ignore loading same tiles again
                this.prevVisibleAndFetchedTiles = this.visibleAndFetchedTiles();
            };

            if (
                isTabularDataFetcher(this.dataFetcher) &&
                !isEqual(this.visibleAndFetchedTiles(), this.prevVisibleAndFetchedTiles)
            ) {
                this.updateTileAsync(this.dataFetcher as TabularDataFetcher<Datum>, processTilesAndDraw);
            } else {
                processTilesAndDraw();
            }

            // Based on the updated marks, update range selection
            this.mRangeBrush?.drawBrush(true);
        }

        /*
         * Do whatever is necessary before rendering a new tile. This function is called from `receivedTiles()`.
         * (Refer to https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/HorizontalLine1DPixiTrack.js#L50)
         */
        initTile(tile: Tile) {
            if (PRINT_RENDERING_CYCLE) console.warn('initTile(tile)');

            // super.initTile(tile); // This calls `drawTile()`

            // Since `super.initTile(tile)` prints warning, we call `drawTile` ourselves without calling `super.initTile(tile)`.
            this.drawTile(tile);
        }

        updateTile(/* tile: Tile */) {} // Never mind about this function for the simplicity.
        renderTile(/* tile: Tile */) {} // Never mind about this function for the simplicity.

        /**
         * Display a tile upon receiving a new one or when explicitly called by a developer, e.g., calling `this.draw()`
         */
        drawTile(tile: Tile) {
            if (PRINT_RENDERING_CYCLE) console.warn('drawTile(tile)');

            tile.drawnAtScale = this._xScale.copy(); // being used in `super.draw()`

            const tileInfo = this.processedTileInfo[tile.tileId];
            if (!tileInfo) {
                // We do not have a track model prepared to visualize
                return;
            }

            tile.graphics?.clear();
            tile.graphics?.removeChildren();

            // !! A single tile contains one track or multiple tracks overlaid
            /* Render marks and embellishments */
            tileInfo.goslingModels.forEach((model: GoslingTrackModel) => {
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
        rerender(newOptions: GoslingTrackOptions) {
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

            this.processAllTiles(true);
            this.draw();
            this.forceDraw();
        }

        clearMouseEventData() {
            this.visibleAndFetchedGoslingModels().forEach(model => model.getMouseEventModel().clear());
        }

        /**
         * End of the rendering cycle. This function is called when the track is removed entirely.
         */
        remove() {
            super.remove();

            if (this.gLegend) {
                this.gLegend.remove();
                this.gLegend = undefined;
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
            // visibleAndFetched.map((tile: Tile) => this.initTile(tile));
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
        async updateTileAsync<T extends Datum>(tabularDataFetcher: TabularDataFetcher<T>, callback: () => void) {
            if (!this.tilesetInfo) return;
            this.xDomain = this._xScale.domain();
            this.xRange = this._xScale.range();

            const tabularData = await tabularDataFetcher.getTabularData(
                Object.values(this.fetchedTiles).map(x => x.remoteId)
            );
            const tiles = this.visibleAndFetchedTiles();
            if (tiles?.[0]) {
                const tile = tiles[0];
                const [refTile] = HGC.utils.trackUtils.calculate1DVisibleTiles(this.tilesetInfo, this._xScale);
                tile.tileData.zoomLevel = refTile[0];
                tile.tileData.tilePos = [refTile[1], refTile[1]];
                (tile.tileData as TabularTileData).tabularData = tabularData;
            }

            callback();
        }

        /**
         * Stretch out the scaleble graphics to have proper effect upon zoom and pan.
         */
        scaleScalableGraphics(
            graphics: PIXI.Graphics[],
            xScale: ScaleLinear<number, number>,
            drawnAtScale: ScaleLinear<number, number>
        ) {
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
         * Collect all gosling models that correspond to the tiles that are both visible and fetched.
         */
        visibleAndFetchedGoslingModels() {
            return this.visibleAndFetchedTiles().flatMap(
                tile => this.processedTileInfo[tile.tileId]?.goslingModels ?? []
            );
        }

        // !! This is called in the constructor, `super(context, options)`. So be aware to use variables that is prepared.
        calculateVisibleTiles() {
            if (!this.tilesetInfo) return;
            if (isTabularDataFetcher(this.dataFetcher)) {
                const tiles = HGC.utils.trackUtils.calculate1DVisibleTiles(this.tilesetInfo, this._xScale);
                const maxTileWith =
                    this.tilesetInfo.max_tile_width ?? this.dataFetcher.MAX_TILE_WIDTH ?? Number.MAX_SAFE_INTEGER;

                for (const tile of tiles) {
                    const { tileWidth } = this.getTilePosAndDimensions(tile[0], [tile[1], tile[1]]);
                    this.forceDraw();
                    if (tileWidth > maxTileWith) {
                        return;
                    }
                }

                this.setVisibleTiles(tiles);
            } else {
                if (!this.tilesetInfo) {
                    // if we don't know anything about this dataset, no point in trying to get tiles
                    return;
                }

                // calculate the zoom level given the scales and the data bounds
                const zoomLevel = this.calculateZoomLevel();

                if ('resolutions' in this.tilesetInfo) {
                    const sortedResolutions = this.tilesetInfo.resolutions
                        .map((x: number) => +x)
                        .sort((a: number, b: number) => b - a);

                    const xTiles = tileProxy.calculateTilesFromResolution(
                        sortedResolutions[zoomLevel],
                        this._xScale,
                        this.tilesetInfo.min_pos[0],
                        this.tilesetInfo.max_pos[0]
                    );

                    let yTiles: number[] | undefined;
                    if (Is2DTrack(resolveSuperposedTracks(this.options.spec)[0])) {
                        // it makes sense only when the y-axis is being used for a genomic field
                        yTiles = tileProxy.calculateTilesFromResolution(
                            sortedResolutions[zoomLevel],
                            this._yScale,
                            this.tilesetInfo.min_pos[0],
                            this.tilesetInfo.max_pos[0]
                        );
                    }

                    const tiles = this.tilesToId(xTiles, yTiles, zoomLevel);

                    this.setVisibleTiles(tiles);
                } else {
                    const xTiles = tileProxy.calculateTiles(
                        zoomLevel,
                        this.relevantScale(),
                        this.tilesetInfo.min_pos[0],
                        this.tilesetInfo.max_pos[0],
                        this.tilesetInfo.max_zoom,
                        this.tilesetInfo.max_width
                    );

                    let yTiles: number[] | undefined;
                    if (Is2DTrack(resolveSuperposedTracks(this.options.spec)[0])) {
                        // it makes sense only when the y-axis is being used for a genomic field
                        yTiles = tileProxy.calculateTiles(
                            zoomLevel,
                            this._yScale,
                            this.tilesetInfo.min_pos[1],
                            this.tilesetInfo.max_pos[1],
                            this.tilesetInfo.max_zoom,
                            // @ts-expect-error what is max_width1?
                            this.tilesetInfo.max_width1 ?? this.tilesetInfo.max_width
                        );
                    }

                    const tiles = this.tilesToId(xTiles, yTiles, zoomLevel);
                    this.setVisibleTiles(tiles);
                }
            }
        }

        private get binsPerTile() {
            let maybeValue: number | undefined;
            if (this.tilesetInfo) {
                maybeValue =
                    'bins_per_dimension' in this.tilesetInfo
                        ? this.tilesetInfo.bins_per_dimension
                        : this.tilesetInfo.tile_size;
            }
            return maybeValue ?? 256;
        }

        /**
         * Get the tile's position in its coordinate system.
         */
        getTilePosAndDimensions(zoomLevel: number, tilePos: [number, number]) {
            if (!this.tilesetInfo) {
                throw Error('tilesetInfo not parsed');
            }

            if ('resolutions' in this.tilesetInfo) {
                const sortedResolutions = this.tilesetInfo.resolutions
                    .map((x: number) => +x)
                    .sort((a: number, b: number) => b - a);

                // A resolution specifies the number of BP per bin
                const chosenResolution = sortedResolutions[zoomLevel];

                const [xTilePos, yTilePos] = tilePos;

                const tileWidth = chosenResolution * this.binsPerTile;
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

        /** Convert tile positions to tile IDs */
        tilesToId(
            xTiles: number[],
            yTiles: number[] | undefined,
            zoomLevel: number
        ): [number, number][] | [number, number, number][] {
            if (!yTiles) {
                // this means only the `x` axis is being used
                return xTiles.map(x => [zoomLevel, x]);
            } 
            // this means both `x` and `y` axes are being used together
            const tiles: [number, number, number][] = [];
            xTiles.forEach(x => yTiles.forEach(y => tiles.push([zoomLevel, x, y])));
            return tiles;
        }

        receivedTiles(loadedTiles: Record<string, Tile>) {
            // https://github.com/higlass/higlass/blob/38f0c4415f0595c3b9d685a754d6661dc9612f7c/app/scripts/TiledPixiTrack.js#L637
            super.receivedTiles(loadedTiles);
            // some items in this.fetching are removed
            isTabularDataFetcher(this.dataFetcher) && this.drawLoadingCue();
        }

        // https://github.com/higlass/higlass/blob/38f0c4415f0595c3b9d685a754d6661dc9612f7c/app/scripts/TiledPixiTrack.js#L342
        removeOldTiles() {
            super.removeOldTiles(); // some items are added to this.fetching
            isTabularDataFetcher(this.dataFetcher) && this.drawLoadingCue();
        }

        /**
         * Show visual cue during waiting for visualizations being rendered.
         */
        drawLoadingCue() {
            if (this.fetching.size) {
                const margin = 6;

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
            const models = this.visibleAndFetchedGoslingModels();
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
            const includesDisplaceTransform = hasDataTransform(this.options.spec, 'displace');
            // we do not need to combine dense tiles (from multivec, vector, matrix)
            const hasDenseTiles = () => {
                const tiles = this.visibleAndFetchedTiles();
                return tiles.length >= 1 && 'dense' in tiles[0].tileData;
            };
            // BAM data fetcher already combines the datasets;
            const isBamDataFetcher = this.dataFetcher instanceof BamDataFetcher;
            return (includesDisplaceTransform && !hasDenseTiles()) || isBamDataFetcher;
        }

        /**
         * Combile multiple tiles into the last tile.
         * This is sometimes necessary, for example, when applying a displacement algorithm to all tiles at once.
         */
        combineAllTilesIfNeeded() {
            if (!this.shouldCombineTiles()) return;

            const tiles = this.visibleAndFetchedTiles();

            if (!tiles || tiles.length <= 1) {
                // Does not make sense to combine tiles
                return;
            }

            // Increase the size of tiles by length
            this.tileSize = (this.tilesetInfo?.tile_size ?? 1024) * tiles.length;

            let merged: Datum[] = [];

            tiles.forEach((tile, i) => {
                const tileInfo = this.processedTileInfo[tile.tileId];
                if (tileInfo) {
                    // Combine data
                    merged = [...merged, ...tileInfo.tabularData];

                    // Since we merge the data to the first one, skip rendering the rest
                    tileInfo.skipRendering = i !== 0;
                }
            });

            const firstTileInfo = this.processedTileInfo[tiles[0].tileId];
            firstTileInfo.tabularData = merged;

            // Remove duplicated if any. Sparse tiles can have duplications.
            if (firstTileInfo.tabularData[0]?.uid) {
                firstTileInfo.tabularData = uniqBy(firstTileInfo.tabularData, 'uid');
            }
        }

        processAllTiles(force = false) {
            this.tileSize = this.tilesetInfo?.tile_size ?? 1024;

            const tiles = this.visibleAndFetchedTiles();

            // generated tabular data
            tiles.forEach(tile => this.generateTabularData(tile, force));

            // combine tabular data to the first tile if needed
            this.combineAllTilesIfNeeded();

            // apply data transforms to the tabular data and generate track models
            const models = tiles.flatMap(tile => this.transformDataAndCreateModels(tile));

            shareScaleAcrossTracks(models);

            const flatTileData = ([] as Datum[]).concat(...models.map(d => d.data()));
            if (flatTileData.length !== 0) {
                publish('rawData', { id: context.viewUid, data: flatTileData });
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

        /** Get resolved tracks that should be rendered by a `gosling-track` track */
        getResolvedTracks() {
            const copy = structuredClone(this.options.spec);
            // Brushes are drawn by another plugin track.
            return resolveSuperposedTracks(copy).filter(t => t.mark !== 'brush');
        }

        /**
         * Construct tabular data from a higlass tileset and a gosling track model.
         * Return the generated gosling track model.
         */
        generateTabularData(tile: Tile, force = false) {
            if (this.processedTileInfo[tile.tileId] && !force) {
                // we do not need to re-construct tabular data
                return;
            }

            if (!tile.tileData.tilePos) {
                // we do not have this information ready yet, i.e., cannot calculate `tileX`
                return;
            }

            const tileInfo = initProcessedTileInfo();
            const resolvedTracks = this.getResolvedTracks();

            if (resolvedTracks.length === 0) {
                // we do not have enough track to display
                return [];
            }

            /* Create tabular data */
            // The data spec is identical in all overlaid tracks, so we only need the first one.
            const firstResolvedTrack = resolvedTracks[0];

            if ('tabularData' in tile.tileData) {
                // some data fetchers directly generates `tabularData`
                tileInfo.tabularData = tile.tileData.tabularData;
            } else {
                // generate tabular data
                const { tileX, tileY, tileWidth, tileHeight } = this.getTilePosAndDimensions(
                    tile.tileData.zoomLevel,
                    tile.tileData.tilePos!,
                );

                const sparse = 'length' in tile.tileData ? Array.from(tile.tileData) : [];
                const tabularData = getTabularData(firstResolvedTrack, {
                    ...tile.tileData,
                    sparse,
                    tileX,
                    tileY,
                    tileWidth,
                    tileHeight,
                    tileSize: this.tileSize
                });
                if (tabularData) {
                    tileInfo.tabularData = tabularData;
                }
            }

            this.processedTileInfo[tile.tileId] = tileInfo;
        }

         /**
         * Apply data transformation to each of the overlaid tracks and generate gosling models
         */
        transformDataAndCreateModels(tile: Tile) {
            const tileInfo = this.processedTileInfo[tile.tileId];

            if (!tileInfo || tileInfo.skipRendering) {
                // this probably means the tile data has been merged to another tile
                // so, no need to create track models
                return [];
            }

            // clear the array first
            tileInfo.goslingModels = [];

            const resolvedTracks = this.getResolvedTracks();
            resolvedTracks.forEach(resolvedSpec => {
                let tabularDataTransformed = Array.from(tileInfo.tabularData);
                resolvedSpec.dataTransform?.forEach(t => {
                    switch (t.type) {
                        case 'filter':
                            tabularDataTransformed = filterData(t, tabularDataTransformed);
                            break;
                        case 'concat':
                            tabularDataTransformed = concatString(t, tabularDataTransformed);
                            break;
                        case 'replace':
                            tabularDataTransformed = replaceString(t, tabularDataTransformed);
                            break;
                        case 'log':
                            tabularDataTransformed = calculateData(t, tabularDataTransformed);
                            break;
                        case 'exonSplit':
                            tabularDataTransformed = splitExon(t, tabularDataTransformed, resolvedSpec.assembly);
                            break;
                        case 'genomicLength':
                            tabularDataTransformed = calculateGenomicLength(t, tabularDataTransformed);
                            break;
                        case 'svType':
                            tabularDataTransformed = inferSvType(t, tabularDataTransformed);
                            break;
                        case 'coverage':
                            tabularDataTransformed = aggregateCoverage(t, tabularDataTransformed, this._xScale.copy());
                            break;
                        case 'subjson':
                            tabularDataTransformed = parseSubJSON(t, tabularDataTransformed);
                            break;
                        case 'displace':
                            tabularDataTransformed = displace(t, tabularDataTransformed, this._xScale.copy());
                            break;
                    }
                });

                // TODO: Remove the following block entirely and use the `rawData` API in the Editor (June-02-2022)
                // Send data preview to the editor so that it can be shown to users.
                try {
                    if (PubSub) {
                        const NUM_OF_ROWS_IN_PREVIEW = 100;
                        const numOrRows = tabularDataTransformed.length;
                        PubSub.publish('data-preview', {
                            id: context.viewUid,
                            dataConfig: JSON.stringify({ data: resolvedSpec.data }),
                            data:
                                NUM_OF_ROWS_IN_PREVIEW > numOrRows
                                    ? tabularDataTransformed
                                    : sampleSize(tabularDataTransformed, NUM_OF_ROWS_IN_PREVIEW)
                            // ...
                        });
                    }
                } catch (e) {
                    // ..
                }

                // Replace width and height information with the actual values for responsive encoding
                const [trackWidth, trackHeight] = this.dimensions; // actual size of a track
                const axisSize = IsXAxis(resolvedSpec) ? HIGLASS_AXIS_SIZE : 0; // Why the axis size must be added here?
                const [w, h] = [trackWidth, trackHeight + axisSize];
                const circularFactor = Math.min(w, h) / Math.min(resolvedSpec.width!, resolvedSpec.height!);
                if (resolvedSpec.innerRadius) {
                    resolvedSpec.innerRadius = resolvedSpec.innerRadius * circularFactor;
                }
                if (resolvedSpec.outerRadius) {
                    resolvedSpec.outerRadius = resolvedSpec.outerRadius * circularFactor;
                }
                resolvedSpec.width = w;
                resolvedSpec.height = h;

                // Construct separate gosling models for individual tiles
                const model = new GoslingTrackModel(resolvedSpec, tabularDataTransformed, this.options.theme);

                // Add a track model to the tile object
                tileInfo.goslingModels.push(model);
            });

            return tileInfo.goslingModels;
        }

        getIndicesOfVisibleDataInTile(tile: Tile): [number, number] {
            const visible = this._xScale.range();

            if (!this.tilesetInfo || !tile.tileData.tilePos || !('dense' in tile.tileData)) {
                return [0, 0];
            }

            const { tileX, tileWidth } = this.getTilePosAndDimensions(
                tile.tileData.zoomLevel,
                tile.tileData.tilePos,
            );

            const tileXScale = HGC.libraries.d3Scale
                .scaleLinear()
                .domain([0, this.binsPerTile])
                .range([tileX, tileX + tileWidth]);

            const start = Math.max(0, Math.round(tileXScale.invert(this._xScale.invert(visible[0]))));
            const end = Math.min(
                tile.tileData.dense.length,
                Math.round(tileXScale.invert(this._xScale.invert(visible[1])))
            );

            return [start, end];
        }


        /**
         * Returns the minimum in the visible area (not visible tiles)
         */
        minVisibleValue() {
            return 0;
        }

        /**
         * Returns the maximum in the visible area (not visible tiles)
         */
        maxVisibleValue() {
            return 0;
        }

        exportSVG(): never {
            throw new Error('exportSVG() not supported for gosling-track');
        } // We do not support SVG export

        /**
         * From all tiles and overlaid tracks, collect element(s) that are withing a mouse position.
         */
        getElementsWithinMouse(mouseX: number, mouseY: number) {
            const models = this.visibleAndFetchedGoslingModels();

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
            g: PIXI.Graphics,
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

        /**
         * Call track events (e.g., `trackClick` or `trackMouseOver`) based on a mouse position and the track display area.
         */
        publishTrackEvents(eventType: 'trackClick' | 'trackMouseOver', mouseX: number, mouseY: number) {
            const [x, y] = this.position;
            const [width, height] = this.dimensions;
            if (this.options.spec.layout === 'circular') {
                const cx = x + width / 2.0;
                const cy = y + height / 2.0;
                const innerRadius = this.options.spec.innerRadius!;
                const outerRadius = this.options.spec.outerRadius!;
                const startAngle = this.options.spec.startAngle!;
                const endAngle = this.options.spec.endAngle!;
                // Call the API function only when the mouse is positioned directly on the track display area
                if (
                    isPointInsideDonutSlice(
                        [mouseX, mouseY],
                        [width / 2.0, height / 2.0],
                        [innerRadius, outerRadius],
                        [startAngle, endAngle]
                    )
                ) {
                    publish(eventType, {
                        id: context.viewUid,
                        spec: structuredClone(this.options.spec),
                        shape: { cx, cy, innerRadius, outerRadius, startAngle, endAngle }
                    });
                }
            } else {
                publish(eventType, {
                    id: context.viewUid,
                    spec: structuredClone(this.options.spec),
                    shape: { x, y, width, height }
                });
            }
        }

        onRangeBrush(range: [number, number] | null, skipApiTrigger = false) {
            this.pMouseSelection.clear();

            if (range === null) {
                // brush just removed
                if (!skipApiTrigger) {
                    publish('rangeSelect', { id: context.viewUid, genomicRange: null, data: [] });
                }
                return;
            }

            const models = this.visibleAndFetchedGoslingModels();
            const [startX, endX] = range;

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
                    Object.assign({}, DEFAULT_MOUSE_EVENT_STYLE, this.options.spec.style?.select)
                );
            }

            /* API call */
            if (!skipApiTrigger) {
                const genomicRange: [GenomicPosition, GenomicPosition] = [
                    getRelativeGenomicPosition(Math.floor(this._xScale.invert(startX)), this.assembly),
                    getRelativeGenomicPosition(Math.floor(this._xScale.invert(endX)), this.assembly)
                ];

                publish('rangeSelect', {
                    id: context.viewUid,
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
            // `trackClick` API
            this.publishTrackEvents('trackClick', mouseX, mouseY);

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

            // `click` API
            if (!isDrag && clickEnabled) {
                // Identify the current position
                const genomicPosition = getRelativeGenomicPosition(
                    Math.floor(this._xScale.invert(mouseX)),
                    this.assembly
                );

                // Get elements within mouse
                const capturedElements = this.getElementsWithinMouse(mouseX, mouseY);

                if (capturedElements.length !== 0) {
                    publish('click', {
                        id: context.viewUid,
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
            // `trackMouseOver` API
            this.publishTrackEvents('trackMouseOver', mouseX, mouseY);

            if (this.isRangeBrushActivated) {
                // In the middle of drawing range brush.
                return '';
            }

            if (!this.tilesetInfo) {
                // Do not have enough information
                return '';
            }

            this.pMouseHover.clear();

            // Current position
            const genomicPosition = getRelativeGenomicPosition(Math.floor(this._xScale.invert(mouseX)), this.assembly);

            // Get elements within mouse
            const capturedElements = this.getElementsWithinMouse(mouseX, mouseY);

            // Change cursor
            // https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
            if (capturedElements.length !== 0) {
                document.body.style.cursor = 'pointer';
            } else {
                document.body.style.cursor = 'default';
            }

            if (capturedElements.length === 0) {
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
                        Object.assign({}, DEFAULT_MOUSE_EVENT_STYLE, this.options.spec.style?.mouseOver)
                    );

                    // API call
                    publish('mouseOver', {
                        id: context.viewUid,
                        genomicPosition,
                        data: capturedElements.map(d => d.value)
                    });
                }

                // Display a tooltip
                const models = this.visibleAndFetchedGoslingModels();

                const firstTooltipSpec = models
                    .find(m => m.spec().tooltip && m.spec().tooltip?.length !== 0)
                    ?.spec().tooltip;

                if (firstTooltipSpec) {
                    let content = firstTooltipSpec
                        .map((d: any) => {
                            const rawValue = capturedElements[0].value[d.field];
                            let value = rawValue;
                            if (d.type === 'quantitative' && d.format) {
                                value = HGC.libraries.d3Format.format(d.format)(+rawValue);
                            } else if (d.type === 'genomic') {
                                // e.g., chr1:204,133
                                const { chromosome, position } = getRelativeGenomicPosition(+rawValue, this.assembly);
                                value = `${chromosome}:${HGC.libraries.d3Format.format(',')(position)}`;
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
            return '';
        }
    }
    return new GoslingTrackClass();
};

export default createPluginTrack(config, factory);
