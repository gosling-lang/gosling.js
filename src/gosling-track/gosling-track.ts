import * as PIXI from 'pixi.js';
import PubSub from 'pubsub-js';
import uuid from 'uuid';
import { sampleSize, uniqBy } from 'lodash';
import { scaleLinear } from 'd3-scale';
import { format } from 'd3-format';
import { drawMark, drawPostEmbellishment, drawPreEmbellishment } from '../core/mark';
import { GoslingTrackModel } from '../core/gosling-track-model';
import { validateTrack } from '../core/utils/validate';
import { drawScaleMark } from '../core/utils/scalable-rendering';
import { shareScaleAcrossTracks } from '../core/utils/scales';
import { resolveSuperposedTracks } from '../core/utils/overlay';
import { SingleTrack, OverlaidTrack, Datum } from '../core/gosling.schema';
import { TooltipData } from '../gosling-tooltip';
import colorToHex from '../core/utils/color-to-hex';
import {
    aggregateCoverage,
    calculateData,
    concatString,
    displace,
    filterData,
    parseSubJSON,
    replaceString,
    rotateMatrix,
    splitExon
} from '../core/utils/data-transform';
import { getTabularData } from './data-abstraction';
import { BAMDataFetcher } from '../data-fetcher/bam';
import { spawn, Worker } from 'threads';
import { getRelativeGenomicPosition } from '../core/utils/assembly';
import { IsChannelDeep, IsRotatedMatrixTrack } from '../core/gosling.schema.guards';

// Set `true` to print in what order each function is called
export const PRINT_RENDERING_CYCLE = false;

function usePrereleaseRendering(spec: SingleTrack | OverlaidTrack) {
    return spec.prerelease?.testUsingNewRectRenderingForBAM && spec.data?.type === 'bam';
}

