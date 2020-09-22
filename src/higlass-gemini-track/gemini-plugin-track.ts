import * as d3 from 'd3';
import { drawMark } from './mark';
import { getMaxZoomLevel, isSemanticZoomTriggered } from './utils/semantic-zoom';
import { GeminiTrackModel } from '../core/gemini-track-model';
import { SpriteInfo } from './utils/sprite';
import { validateTrack } from './utils/validate';
import { drawZoomInstruction } from './mark/zoom-instruction';
import { shareScaleAcrossTracks } from './utils/scales';
import { resolveSuperposedTracks } from './utils/superpose';
import { IsDataMetadata, IsDataTransform, Track } from '../core/gemini.schema';
import assign from 'lodash/assign';

function GeminiTrack(HGC: any, ...args: any[]): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    class GeminiTrackClass extends HGC.tracks.BarTrack {
        // TODO: change the parent class to a more generic one (e.g., TiledPixiTrack)

        // Spec of a Gemini track
        private originalSpec: Track;

        // deprecated
        private extent: { min: number; max: number };

        constructor(params: any[]) {
            const [context, options] = params;
            super(context, options);

            this.originalSpec = this.options.spec;

            const { valid, errorMessages } = validateTrack(this.originalSpec);

            if (!valid) {
                console.warn('The specification of the following track is invalid', errorMessages, this.originalSpec);
            }

            this.extent = { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER };

            this.textGraphics = [];
        }

        initTile(tile: any) {
            // preprocess all tiles at once so that we can share the value scales
            const gms: GeminiTrackModel[] = [];
            this.visibleAndFetchedTiles().forEach((t: any) => {
                // tile preprocessing is done only once per tile
                const tileModels = this.preprocessTile(t);
                tileModels.forEach((m: GeminiTrackModel) => {
                    gms.push(m);
                });
            });

            // TODO: IMPORTANT: when panning the tiles, the extent only becomes larger
            shareScaleAcrossTracks(gms);

            this.renderTile(tile);
            this.rescaleTiles();
        }

        /**
         * Rerender tiles using the new options, including the change of positions and zoom levels
         */
        rerender(newOptions: any) {
            super.rerender(newOptions);

            this.options = newOptions;

            this.updateTile();

            this.rescaleTiles();
            this.draw(); // TODO: any effect?
        }

        updateTile() {
            // preprocess all tiles at once so that we can share the value scales
            const gms: GeminiTrackModel[] = [];
            this.visibleAndFetchedTiles().forEach((tile: any) => {
                // tile preprocessing is done only once per tile
                const tileModels = this.preprocessTile(tile);
                tileModels.forEach((m: GeminiTrackModel) => {
                    gms.push(m);
                });
            });

            shareScaleAcrossTracks(gms);

            this.visibleAndFetchedTiles().forEach((tile: any) => {
                this.renderTile(tile);
            });

            this.rescaleTiles();

            // TODO: Should rerender tile only when neccesary for performance
            // e.g., changing color scale
            // ...
        }

        // draws exactly one tile
        renderTile(tile: any) {
            tile.mouseOverData = null;
            tile.graphics.clear();
            tile.graphics.removeChildren();
            this.pBorder.clear();
            this.pBorder.removeChildren();
            tile.drawnAtScale = this._xScale.copy(); // being used in `draw()`

            if (!tile.geminiModels) {
                // we do not have a track model prepared to visualize
                return;
            }

            const isNotMaxZoomLevel = tile?.tileData?.zoomLevel !== getMaxZoomLevel();

            tile.geminiModels.forEach((tm: GeminiTrackModel) => {
                if (isNotMaxZoomLevel && tm.spec().semanticZoom?.type === 'hide') {
                    drawZoomInstruction(HGC, this);
                    return;
                }

                if (!tm.trackVisibility({ zoomLevel: tile?.tileData?.zoomLevel })) {
                    // check visibility condition
                    return;
                }

                drawMark(HGC, this, tile, tm);
            });
        }

        // scales in visualizations, such as y axis, color, and size, should be shared across all tiles
        setGlobalScales() {
            return; // TODO: we are temporally drawing marks everytime.

            // reset extent
            this.extent = {
                min: Number.MAX_SAFE_INTEGER,
                max: Number.MIN_SAFE_INTEGER
            };

            const visibleAndFetched = this.visibleAndFetchedTiles();

            visibleAndFetched.forEach((tile: any) => {
                if (!tile.extent) return;

                if (tile.extent.y.min + tile.extent.y.max > this.extent.min + this.extent.max) {
                    this.extent.min = tile.extent.y.min;
                    this.extent.max = tile.extent.y.max;
                }
            });
        }

        /**
         * Construct tabular data from a higlass tileset and a gemini track model.
         * Return the generated gemini track model.
         */
        preprocessTile(tile: any) {
            if (tile.geminiModels && tile.geminiModels.length !== 0) {
                return tile.geminiModels;
            }

            // Single tile can contain multiple Gemini models if multiple tracks are superposed.
            tile.geminiModels = [];

            // TODO: IMPORTANT: semantic zooming could be ultimately considered as superposing multiple tracks, and
            // its visibility is determined by certain user-defined condition.

            // Determine whether to trigger semantic zooming.
            const semanticZoomTriggered = isSemanticZoomTriggered(this.originalSpec, tile?.tileData?.zoomLevel);

            let semanticSpec = JSON.parse(JSON.stringify(this.originalSpec));
            if (semanticZoomTriggered && this.options.spec?.semanticZoom?.type === 'alternative-encoding') {
                // Assign the alternative encoding to the original spec
                semanticSpec = assign({}, semanticSpec, this.options.spec.semanticZoom.spec);
            }

            resolveSuperposedTracks(semanticSpec).forEach(spec => {
                if (!tile.tileData.tabularData) {
                    if (!IsDataMetadata(spec.metadata)) {
                        console.warn('No metadata of tilesets specified');
                        return;
                    }

                    if (spec.metadata.type === 'higlass-multivec') {
                        if (!spec.metadata.row || !spec.metadata.column || !spec.metadata.value) {
                            console.warn(
                                'Proper metadata of the tileset is not provided. Please specify the name of data fields.'
                            );
                            return;
                        }

                        const tileSize = this.tilesetInfo.tile_size;

                        const { tileX, tileWidth } = this.getTilePosAndDimensions(
                            tile.tileData.zoomLevel,
                            tile.tileData.tilePos,
                            tileSize
                        );

                        const numOfTotalCategories = tile.tileData.shape[0];
                        const numericValues = tile.tileData.dense;
                        const numOfGenomicPositions = tile.tileData.shape[1];
                        const tileUnitSize = tileWidth / tileSize;

                        const rowName = spec.metadata.row;
                        const valueName = spec.metadata.value;
                        const columnName = spec.metadata.column;
                        const startName = spec.metadata.start ?? 'start';
                        const endName = spec.metadata.end ?? 'end';
                        const categories: any = spec.metadata.categories ?? [...Array(numOfTotalCategories).keys()]; // TODO:

                        const tabularData: { [k: string]: number | string }[] = [];

                        // convert data to a visualization-friendly format
                        categories.forEach((c: string, i: number) => {
                            Array.from(Array(numOfGenomicPositions).keys()).forEach((g: number, j: number) => {
                                tabularData.push({
                                    [rowName]: c,
                                    [valueName]: numericValues[numOfGenomicPositions * i + j],
                                    [columnName]: tileX + (j + 0.5) * tileUnitSize,
                                    [startName]: tileX + j * tileUnitSize,
                                    [endName]: tileX + (j + 1) * tileUnitSize
                                });
                            });
                        });

                        tile.tileData.tabularData = tabularData;
                    } else if (spec.metadata.type === 'higlass-bed') {
                        const { genomicFields, exonIntervalFields, valueFields } = spec.metadata;

                        tile.tileData.tabularData = [];
                        tile.tileData.forEach((d: any) => {
                            const { chrOffset, fields } = d;

                            const datum: { [k: string]: number | string } = {};
                            genomicFields.forEach(g => {
                                datum[g.name] = +fields[g.index] + chrOffset;
                            });

                            // values
                            valueFields?.forEach(v => {
                                datum[v.name] = v.type === 'quantitative' ? +fields[v.index] : fields[v.index];
                            });

                            tile.tileData.tabularData.push({
                                ...datum,
                                type: 'gene' // this should be described in the spec
                            });

                            if (exonIntervalFields) {
                                const [exonStartField, exonEndField] = exonIntervalFields;
                                const exonStartStrs = (fields[exonStartField.index] as string).split(',');
                                const exonEndStrs = (fields[exonEndField.index] as string).split(',');

                                exonStartStrs.forEach((es, i) => {
                                    const ee = exonEndStrs[i];

                                    // exon
                                    tile.tileData.tabularData.push({
                                        ...datum,
                                        [exonStartField.name]: +es + chrOffset,
                                        [exonEndField.name]: +ee + chrOffset,
                                        type: 'exon'
                                    });

                                    // intron
                                    if (i + 1 < exonStartStrs.length) {
                                        const nextEs = exonStartStrs[i + 1];
                                        tile.tileData.tabularData.push({
                                            ...datum,
                                            [exonStartField.name]: +ee + chrOffset,
                                            [exonEndField.name]: +nextEs + chrOffset,
                                            type: 'intron'
                                        });
                                    }
                                });
                            }
                        });
                        /// DEBUG
                        // console.log(tile.tileData.tabularData);
                        // console.log(new Set(tile.tileData.tabularData.map((d: any) => d.significance)));
                    }
                }

                if (semanticZoomTriggered && tile.tileData.tabularDataAlt) {
                    // This means we are using an alternative dataset for semantic zooming
                    tile.tileData.tabularDataFiltered = Array.from(tile.tileData.tabularDataAlt);
                } else {
                    tile.tileData.tabularDataFiltered = Array.from(tile.tileData.tabularData);
                }

                // Apply filters
                if (spec.dataTransform !== undefined && IsDataTransform(spec.dataTransform)) {
                    spec.dataTransform.filter.forEach(filter => {
                        const { field, oneOf, not } = filter;
                        tile.tileData.tabularDataFiltered = tile.tileData.tabularDataFiltered.filter(
                            (d: { [k: string]: number | string }) => {
                                return not
                                    ? (oneOf as any[]).indexOf(d[field]) === -1
                                    : (oneOf as any[]).indexOf(d[field]) !== -1;
                            }
                        );
                    });
                }

                // Construct separate gemini models for individual tiles
                const gm = new GeminiTrackModel(spec, tile.tileData.tabularDataFiltered, false);

                // Add a track model to the tile object
                tile.geminiModels.push(gm);

                // we need to sync the domain of y-axis so that all tiles are aligned each other
                // this.setGlobalScales();
            });

            return tile.geminiModels;
        }

        /**
         * Re-align the sprites of all visible tiles when zooming and panning.
         */
        rescaleTiles() {
            return; // TODO: we are temporally drawing marks everytime.

            const visibleAndFetched = this.visibleAndFetchedTiles();
            const trackHeight = this.dimensions[1];

            this.setGlobalScales();

            visibleAndFetched.map((tile: any) => {
                if (!tile.extent || !tile.rowScale) {
                    // data is not ready
                    return;
                }

                // TODO:
                if (tile.extent.y.min === 0 && tile.extent.y.max === 0) {
                    // y channel is not being used
                    return;
                }

                // rescale y position of each graphics
                // TODO: do this only when neccesary? For example, we do not need to do this for heatmaps
                const rowHeight =
                    // if `tile.rowScale.domain()` is `undefined`, we are using constant value
                    trackHeight / (!tile.rowScale.domain ? 1 : tile.rowScale.domain().length);
                const yScale = d3
                    .scaleLinear()
                    .domain([0, Math.abs(this.extent.min) + this.extent.max])
                    .range([0, rowHeight]);
                const tileBaseline = rowHeight - yScale(Math.abs(this.extent.min));
                const tileHeight = yScale(tile.extent.y.min + tile.extent.y.max);
                const tileY = tileBaseline - yScale(tile.extent.y.max);

                const sprites = tile.spriteInfos;
                if (!sprites) return;

                sprites.forEach((spriteInfo: SpriteInfo) => {
                    const { sprite, scaleKey } = spriteInfo;

                    sprite.height = tileHeight;
                    sprite.y = tileY + tile.rowScale(scaleKey);
                });
            });
        }

        // rerender all tiles every time track size is changed
        setDimensions(newDimensions: any) {
            this.oldDimensions = this.dimensions;
            super.setDimensions(newDimensions);

            const visibleAndFetched = this.visibleAndFetchedTiles();
            visibleAndFetched.map((a: any) => this.initTile(a));
        }

        getIndicesOfVisibleDataInTile(tile: any) {
            const visible = this._xScale.range();

            if (!this.tilesetInfo) return [null, null];

            const { tileX, tileWidth } = this.getTilePosAndDimensions(
                tile.tileData.zoomLevel,
                tile.tileData.tilePos,
                this.tilesetInfo.bins_per_dimension || this.tilesetInfo.tile_size
            );

            const tileXScale = d3
                .scaleLinear()
                .domain([0, this.tilesetInfo.tile_size || this.tilesetInfo.bins_per_dimension])
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
        minVisibleValue() {}
        // minVisibleValue(ignoreFixedScale = false) {
        //     let visibleAndFetchedIds = this.visibleAndFetchedIds();

        //     if (visibleAndFetchedIds.length === 0) {
        //     visibleAndFetchedIds = Object.keys(this.fetchedTiles);
        //     }

        //     const minimumsPerTile = visibleAndFetchedIds
        //     .map(x => this.fetchedTiles[x])
        //     .map(tile => {
        //         const ind = this.getIndicesOfVisibleDataInTile(tile);
        //         return tile.tileData.denseDataExtrema.getMinNonZeroInSubset(ind);
        //     });

        //     const min = Math.min(...minimumsPerTile);

        //     if (ignoreFixedScale) return min;

        //     return this.valueScaleMin !== null ? this.valueScaleMin : min;
        // }

        /**
         * Returns the maximum in the visible area (not visible tiles)
         */
        maxVisibleValue() {}
        //   maxVisibleValue(ignoreFixedScale = false) {
        //     let visibleAndFetchedIds = this.visibleAndFetchedIds();

        //     if (visibleAndFetchedIds.length === 0) {
        //       visibleAndFetchedIds = Object.keys(this.fetchedTiles);
        //     }

        //     const maximumsPerTile = visibleAndFetchedIds
        //       .map(x => this.fetchedTiles[x])
        //       .map(tile => {
        //         const ind = this.getIndicesOfVisibleDataInTile(tile);
        //         return tile.tileData.denseDataExtrema.getMaxNonZeroInSubset(ind);
        //       });

        //     const max = Math.max(...maximumsPerTile);

        //     if (ignoreFixedScale) return max;

        //     return this.valueScaleMax !== null ? this.valueScaleMax : max;
        //   }

        draw() {
            super.draw();
        }
        drawTile(tile: any) {
            this.renderTile(tile);
        } // prevent BarTracks draw method from having an effect
        exportSVG() {}
        getMouseOverHtml() {}
    }
    return new GeminiTrackClass(args);
}

const icon =
    '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// default
GeminiTrack.config = {
    type: 'gemini-track',
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
        axisPositionHorizontal: 'left'
    }
};

export default GeminiTrack;
