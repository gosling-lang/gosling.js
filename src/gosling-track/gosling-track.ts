import { debounce, sampleSize, uniqBy } from 'lodash';
import { scaleLinear } from 'd3-scale';
import { drawMark } from '../core/mark';
import { GoslingTrackModel } from '../core/gosling-track-model';
import { validateTrack } from '../core/utils/validate';
import { shareScaleAcrossTracks } from '../core/utils/scales';
import { resolveSuperposedTracks } from '../core/utils/overlay';
import { SingleTrack, OverlaidTrack, Datum } from '../core/gosling.schema';
import { Tooltip } from '../gosling-tooltip';
import colorToHex from '../core/utils/color-to-hex';
import { calculateData, concatString, filterData, replaceString, splitExon } from '../core/utils/data-transform';
import { getTabularData } from './data-abstraction';
import { BAMDataFetcher } from '../data-fetcher/bam';
import { spawn, Worker } from 'threads';
import Logging from '../core/utils/log';

const BINS_PER_TILE = 1024;
export const PILEUP_COLORS = {
    BG: [0.89, 0.89, 0.89, 1], // gray for the read background
    BG2: [0.85, 0.85, 0.85, 1], // used as alternating color in the read counter band
    BG_MUTED: [0.92, 0.92, 0.92, 1], // covergae background, when it is not exact
    A: [0, 0, 1, 1], // blue for A
    C: [1, 0, 0, 1], // red for c
    G: [0, 1, 0, 1], // green for g
    T: [1, 1, 0, 1], // yellow for T
    S: [0, 0, 0, 0.5], // darker grey for soft clipping
    H: [0, 0, 0, 0.5], // darker grey for hard clipping
    X: [0, 0, 0, 0.7], // black for unknown
    I: [1, 0, 1, 0.5], // purple for insertions
    D: [1, 0.5, 0.5, 0.5], // pink-ish for deletions
    N: [1, 1, 1, 1],
    BLACK: [0, 0, 0, 1],
    BLACK_05: [0, 0, 0, 0.5],
    PLUS_STRAND: [0.75, 0.75, 1, 1],
    MINUS_STRAND: [1, 0.75, 0.75, 1]
};
const createColorTexture = (PIXI: any, colors: any) => {
    const colorTexRes = Math.max(2, Math.ceil(Math.sqrt(colors.length)));
    const rgba = new Float32Array(colorTexRes ** 2 * 4);
    colors.forEach((color: any, i: any) => {
        // eslint-disable-next-line prefer-destructuring
        rgba[i * 4] = color[0]; // r
        // eslint-disable-next-line prefer-destructuring
        rgba[i * 4 + 1] = color[1]; // g
        // eslint-disable-next-line prefer-destructuring
        rgba[i * 4 + 2] = color[2]; // b
        // eslint-disable-next-line prefer-destructuring
        rgba[i * 4 + 3] = color[3]; // a
    });

    return [PIXI.Texture.fromBuffer(rgba, colorTexRes, colorTexRes), colorTexRes];
};