// For using libraries, refer to https://github.com/higlass/higlass/blob/f82c0a4f7b2ab1c145091166b0457638934b15f3/app/scripts/configs/available-for-plugins.js
// `getTilePosAndDimensions()` definition: https://github.com/higlass/higlass/blob/1e1146409c7d7c7014505dd80d5af3e9357c77b6/app/scripts/Tiled1DPixiTrack.js#L133
// Refer to the following already supported graphics:
// https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/PixiTrack.js#L115

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

    class GoslingTrackClass extends HGC.tracks.BarTrack {
        private originalSpec: SingleTrack | OverlaidTrack;
        private tooltips: TooltipData[];
        private tileSize: number;
        private worker: any;
        // TODO: add members that are used explicitly in the code

        constructor(params: any[]) {
            const [context, options] = params;

            // Check whether to load a worker
            let bamWorker;
            if (usePrereleaseRendering(options.spec)) {
                try {
                    bamWorker = spawn(new Worker('../data-fetcher/bam/bam-worker'));
                    context.dataFetcher = new BAMDataFetcher(HGC, context.dataConfig, bamWorker);
                } catch (e) {
                    console.warn('Error loading worker', e);
                }
            }

            super(context, options);

            this.worker = bamWorker;
            context.dataFetcher.track = this;
            this.context = context;

            this.originalSpec = this.options.spec;

            // Temp. Add ids to each overalid tracks that will be rendered independently
            if ('overlay' in this.originalSpec) {
                this.originalSpec.overlay = this.originalSpec.overlay.map(o => {
                    return { ...o, _renderingId: uuid.v1() };
                });
            } else {
                this.originalSpec._renderingId = uuid.v1();
            }

            this.tileSize = this.tilesetInfo?.tile_size ?? 1024;

            // This tracks the xScale of an entire view, which is used when no tiling concepts are used
            this.drawnAtScale = HGC.libraries.d3Scale.scaleLinear();
            this.scalableGraphics = {};

            this.loadingText = new HGC.libraries.PIXI.Text('Loading', {
                fontSize: '14px',
                fontFamily: 'Arial',
                fill: 'black'
            });

            this.loadingText.x = 0;
            this.loadingText.y = 0;

            this.loadingText.anchor.x = 0;
            this.loadingText.anchor.y = 0;

            this.pLabel.addChild(this.loadingText);

            const { valid, errorMessages } = validateTrack(this.originalSpec);

            if (!valid) {
                console.warn('The specification of the following track is invalid', errorMessages, this.originalSpec);
            }

            this.extent = { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER };

            // Graphics for highlighting visual elements under the cursor
            this.mouseOverGraphics = new HGC.libraries.PIXI.Graphics();
            this.pMain.addChild(this.mouseOverGraphics);

            this.tooltips = [];
            this.svgData = [];
            this.textGraphics = [];
            this.textsBeingUsed = 0; // this variable is being used to improve the performance of text rendering

            HGC.libraries.PIXI.GRAPHICS_CURVES.adaptive = false; // This improves the arc/link rendering performance
        }

        /* ----------------------------------- RENDERING CYCLE ----------------------------------- */

        /**
         * Draw all tiles from the bottom.
         * (https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/TiledPixiTrack.js#L727)
         */
        draw() {
            if (PRINT_RENDERING_CYCLE) console.warn('draw()');

            this.tooltips = [];
            this.svgData = [];
            this.textsBeingUsed = 0;
            this.mouseOverGraphics?.clear();

            // this.pMain.clear();
            // this.pMain.removeChildren();

            this.pBackground.clear();
            this.pBackground.removeChildren();
            this.pBorder.clear();
            this.pBorder.removeChildren();

            const processTilesAndDraw = () => {
                // Preprocess all tiles at once so that we can share scales across tiles.
                this.preprocessAllTiles();

                // This function calls `drawTile` on each tile.
                super.draw();
            };

            if (usePrereleaseRendering(this.originalSpec)) {
                this.updateTileAsync(processTilesAndDraw);
            } else {
                processTilesAndDraw();
            }
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

            // This is only to render axis only once.
            // TODO: Instead of rendering and removing for every tiles, render pBorder only once
            this.pBackground.clear();
            this.pBackground.removeChildren();
            this.pBorder.clear();
            this.pBorder.removeChildren();

            /* Embellishment before rendering marks */
            if (tile.goslingModels && tile.goslingModels[0]) {
                const tm = tile.goslingModels[0];

                // check visibility condition
                const trackWidth = this.dimensions[0];
                const zoomLevel = this._xScale.invert(trackWidth) - this._xScale.invert(0);
                if (!tm.trackVisibility({ zoomLevel })) {
                    return;
                }

                drawPreEmbellishment(HGC, this, tile, tm, this.options.theme);
            }

            /* Mark */
            // A single tile contains one track or multiple tracks overlaid
            tile.goslingModels.forEach((tm: GoslingTrackModel) => {
                // check visibility condition
                const trackWidth = this.dimensions[0];
                const zoomLevel = this._xScale.invert(trackWidth) - this._xScale.invert(0);
                if (!tm.trackVisibility({ zoomLevel })) {
                    return;
                }

                // This is for testing the upcoming rendering methods
                if (usePrereleaseRendering(this.originalSpec)) {
                    // Use worker to create visual properties
                    drawScaleMark(HGC, this, tile, tm);
                    return;
                }

                drawMark(HGC, this, tile, tm);
            });

            /* Embellishment after rendering marks */
            if (tile.goslingModels && tile.goslingModels[0]) {
                const tm = tile.goslingModels[0];

                // check visibility condition
                const trackWidth = this.dimensions[1];
                const zoomLevel = this._xScale.invert(trackWidth) - this._xScale.invert(0);
                if (!tm.trackVisibility({ zoomLevel })) {
                    return;
                }

                drawPostEmbellishment(HGC, this, tile, tm, this.options.theme);
            }
        }

        /**
         * Rerender tiles using the manually changed options.
         * (Refer to https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/HorizontalLine1DPixiTrack.js#L75)
         */
        rerender(newOptions: any) {
            if (PRINT_RENDERING_CYCLE) console.warn('rerender(options)');
            // !! We only call draw for the simplicity
            // super.rerender(newOptions); // This calls `renderTile()` on every tiles

            this.options = newOptions;

            this.tooltips = [];
            this.svgData = [];
            this.textsBeingUsed = 0;

            this.draw();
        }

        /*
         * Rerender all tiles when track size is changed.
         * (Refer to https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/PixiTrack.js#L186).
         */
        setDimensions(newDimensions: any) {
            if (PRINT_RENDERING_CYCLE) console.warn('setDimensions()');

            this.oldDimensions = this.dimensions;
            super.setDimensions(newDimensions); // This simply updates `this._xScale` and `this._yScale`

            // const visibleAndFetched = this.visibleAndFetchedTiles();
            // visibleAndFetched.map((tile: any) => this.initTile(tile));
        }

        /**
         * Record new position.
         */
        setPosition(newPosition: any) {
            super.setPosition(newPosition); // This simply changes `this.position`

            [this.pMain.position.x, this.pMain.position.y] = this.position;
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
        zoomed(newXScale: any, newYScale: any) {
            if (PRINT_RENDERING_CYCLE) console.warn('zoomed()');

            // super.zoomed(newXScale, newYScale); // This function updates `this._xScale` and `this._yScale` and call this.draw();
            this.xScale(newXScale);
            this.yScale(newYScale);

            this.refreshTiles();

            if (this.scalableGraphics) {
                this.scaleScalableGraphics(Object.values(this.scalableGraphics), newXScale, this.drawnAtScale);
            }

            if (!usePrereleaseRendering(this.originalSpec)) {
                this.draw();
            }
            this.forceDraw();
        }

        /**
         * This is currently for testing the new way of rendering visual elements.
         */
        updateTileAsync(callback: () => void) {
            this.xDomain = this._xScale.domain();
            this.xRange = this._xScale.range();

            this.labelText.text = ' Loading...';

            this.worker.then((tileFunctions: any) => {
                tileFunctions
                    .getTabularData(
                        this.dataFetcher.uid,
                        Object.values(this.fetchedTiles).map((x: any) => x.remoteId)
                    )
                    .then((toRender: any) => {
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
                        callback();

                        this.labelText.text = this.originalSpec.title ?? '';
                    });
            });
        }

        /**
         * Stretch out the scaleble graphics to have proper effect upon zoom and pan.
         */
        scaleScalableGraphics(graphics: PIXI.Graphics[], xScale: any, drawnAtScale: any) {
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

        calculateZoomLevel() {
            if (IsRotatedMatrixTrack(this.originalSpec)) {
                // For the rotated matrix, we need special treatment for calculating zoom level.
                return this.calculateZoomLevelForRotatedMatrix();
            } else {
                return super.calculateZoomLevel();
            }
        }

        calculateZoomLevelForRotatedMatrix() {
            let zoomLevel = null;

            if (this.tilesetInfo.resolutions) {
                const zoomIndexX = HGC.services.tileProxy.calculateZoomLevelFromResolutions(
                    this.tilesetInfo.resolutions,
                    this._xScale,
                    this.tilesetInfo.min_pos[0],
                    this.tilesetInfo.max_pos[0]
                );

                const zoomIndexY = HGC.services.tileProxy.calculateZoomLevelFromResolutions(
                    this.tilesetInfo.resolutions,
                    this._xScale,
                    this.tilesetInfo.min_pos[1],
                    this.tilesetInfo.max_pos[1]
                );

                zoomLevel = Math.min(zoomIndexX, zoomIndexY);
            } else {
                const xZoomLevel = HGC.services.tileProxy.calculateZoomLevel(
                    this._xScale,
                    this.tilesetInfo.min_pos[0],
                    this.tilesetInfo.max_pos[0]
                );

                const yZoomLevel = HGC.services.tileProxy.calculateZoomLevel(
                    this._xScale,
                    this.tilesetInfo.min_pos[1],
                    this.tilesetInfo.max_pos[1]
                );

                zoomLevel = Math.max(xZoomLevel, yZoomLevel);
                zoomLevel = Math.min(zoomLevel, this.maxZoom);
            }

            if (this.options && this.options.maxZoom) {
                if (this.options.maxZoom >= 0) {
                    zoomLevel = Math.min(this.options.maxZoom, zoomLevel);
                } else {
                    console.error('Invalid maxZoom on track:', this);
                }
            }
            return zoomLevel;
        }

        calculateVisibleTiles() {
            if (IsRotatedMatrixTrack(this.originalSpec)) {
                // We need special treatment for calculating visible tiles.
                this.calculateVisibleTilesForRotatedMatrix();
                return;
            }

            if (!usePrereleaseRendering(this.originalSpec)) {
                // This is the common way of calculating visible tiles.
                super.calculateVisibleTiles();
                return;
            }

            const tiles = HGC.utils.trackUtils.calculate1DVisibleTiles(this.tilesetInfo, this._xScale);

            for (const tile of tiles) {
                const { tileWidth } = this.getTilePosAndDimensions(tile[0], [tile[1]], this.tilesetInfo.tile_size);

                const DEFAULT_MAX_TILE_WIDTH = 2e5;

                if (tileWidth > (this.tilesetInfo.max_tile_width || DEFAULT_MAX_TILE_WIDTH)) {
                    this.errorTextText = 'Zoom in to see details';
                    this.drawError();
                    this.forceDraw();
                    return;
                }

                this.errorTextText = null;
                this.pBorder.clear();
                this.drawError();
                this.forceDraw();
            }

            this.setVisibleTiles(tiles);
        }

        calculateVisibleTilesForRotatedMatrix() {
            // if we don't know anything about this dataset, no point
            // in trying to get tiles
            if (!this.tilesetInfo) {
                return;
            }

            this.zoomLevel = this.calculateZoomLevel();

            // this.zoomLevel = 0;
            const expandedXScale = this._xScale.copy();

            // we need to expand the domain of the X-scale because we are showing diagonal tiles.
            // to make sure the view is covered up the entire height, we need to expand by
            // viewHeight * sqrt(2)
            // on each side
            expandedXScale.domain([
                this._xScale.invert(this._xScale.range()[0] - this.dimensions[1] * Math.sqrt(2)),
                this._xScale.invert(this._xScale.range()[1] + this.dimensions[1] * Math.sqrt(2))
            ]);

            if (this.tilesetInfo.resolutions) {
                const sortedResolutions = this.tilesetInfo.resolutions
                    .map((x: any) => +x)
                    .sort((a: any, b: any) => b - a);

                this.xTiles = HGC.services.tileProxy.calculateTilesFromResolution(
                    sortedResolutions[this.zoomLevel],
                    expandedXScale,
                    this.tilesetInfo.min_pos[0],
                    this.tilesetInfo.max_pos[0]
                );
                this.yTiles = HGC.services.tileProxy.calculateTilesFromResolution(
                    sortedResolutions[this.zoomLevel],
                    expandedXScale,
                    this.tilesetInfo.min_pos[0],
                    this.tilesetInfo.max_pos[0]
                );
            } else {
                this.xTiles = HGC.services.tileProxy.calculateTiles(
                    this.zoomLevel,
                    expandedXScale,
                    this.tilesetInfo.min_pos[0],
                    this.tilesetInfo.max_pos[0],
                    this.tilesetInfo.max_zoom,
                    this.tilesetInfo.max_width
                );

                this.yTiles = HGC.services.tileProxy.calculateTiles(
                    this.zoomLevel,
                    expandedXScale,
                    this.tilesetInfo.min_pos[0],
                    this.tilesetInfo.max_pos[0],
                    this.tilesetInfo.max_zoom,
                    this.tilesetInfo.max_width
                );
            }

            const rows = this.xTiles;
            const cols = this.yTiles;
            const zoomLevel = this.zoomLevel;

            const maxWidth = this.tilesetInfo.max_width;
            const tileWidth = maxWidth / 2 ** zoomLevel;

            // if we're mirroring tiles, then we only need tiles along the diagonal
            const tiles = [];

            // calculate the ids of the tiles that should be visible
            for (let i = 0; i < rows.length; i++) {
                for (let j = i; j < cols.length; j++) {
                    // the length between the bottom of the track and the bottom corner of the tile
                    // draw it out to understand better!
                    const tileBottomPosition =
                        ((j - i - 2) * (this._xScale(tileWidth) - this._xScale(0)) * Math.sqrt(2)) / 2;

                    if (tileBottomPosition > this.dimensions[1]) {
                        // this tile won't be visible so we don't need to fetch it
                        continue;
                    }

                    const newTile: any = [zoomLevel, rows[i], cols[j]];
                    newTile.mirrored = false;
                    newTile.dataTransform = this.options.dataTransform ? this.options.dataTransform : 'default';

                    tiles.push(newTile);
                }
            }

            this.setVisibleTiles(tiles);
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

        /**
         * Check whether tiles should be merged.
         */
        shouldCombineTiles() {
            return (
                (this.originalSpec.dataTransform?.find(t => t.type === 'displace') &&
                    this.visibleAndFetchedTiles()?.[0]?.tileData &&
                    // we do not need to combine tiles w/ multivec, vector, matrix
                    !this.visibleAndFetchedTiles()?.[0]?.tileData.dense) ||
                this.originalSpec.data?.type === 'bam'
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

        preprocessAllTiles() {
            const gms: GoslingTrackModel[] = [];

            this.reorganizeTileInfo();

            this.combineAllTilesIfNeeded();

            this.visibleAndFetchedTiles().forEach((tile: any) => {
                // tile preprocessing is done only once per tile
                const tileModels = this.preprocessTile(tile);
                tileModels?.forEach((m: GoslingTrackModel) => {
                    gms.push(m);
                });
            });

            shareScaleAcrossTracks(gms);

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

            if (tile.goslingModels && tile.goslingModels.length !== 0 && this.originalSpec.data?.type !== 'matrix') {
                // already have the gosling models constructed
                return tile.goslingModels;
            }

            // Single tile can contain multiple gosling models if multiple tracks are superposed.
            tile.goslingModels = [];

            const spec = JSON.parse(JSON.stringify(this.originalSpec));

            resolveSuperposedTracks(spec).forEach(resolved => {
                if (resolved.mark === 'brush') {
                    // we do not draw rectangular brush ourselves, higlass does.
                    return;
                }

                const xChannel = resolved.x;
                const yChannel = resolved.y;
                if (
                    resolved.data.type === 'matrix' &&
                    IsChannelDeep(xChannel) &&
                    xChannel.type === 'genomic' &&
                    IsChannelDeep(yChannel) &&
                    yChannel.type === 'genomic'
                ) {
                    // we do not draw matrix ourselves, higlass does.
                    return;
                }

                if (!tile.gos.tabularData) {
                    // If the data is not already stored in a tabular form, convert them.
                    const { tileX, tileY, tileWidth, tileHeight } = this.getTilePosAndDimensions(
                        tile.gos.zoomLevel,
                        tile.gos.tilePos,
                        this.tileSize
                    );

                    tile.gos.tabularData = getTabularData(resolved, {
                        ...tile.gos,
                        tileX,
                        tileY, // Used for 2D tracks
                        tileWidth,
                        tileHeight, // Used for 2D tracks
                        tileSize: this.tileSize
                    });
                }

                tile.gos.tabularDataFiltered = Array.from(tile.gos.tabularData);
                /*
                 * Data Transformation
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
                            case 'rotateMatrix':
                                tile.gos.tabularDataFiltered = rotateMatrix(
                                    t,
                                    tile.gos.tabularDataFiltered,
                                    this._xScale.copy(),
                                    this.dimensions[0]
                                );
                                console.log(tile.gos.tabularDataFiltered);
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

                // Send data preview to the editor so that it can be shown to users.
                try {
                    // !!! This shouldn't be called while using npm gosling.js package.
                    /*eslint-disable */
                    const pubsub = require('pubsub-js');
                    /*eslint-enable */
                    if (pubsub) {
                        const NUM_OF_ROWS_IN_PREVIEW = 100;
                        const numOrRows = tile.gos.tabularDataFiltered.length;
                        pubsub.publish('data-preview', {
                            id: this.context.id,
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

            const tileXScale = scaleLinear()
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

        exportSVG() {
            let track = null;
            let base = null;

            [base, track] = super.superSVG();

            base.setAttribute('class', 'exported-arcs-track');
            const output = document.createElement('g');

            track.appendChild(output);

            output.setAttribute(
                'transform',
                `translate(${this.pMain.position.x},${this.pMain.position.y}) scale(${this.pMain.scale.x},${this.pMain.scale.y})`
            );

            this.svgData?.forEach((d: any /* TODO: define type */) => {
                switch (d.type) {
                    case 'rect':
                        const { xs, xe, ys, ye, color, stroke, opacity } = d;
                        const g = document.createElement('rect');
                        g.setAttribute('fill', color);
                        g.setAttribute('stroke', stroke);

                        g.setAttribute('x', xs);
                        g.setAttribute('y', ys);
                        g.setAttribute('width', `${xe - xs}`);
                        g.setAttribute('height', `${ye - ys}`);
                        g.setAttribute('opacity', opacity);

                        output.appendChild(g);
                        break;
                    default:
                        break;
                }
            });

            return [base, track];
        }

        getMouseOverHtml(mouseX: number, mouseY: number) {
            const isMouseOverPrepared = false; // TODO: We do not support this yet.

            if (!this.tilesetInfo || !this.tooltips) {
                // Do not have enough information to show tooltips
                return;
            }

            this.mouseOverGraphics.clear();
            // place on the top
            this.pMain.removeChild(this.mouseOverGraphics);
            this.pMain.addChild(this.mouseOverGraphics);

            // TODO: Get tooltip information prepared during the mark rendering, and use the info here to show tooltips.

            const tooltip: TooltipData | undefined = this.tooltips.find((d: TooltipData) =>
                d.isMouseOver(mouseX, mouseY)
            );

            // Experimental: publish mouseover events
            if (tooltip) {
                PubSub.publish('mouseover', {
                    data: { ...tooltip.datum },
                    genomicPosition: getRelativeGenomicPosition(Math.floor(this._xScale.invert(mouseX)))
                });
            }

            if (tooltip) {
                // render mouse over effect
                if (tooltip.markInfo.type === 'rect' && isMouseOverPrepared) {
                    this.mouseOverGraphics.lineStyle(
                        1,
                        colorToHex('black'),
                        1, // alpha
                        1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                    );
                    this.mouseOverGraphics.beginFill(colorToHex('white'), 0);

                    // Experimental
                    const showOutline = true;
                    if (showOutline) {
                        this.mouseOverGraphics.drawRect(
                            tooltip.markInfo.x,
                            tooltip.markInfo.y,
                            tooltip.markInfo.width,
                            tooltip.markInfo.height
                        );
                    } else {
                        const [tw, th] = this.dimensions;
                        const cx = tooltip.markInfo.x + tooltip.markInfo.width / 2.0;
                        const cy = tooltip.markInfo.y + tooltip.markInfo.height / 2.0;

                        // horizontal line
                        this.mouseOverGraphics.moveTo(0, cy);
                        this.mouseOverGraphics.lineTo(tw, cy);

                        // vertical line
                        this.mouseOverGraphics.moveTo(cx, 0);
                        this.mouseOverGraphics.lineTo(cx, th);

                        // center point
                        this.mouseOverGraphics.beginFill(colorToHex('black'), 1);
                        this.mouseOverGraphics.drawCircle(cx, cy, 1);
                    }
                }

                // Display a tooltip
                if (this.originalSpec.tooltip) {
                    const content = (this.originalSpec.tooltip as any)
                        .map((d: any) => {
                            const rawValue = tooltip.datum[d.field];
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
                    return `<table style='text-align: left; margin-top: 12px'>${content}</table>`;
                }
            }
        }
    }
    return new GoslingTrackClass(args);
}

// TODO: Change the icon
const icon =
    '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// default
GoslingTrack.config = {
    type: 'gosling-track',
    datatype: ['multivec', 'epilogos'],
    local: false,
    orientation: '1d-horizontal',
    thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
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