// For using libraries, refer to https://github.com/higlass/higlass/blob/f82c0a4f7b2ab1c145091166b0457638934b15f3/app/scripts/configs/available-for-plugins.js
// `getTilePosAndDimensions()` definition: https://github.com/higlass/higlass/blob/1e1146409c7d7c7014505dd80d5af3e9357c77b6/app/scripts/Tiled1DPixiTrack.js#L133
function GoslingTrack(HGC: any, ...args: any[]): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    // TODO: change the parent class to a more generic one (e.g., TiledPixiTrack)
    class GoslingTrackClass extends HGC.tracks.BarTrack {
        private originalSpec: SingleTrack | OverlaidTrack;
        private tooltips: Tooltip[];
        private tileSize: number;
        private worker: any;
        private prevRows: any[];
        // TODO: add members that are used explicitly in the code

        constructor(params: any[]) {
            const [context, options] = params;

            // Check whether to load a worker.
            let bamWorker;
            if ((options.spec as SingleTrack | OverlaidTrack).data?.type === 'bam') {
                bamWorker = spawn(new Worker('../data-fetcher/bam/bam-worker'));
                context.dataFetcher = new BAMDataFetcher(HGC, context.dataConfig, bamWorker);
            }

            super(context, options);

            this.worker = bamWorker;
            context.dataFetcher.track = this;
            this.prevRows = [];
            this.context = context;
            this.originalSpec = this.options.spec;
            this.tileSize = this.tilesetInfo?.tile_size ?? 1024;

            this.valueScaleTransform = HGC.libraries.d3Zoom.zoomIdentity;

            // we scale the entire view up until a certain point
            // at which point we redraw everything to get rid of
            // artifacts
            // this.drawnAtScale keeps track of the scale at which
            // we last rendered everything
            this.drawnAtScale = HGC.libraries.d3Scale.scaleLinear();
            this.prevRows = [];
            this.coverage = {};
            // The bp distance for which the samples are chosen for the coverage.
            this.coverageSamplingDistance = 1;

            // graphics for highliting reads under the cursor
            this.mouseOverGraphics = new HGC.libraries.PIXI.Graphics();
            this.loadingText = new HGC.libraries.PIXI.Text('Loading', {
                fontSize: '12px',
                fontFamily: 'Arial',
                fill: 'grey'
            });

            this.loadingText.x = 100;
            this.loadingText.y = 100;

            this.loadingText.anchor.x = 0;
            this.loadingText.anchor.y = 0;

            this.fetching = new Set();
            this.rendering = new Set();

            const { valid, errorMessages } = validateTrack(this.originalSpec);

            if (!valid) {
                console.warn('The specification of the following track is invalid', errorMessages, this.originalSpec);
            }

            this.extent = { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER };

            this.mouseOverGraphics = new HGC.libraries.PIXI.Graphics();
            this.pMain.addChild(this.mouseOverGraphics);

            this.tooltips = [];
            this.svgData = [];
            this.textGraphics = [];
            this.textsBeingUsed = 0; // this variable is being used to improve the performance of text rendering

            HGC.libraries.PIXI.GRAPHICS_CURVES.adaptive = false; // This improve the arc/link rendering performance
        }

        setUpShaderAndTextures() {
            const colorDict = PILEUP_COLORS;

            if (this.options && this.options.colorScale) {
                [
                    colorDict.A,
                    colorDict.T,
                    colorDict.G,
                    colorDict.C,
                    colorDict.N,
                    colorDict.X
                ] = this.options.colorScale.map((x: any) => this.colorToArray(x));
            }

            if (this.options && this.options.plusStrandColor) {
                colorDict.PLUS_STRAND = this.colorToArray(this.options.plusStrandColor);
            }

            if (this.options && this.options.minusStrandColor) {
                colorDict.MINUS_STRAND = this.colorToArray(this.options.minusStrandColor);
            }

            const colors = Object.values(colorDict);

            const [colorMapTex, colorMapTexRes] = createColorTexture(HGC.libraries.PIXI, colors);
            const uniforms = new HGC.libraries.PIXI.UniformGroup({
                uColorMapTex: colorMapTex,
                uColorMapTexRes: colorMapTexRes
            });
            this.shader = HGC.libraries.PIXI.Shader.from(
                `
          attribute vec2 position;
          attribute float aColorIdx;
          uniform mat3 projectionMatrix;
          uniform mat3 translationMatrix;
          uniform sampler2D uColorMapTex;
          uniform float uColorMapTexRes;
          varying vec4 vColor;
          void main(void)
          {
              // Half a texel (i.e., pixel in texture coordinates)
              float eps = 0.5 / uColorMapTexRes;
              float colorRowIndex = floor((aColorIdx + eps) / uColorMapTexRes);
              vec2 colorTexIndex = vec2(
                (aColorIdx / uColorMapTexRes) - colorRowIndex + eps,
                (colorRowIndex / uColorMapTexRes) + eps
              );
              vColor = texture2D(uColorMapTex, colorTexIndex);
              gl_Position = vec4((projectionMatrix * translationMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
          }
      `,
                `
      varying vec4 vColor;
          void main(void) {
              gl_FragColor = vColor;
          }
      `,
                uniforms
            );
        }

        initTile(tile: any) {
            this.tooltips = [];
            this.svgData = [];
            this.textsBeingUsed = 0;

            if (this.isUpdateTileAsync()) return;

            // preprocess all tiles at once so that we can share the value scales
            this.preprocessAllTiles();

            this.renderTile(tile);
        }

        /**
         * Rerender tiles using the new options, including the change of positions and zoom levels
         */
        rerender(newOptions: any) {
            super.rerender(newOptions);

            this.options = newOptions;

            this.tooltips = [];
            this.svgData = [];
            this.textsBeingUsed = 0;

            this.updateTile();

            this.draw(); // TODO: any effect?
        }

        draw() {
            this.tooltips = [];
            this.svgData = [];
            this.textsBeingUsed = 0;
            this.mouseOverGraphics?.clear(); // remove mouse over effects

            super.draw();
        }

        isUpdateTileAsync() {
            return this.originalSpec.data?.type === 'bam';
        }

        updateTile() {
            this.setUpShaderAndTextures();
            if (this.isUpdateTileAsync()) {
                this.worker.then((tileFunctions: any) => {
                    tileFunctions
                        .getTabularData(
                            this.dataFetcher.uid,
                            Object.values(this.fetchedTiles).map((x: any) => x.remoteId)
                        )
                        // .renderSegments(
                        //     this.dataFetcher.uid,
                        //     Object.values(this.fetchedTiles).map((x: any) => x.remoteId),
                        //     this._xScale.domain(),
                        //     this._xScale.range(),
                        //     this.position,
                        //     this.dimensions,
                        //     this.prevRows,
                        //     this.options,
                        //   )
                        //   .then((toRender: any) => {
                        //     // this.loadingText.visible = false;
                        //     // fetchedTileKeys.forEach((x) => {
                        //     //   this.rendering.delete(x);
                        //     // });
                        //     // this.updateLoadingText();

                        //     this.errorTextText = null;
                        //     this.pBorder.clear();
                        //     this.drawError();
                        //     this.animate();

                        //     this.positions = new Float32Array(toRender.positionsBuffer);
                        //     this.colors = new Float32Array(toRender.colorsBuffer);
                        //     this.ixs = new Int32Array(toRender.ixBuffer);

                        //     console.log('this.positions', this.positions, this.colors, this.ixs);

                        //     const newGraphics = new HGC.libraries.PIXI.Graphics();

                        //     this.prevRows = toRender.rows;
                        //     this.coverage = toRender.coverage;
                        //     this.coverageSamplingDistance = toRender.coverageSamplingDistance;

                        //     const geometry = new HGC.libraries.PIXI.Geometry().addAttribute(
                        //       'position',
                        //       this.positions,
                        //       2,
                        //     ); // x,y
                        //     geometry.addAttribute('aColorIdx', this.colors, 1);
                        //     geometry.addIndex(this.ixs);

                        //     if (this.positions.length) {
                        //       const state = new HGC.libraries.PIXI.State();
                        //       const mesh = new HGC.libraries.PIXI.Mesh(
                        //         geometry,
                        //         this.shader,
                        //         state,
                        //       );

                        //       newGraphics.addChild(mesh);
                        //     }

                        //     this.pMain.x = this.position[0];

                        //     if (this.segmentGraphics) {
                        //       this.pMain.removeChild(this.segmentGraphics);
                        //     }

                        //     this.pMain.addChild(newGraphics);
                        //     this.segmentGraphics = newGraphics;

                        //     // remove and add again to place on top
                        //     // this.pMain.removeChild(this.mouseOverGraphics);
                        //     // this.pMain.addChild(this.mouseOverGraphics);

                        //     this.yScaleBands = {};
                        //     // for (let key in this.prevRows) {
                        //     //   this.yScaleBands[key] = HGC.libraries.d3Scale
                        //     //     .scaleBand()
                        //     //     .domain(
                        //     //       HGC.libraries.d3Array.range(
                        //     //         0,
                        //     //         this.prevRows[key].rows.length,
                        //     //       ),
                        //     //     )
                        //     //     .range([this.prevRows[key].start, this.prevRows[key].end])
                        //     //     .paddingInner(0.2);
                        //     // }

                        //     this.drawnAtScale = HGC.libraries.d3Scale
                        //       .scaleLinear()
                        //       .domain(toRender.xScaleDomain)
                        //       .range(toRender.xScaleRange);

                        //     this.scaleScalableGraphics(
                        //       this.segmentGraphics,
                        //       this._xScale,
                        //       this.drawnAtScale,
                        //     );

                        //     // if somebody zoomed vertically, we want to readjust so that
                        //     // they're still zoomed in vertically
                        //     this.segmentGraphics.scale.y = this.valueScaleTransform.k;
                        //     this.segmentGraphics.position.y = this.valueScaleTransform.y;

                        //     this.draw();
                        //     this.animate();
                        //   });
                        .then((toRender: any) => {
                            // this.animate(); // This function force to redraw, which is often used with async functions.

                            const tiles = this.visibleAndFetchedTiles();
                            console.log(tiles);

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
                            // console.log('toRender', tabularData);
                            this.preprocessAllTiles();

                            this.visibleAndFetchedTiles().forEach((tile: any) => {
                                this.renderTile(tile);
                            });

                            this.draw();
                            this.animate();
                        });
                });
                return;
            }

            // preprocess all tiles at once so that we can share the value scales
            this.preprocessAllTiles();

            this.visibleAndFetchedTiles().forEach((tile: any) => {
                this.renderTile(tile);
            });

            // TODO: Should rerender tile only when neccesary for performance
            // e.g., changing color scale
            // ...
        }

        /*
         * Draws exactly one tile
         */
        renderTile(tile: any) {
            // Refer to the following already supported graphics:
            // https://github.com/higlass/higlass/blob/54f5aae61d3474f9e868621228270f0c90ef9343/app/scripts/PixiTrack.js#L115
            tile.mouseOverData = null;
            tile.graphics.clear();
            tile.graphics.removeChildren();
            tile.drawnAtScale = this._xScale.copy(); // being used in `draw()` internally

            // this.pMain.clear();
            // this.pMain.removeChildren();

            if (!tile.goslingModels) {
                // We do not have a track model prepared to visualize
                return;
            }

            this.pBackground.clear();
            this.pBackground.removeChildren();
            this.pBorder.clear();
            this.pBorder.removeChildren();

            // A single tile contains one or multiple gosling visualizations that are overlaid
            tile.goslingModels.forEach((tm: GoslingTrackModel) => {
                // check visibility condition
                const trackWidth = this.dimensions[1];
                const zoomLevel = this._xScale.invert(trackWidth) - this._xScale.invert(0);
                if (!tm.trackVisibility({ zoomLevel })) {
                    return;
                }

                Logging.recordTime('drawMark');
                drawMark(HGC, this, tile, tm, this.options.theme);
                Logging.printTime('drawMark');
            });
        }

        scaleScalableGraphics(graphics: any, xScale: any, drawnAtScale: any) {
            const tileK =
                (drawnAtScale.domain()[1] - drawnAtScale.domain()[0]) / (xScale.domain()[1] - xScale.domain()[0]);
            const newRange = xScale.domain().map(drawnAtScale);

            const posOffset = newRange[0];
            graphics.scale.x = tileK;
            graphics.position.x = -posOffset * tileK;
        }

        /**
         * Called when location or zoom level has been changed by click-and-drag interaction
         * For brushing, refer to https://github.com/higlass/higlass/blob/caf230b5ee41168ea491572618612ac0cc804e5a/app/scripts/HeatmapTiledPixiTrack.js#L1493
         * @param newXScale
         * @param newYScale
         */
        zoomed(newXScale: any, newYScale: any) {
            super.zoomed(newXScale, newYScale);

            if (this.segmentGraphics) {
                this.scaleScalableGraphics(this.segmentGraphics, newXScale, this.drawnAtScale);
            }

            this.animate();
        }

        /**
         * Return the set of ids of all tiles which are both visible and fetched.
         */
        visibleAndFetchedIds() {
            return Object.keys(this.fetchedTiles).filter(x => this.visibleTileIds.has(x));
        }

        visibleAndFetchedTiles() {
            return this.visibleAndFetchedIds().map((x: any) => this.fetchedTiles[x]);
        }

        calculateVisibleTiles() {
            if (this.originalSpec.data?.type !== 'bam') {
                super.calculateVisibleTiles();
                return;
            }

            const tiles = HGC.utils.trackUtils.calculate1DVisibleTiles(this.tilesetInfo, this._xScale);

            for (const tile of tiles) {
                const { tileX, tileWidth } = this.getTilePosAndDimensions(
                    tile[0],
                    [tile[1]],
                    this.tilesetInfo.tile_size
                );

                const DEFAULT_MAX_TILE_WIDTH = 2e5;

                if (tileWidth > (this.tilesetInfo.max_tile_width || DEFAULT_MAX_TILE_WIDTH)) {
                    this.errorTextText = 'Zoom in to see details';
                    this.drawError();
                    this.animate();
                    return;
                }

                this.errorTextText = null;
                this.pBorder.clear();
                this.drawError();
                this.animate();
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

            if (tile.goslingModels && tile.goslingModels.length !== 0) {
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

                if (resolved.data.type === 'matrix') {
                    // we do not draw matrix ourselves, higlass does.
                    return;
                }
                // console.log(tile);
                if (!tile.gos.tabularData) {
                    // If the data is not already stored in a tabular form, convert them.
                    const { tileX, tileWidth } = this.getTilePosAndDimensions(
                        tile.gos.zoomLevel,
                        tile.gos.tilePos,
                        this.tileSize
                    );

                    tile.gos.tabularData = getTabularData(resolved, {
                        ...tile.gos,
                        tileX,
                        tileWidth,
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
                            case 'displace':
                                function currTime() {
                                    const d = new Date();
                                    return d.getTime();
                                }
                                const t1 = currTime();
                                const { boundingBox, method, newField } = t;
                                const { startField, endField } = boundingBox;

                                let padding = 0; // This is a pixel value.
                                if (boundingBox.padding && this._xScale) {
                                    padding = Math.abs(
                                        this._xScale.invert(boundingBox.padding) - this._xScale.invert(0)
                                    );
                                }

                                // Check whether we have sufficient information.
                                const base = tile.gos.tabularDataFiltered;
                                if (base && base.length > 0) {
                                    if (
                                        !Object.keys(base[0]).find(d => d === startField) ||
                                        !Object.keys(base[0]).find(d => d === endField)
                                    ) {
                                        // We did not find the fields from the data, so exit here.
                                        return;
                                    }
                                }

                                if (method === 'pile') {
                                    const oldAlgorithm = false;

                                    if (oldAlgorithm) {
                                        const { maxRows } = t;
                                        const boundingBoxes: { start: number; end: number; row: number }[] = [];

                                        base.sort(
                                            (a: Datum, b: Datum) =>
                                                (a[startField] as number) - (b[startField] as number)
                                        ).forEach((d: Datum) => {
                                            const start = (d[startField] as number) - padding;
                                            const end = (d[endField] as number) + padding;

                                            const overlapped = boundingBoxes.filter(
                                                box =>
                                                    (box.start === start && end === box.end) ||
                                                    (box.start <= start && start < box.end) ||
                                                    (box.start < end && end <= box.end) ||
                                                    (start < box.start && box.end < end)
                                            );

                                            // find the lowest non overlapped row
                                            const uniqueRows = [
                                                ...Array.from(new Set(boundingBoxes.map(d => d.row))),
                                                Math.max(...boundingBoxes.map(d => d.row)) + 1
                                            ];
                                            const overlappedRows = overlapped.map(d => d.row);
                                            const lowestNonOverlappedRow = Math.min(
                                                ...uniqueRows.filter(d => overlappedRows.indexOf(d) === -1)
                                            );

                                            // row index starts from zero
                                            const row: number = overlapped.length === 0 ? 0 : lowestNonOverlappedRow;

                                            d[newField] = `${maxRows && maxRows <= row ? maxRows - 1 : row}`;

                                            boundingBoxes.push({ start, end, row });
                                        });
                                    } else {
                                        // This piling algorithm is based on
                                        // https://github.com/higlass/higlass-pileup/blob/8538a34c6d884c28455d6178377ee1ea2c2c90ae/src/bam-fetcher-worker.js#L626
                                        const { maxRows } = t;
                                        const occupiedSpaceInRows: { start: number; end: number }[] = [];

                                        base.sort(
                                            (a: Datum, b: Datum) =>
                                                (a[startField] as number) - (b[startField] as number)
                                        ).forEach((d: Datum) => {
                                            const start = (d[startField] as number) - padding;
                                            const end = (d[endField] as number) + padding;

                                            // Find a row to place this segment
                                            let rowIndex = occupiedSpaceInRows.findIndex(d => {
                                                // Find a space and update the occupancy info.
                                                if (end < d.start) {
                                                    d.start = start;
                                                    return true;
                                                } else if (d.end < start) {
                                                    d.end = end;
                                                    return true;
                                                }
                                                return false;
                                            });

                                            if (rowIndex === -1) {
                                                // We did not find sufficient space from the existing rows, so add a new row.
                                                occupiedSpaceInRows.push({ start, end });
                                                rowIndex = occupiedSpaceInRows.length - 1;
                                            }

                                            d[newField] = `${maxRows && maxRows <= rowIndex ? maxRows - 1 : rowIndex}`;
                                        });
                                    }
                                } else if (method === 'spread') {
                                    const boundingBoxes: { start: number; end: number }[] = [];

                                    base.sort(
                                        (a: Datum, b: Datum) => (a[startField] as number) - (b[startField] as number)
                                    ).forEach((d: Datum) => {
                                        let start = (d[startField] as number) - padding;
                                        let end = (d[endField] as number) + padding;

                                        let overlapped = boundingBoxes.filter(
                                            box =>
                                                (box.start === start && end === box.end) ||
                                                (box.start < start && start < box.end) ||
                                                (box.start < end && end < box.end) ||
                                                (start < box.start && box.end < end)
                                        );

                                        if (overlapped.length > 0) {
                                            let trial = 0;
                                            do {
                                                overlapped = boundingBoxes.filter(
                                                    box =>
                                                        (box.start === start && end === box.end) ||
                                                        (box.start < start && start < box.end) ||
                                                        (box.start < end && end < box.end) ||
                                                        (start < box.start && box.end < end)
                                                );
                                                if (overlapped.length > 0) {
                                                    if (trial % 2 === 0) {
                                                        start += padding * trial;
                                                        end += padding * trial;
                                                    } else {
                                                        start -= padding * trial;
                                                        end -= padding * trial;
                                                    }
                                                }
                                                trial++;
                                                // TODO: do not go outside of a tile.
                                            } while (overlapped.length > 0 && trial < 1000);
                                        }

                                        d[`${newField}Start`] = `${start + padding}`;
                                        d[`${newField}Etart`] = `${end - padding}`;

                                        boundingBoxes.push({ start, end });
                                    });
                                }
                                const t2 = currTime();
                                console.log('Piling time:', t2 - t1, 'ms');
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

        // rerender all tiles every time track size is changed
        setDimensions(newDimensions: any) {
            this.oldDimensions = this.dimensions;
            super.setDimensions(newDimensions);

            const visibleAndFetched = this.visibleAndFetchedTiles();
            visibleAndFetched.map((tile: any) => this.initTile(tile));
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

        drawTile(tile: any) {
            // prevent BarTracks draw method from having an effect
            this.renderTile(tile);
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

            const tooltip: Tooltip | undefined = this.tooltips.find((d: Tooltip) => d.isMouseOver(mouseX, mouseY));

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

                if (this.originalSpec.tooltip) {
                    // render a tooltip
                    const content = (this.originalSpec.tooltip as any)
                        .map(
                            (d: any) =>
                                '<tr>' +
                                `<td style='padding: 4px 8px'>${d.alt ?? d.field}</td>` +
                                `<td style='padding: 4px 8px'><b>${tooltip.datum[d.field]}</b></td>` +
                                '</tr>'
                        )
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
