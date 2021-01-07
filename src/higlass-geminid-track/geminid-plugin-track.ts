import { drawMark } from '../core/mark';
import { GeminidTrackModel } from '../core/geminid-track-model';
import { validateTrack } from '../core/utils/validate';
import { shareScaleAcrossTracks } from '../core/utils/scales';
import { resolveSuperposedTracks } from '../core/utils/superpose';
import { Track } from '../core/geminid.schema';
import {
    getOrientation,
    IsDataMetadata,
    IsDataTransform,
    IsIncludeFilter,
    IsOneOfFilter,
    IsRangeFilter,
    Orientation
} from '../core/geminid.schema.guards';
import { Tooltip } from '../geminid-tooltip';

function GeminidTrack(HGC: any, ...args: any[]): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    // Services
    const { tileProxy } = HGC.services;

    class GeminidTrackClass extends HGC.tracks.TiledPixiTrack {
        private originalSpec: Track;
        private tooltips: Tooltip[];
        private trackOrientation: Orientation;
        // TODO: add members that are used explicitly in the code

        constructor(params: any[]) {
            super(...params); // context, options

            this.originalSpec = this.options.spec;
            this.trackOrientation = getOrientation(resolveSuperposedTracks(this.originalSpec)[0]);

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

            HGC.libraries.PIXI.GRAPHICS_CURVES.adaptive = false;
        }

        initTile(tile: any) {
            this.tooltips = [];
            this.svgData = [];
            this.textsBeingUsed = 0;

            // preprocess all tiles at once so that we can share the value scales
            this.preprocessAllTiles();

            this.renderTile(tile);
        }

        setPosition(newPosition: any) {
            super.setPosition(newPosition);

            this.pMain.position.y = this.position[1];
            this.pMain.position.x = this.position[0];
        }

        zoomed(newXScale: any, newYScale: any) {
            this.xScale(newXScale);
            this.yScale(newYScale);

            this.refreshTiles(); // or this.refreshTilesDebounced();

            this.draw();
        }

        refreshTiles() {
            if (!this.tilesetInfo) {
                return;
            }

            this.calculateVisibleTiles();

            // tiles that are fetched
            const fetchedTileIDs = new Set(Object.keys(this.fetchedTiles));

            // fetch the tiles that should be visible but haven't been fetched
            // and aren't in the process of being fetched
            const toFetch = [...this.visibleTiles].filter(
                x => !this.fetching.has(x.remoteId) && !fetchedTileIDs.has(x.tileId)
            );

            toFetch.forEach(f => {
                this.fetching.add(f.remoteId);
            });

            this.removeOldTiles();
            this.fetchNewTiles(toFetch);
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

        updateTile() {
            // preprocess all tiles at once so that we can share the value scales
            this.preprocessAllTiles();

            this.visibleAndFetchedTiles().forEach((tile: any) => {
                this.renderTile(tile);
            });

            // TODO: Should rerender tile only when neccesary for performance
            // e.g., changing color scale
            // ...
        }

        // draws exactly one tile
        renderTile(tile: any) {
            this.destroyTile(tile);

            // TODO: seems to be not being used by TiledPixiTrack
            // tile.drawnAtScale = this._xScale.copy(); // being used in `draw()` internally

            if (!tile.geminidModels) {
                // we do not have a track model prepared to visualize
                return;
            }

            tile.geminidModels.forEach((tm: GeminidTrackModel) => {
                // check visibility condition
                if (!tm.trackVisibility({ zoomLevel: tile?.tileData?.zoomLevel })) {
                    return;
                }

                drawMark(HGC, this, tile, tm);
            });
        }

        destroyTile(tile: any) {
            tile.mouseOverData = null;
            tile.graphics.clear();
            tile.graphics.removeChildren();
            this.pBorder.clear();
            this.pBorder.removeChildren();
        }

        drawTile(tile: any) {
            this.renderTile(tile);
        }

        preprocessAllTiles() {
            const gms: GeminidTrackModel[] = [];
            this.visibleAndFetchedTiles().forEach((tile: any) => {
                // tile preprocessing is done only once per tile
                const tileModels = this.preprocessTile(tile);
                tileModels.forEach((m: GeminidTrackModel) => {
                    gms.push(m);
                });
            });

            shareScaleAcrossTracks(gms);

            // IMPORTANT: If no genomic fields specified, no point to use multiple tiles, i.e., we need to draw a track only once with the data combined.
            /*
            if (!getGenomicChannelKeyFromTrack(this.originalSpec) && false) {
                // TODO:
                const visibleModels: GeminiTrackModel[][] = this.visibleAndFetchedTiles().map(
                    (d: any) => d.geminidModels
                );
                const modelsWeUse: GeminiTrackModel[] = visibleModels[0];
                const modelsWeIgnore: GeminiTrackModel[][] = visibleModels.slice(1);

                // concatenate the rows in the data
                modelsWeIgnore.forEach((ignored, i) => {
                    modelsWeUse.forEach(m => {
                        m.addDataRows(ignored[0].data());
                    });
                    this.visibleAndFetchedTiles()[i + 1].geminidModels = [];
                });
            }
            */
        }

        // TODO: Encapsulate this function
        /**
         * Construct tabular data from a higlass tileset and a gemini track model.
         * Return the generated gemini track model.
         */
        preprocessTile(tile: any) {
            if (tile.geminidModels && tile.geminidModels.length !== 0) {
                // already have the geminid models constructed
                return tile.geminidModels;
            }

            // Single tile can contain multiple Gemini models if multiple tracks are superposed.
            tile.geminidModels = [];

            // TODO: IMPORTANT: semantic zooming could be ultimately considered as superposing multiple tracks, and
            // its visibility is determined by certain user-defined condition.

            const spec = JSON.parse(JSON.stringify(this.originalSpec));

            resolveSuperposedTracks(spec).forEach(resolved => {
                if (resolved.mark === 'rect-brush') {
                    // TODO:
                    // we do not draw rectangular brush ourselves, higlass does.
                    return;
                }

                if (!tile.tileData.tabularData) {
                    if (!IsDataMetadata(resolved.metadata)) {
                        console.warn('No metadata of tilesets specified');
                        return;
                    }

                    // TODO: encapsulation this conversion part
                    if (resolved.metadata.type === 'higlass-vector') {
                        if (!resolved.metadata.column || !resolved.metadata.value) {
                            console.warn(
                                'Proper metadata of the tileset is not provided. Please specify the name of data fields.'
                            );
                            return;
                        }

                        const bin = resolved.metadata.bin ?? 1;
                        const tileSize = this.tilesetInfo.tile_size;

                        const { tileX, tileWidth } = this.getTilePosAndDimensions(
                            tile.tileData.zoomLevel,
                            tile.tileData.tilePos,
                            tileSize
                        );

                        const numericValues = tile.tileData.dense;
                        const numOfGenomicPositions = tileSize;
                        const tileUnitSize = tileWidth / tileSize;

                        const valueName = resolved.metadata.value;
                        const columnName = resolved.metadata.column;
                        const startName = resolved.metadata.start ?? 'start';
                        const endName = resolved.metadata.end ?? 'end';

                        const tabularData: { [k: string]: number | string }[] = [];

                        // convert data to a visualization-friendly format
                        let cumVal = 0;
                        let binStart = Number.MIN_SAFE_INTEGER;
                        let binEnd = Number.MAX_SAFE_INTEGER;
                        Array.from(Array(numOfGenomicPositions).keys()).forEach((g: number, j: number) => {
                            // add individual rows
                            if (bin === 1) {
                                tabularData.push({
                                    [valueName]: numericValues[j] / tileUnitSize,
                                    [columnName]: tileX + (j + 0.5) * tileUnitSize,
                                    [startName]: tileX + j * tileUnitSize,
                                    [endName]: tileX + (j + 1) * tileUnitSize
                                });
                            } else {
                                // EXPERIMENTAL: bin the data considering the `bin` options
                                if (j % bin === 0) {
                                    // Start storing information for this bin
                                    cumVal = numericValues[j];
                                    binStart = j;
                                    binEnd = j + bin;
                                } else if (j % bin === bin - 1) {
                                    // Add a row using the cumulative value
                                    tabularData.push({
                                        [valueName]: cumVal / bin / tileUnitSize,
                                        [columnName]: tileX + (binStart + bin / 2.0) * tileUnitSize,
                                        [startName]: tileX + binStart * tileUnitSize,
                                        [endName]: tileX + binEnd * tileUnitSize
                                    });
                                } else if (j === numOfGenomicPositions - 1) {
                                    // Manage the remainders. Just add them as a single row.
                                    const smallBin = numOfGenomicPositions % bin;
                                    const correctedBinEnd = binStart + smallBin;
                                    tabularData.push({
                                        [valueName]: cumVal / smallBin / tileUnitSize,
                                        [columnName]: tileX + (binStart + smallBin / 2.0) * tileUnitSize,
                                        [startName]: tileX + binStart * tileUnitSize,
                                        [endName]: tileX + correctedBinEnd * tileUnitSize
                                    });
                                } else {
                                    // Add a current value
                                    cumVal += numericValues[j];
                                }
                            }
                        });

                        tile.tileData.tabularData = tabularData;
                    } else if (resolved.metadata.type === 'higlass-matrix') {
                        if (!resolved.metadata.row || !resolved.metadata.column || !resolved.metadata.value) {
                            console.warn(
                                'Proper metadata of the tileset is not provided. Please specify the name of data fields.'
                            );
                            return;
                        }

                        const tileSize = this.tilesetInfo.bins_per_dimension || this.tilesetInfo.tile_size;

                        const { tileX, tileY, tileWidth, tileHeight } = this.getTilePosAndDimensions(
                            tile.tileData.zoomLevel,
                            tile.tileData.tilePos,
                            tileSize
                        );

                        const numericValues = tile.tileData.dense;
                        const tileUnitWidth = tileWidth / tileSize;
                        const tileUnitHeight = tileHeight / tileSize;

                        const rowName = resolved.metadata.row;
                        const columnName = resolved.metadata.column;
                        const valueName = resolved.metadata.value;

                        const tabularData: { [k: string]: number | string }[] = [];

                        let limitForTest = 0;
                        for (let r = 0; r < tileSize; r++) {
                            for (let c = 0; c < tileSize; c++) {
                                tabularData.push({
                                    [columnName]: tileX + (c + 0.5) * tileUnitWidth,
                                    startX: tileX + c * tileUnitWidth,
                                    endX: tileX + (c + 1) * tileUnitWidth,
                                    [rowName]: tileY + (r + 0.5) * tileUnitHeight,
                                    startY: tileY + r * tileUnitHeight,
                                    endY: tileY + (r + 1) * tileUnitHeight,
                                    [valueName]: numericValues[r * tileSize + c]
                                });
                                if (limitForTest++ > 5000) {
                                    break;
                                }
                            }
                            if (limitForTest > 5000) {
                                break;
                            }
                        }
                        tile.tileData.tabularData = tabularData;

                        /// DEBUG
                        // console.log(tabularData);
                        ///
                    } else if (resolved.metadata.type === 'higlass-multivec') {
                        if (!resolved.metadata.row || !resolved.metadata.column || !resolved.metadata.value) {
                            console.warn(
                                'Proper metadata of the tileset is not provided. Please specify the name of data fields.'
                            );
                            return;
                        }

                        const bin = resolved.metadata.bin ?? 1;
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

                        const rowName = resolved.metadata.row;
                        const valueName = resolved.metadata.value;
                        const columnName = resolved.metadata.column;
                        const startName = resolved.metadata.start ?? 'start';
                        const endName = resolved.metadata.end ?? 'end';
                        const categories: any = resolved.metadata.categories ?? [...Array(numOfTotalCategories).keys()]; // TODO:

                        const tabularData: { [k: string]: number | string }[] = [];

                        // convert data to a visualization-friendly format
                        categories.forEach((c: string, i: number) => {
                            let cumVal = 0;
                            let binStart = Number.MIN_SAFE_INTEGER;
                            let binEnd = Number.MAX_SAFE_INTEGER;
                            Array.from(Array(numOfGenomicPositions).keys()).forEach((g: number, j: number) => {
                                // add individual rows
                                if (bin === 1) {
                                    tabularData.push({
                                        [rowName]: c,
                                        [valueName]: numericValues[numOfGenomicPositions * i + j] / tileUnitSize,
                                        [columnName]: tileX + (j + 0.5) * tileUnitSize,
                                        [startName]: tileX + j * tileUnitSize,
                                        [endName]: tileX + (j + 1) * tileUnitSize
                                    });
                                } else {
                                    // EXPERIMENTAL: bin the data considering the `bin` options
                                    if (j % bin === 0) {
                                        // Start storing information for this bin
                                        cumVal = numericValues[numOfGenomicPositions * i + j];
                                        binStart = j;
                                        binEnd = j + bin;
                                    } else if (j % bin === bin - 1) {
                                        // Add a row using the cumulative value
                                        tabularData.push({
                                            [rowName]: c,
                                            [valueName]: cumVal / bin / tileUnitSize,
                                            [columnName]: tileX + (binStart + bin / 2.0) * tileUnitSize,
                                            [startName]: tileX + binStart * tileUnitSize,
                                            [endName]: tileX + binEnd * tileUnitSize
                                        });
                                    } else if (j === numOfGenomicPositions - 1) {
                                        // Manage the remainders. Just add them as a single row.
                                        const smallBin = numOfGenomicPositions % bin;
                                        const correctedBinEnd = binStart + smallBin;
                                        tabularData.push({
                                            [rowName]: c,
                                            [valueName]: cumVal / smallBin / tileUnitSize,
                                            [columnName]: tileX + (binStart + smallBin / 2.0) * tileUnitSize,
                                            [startName]: tileX + binStart * tileUnitSize,
                                            [endName]: tileX + correctedBinEnd * tileUnitSize
                                        });
                                    } else {
                                        // Add a current value
                                        cumVal += numericValues[numOfGenomicPositions * i + j];
                                    }
                                }
                            });
                        });

                        tile.tileData.tabularData = tabularData;
                    } else if (resolved.metadata.type === 'higlass-bed') {
                        const { genomicFields, exonIntervalFields, valueFields } = resolved.metadata;

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

                /// DEBUG
                // console.log(tile.tileData.tabularData);
                ///

                tile.tileData.tabularDataFiltered = Array.from(tile.tileData.tabularData);

                // Apply filters
                if (resolved.dataTransform !== undefined && IsDataTransform(resolved.dataTransform)) {
                    resolved.dataTransform.filter.forEach(filter => {
                        if (IsOneOfFilter(filter)) {
                            const { field, oneOf, not } = filter;
                            tile.tileData.tabularDataFiltered = tile.tileData.tabularDataFiltered.filter(
                                (d: { [k: string]: number | string }) => {
                                    return not
                                        ? (oneOf as any[]).indexOf(d[field]) === -1
                                        : (oneOf as any[]).indexOf(d[field]) !== -1;
                                }
                            );
                        } else if (IsRangeFilter(filter)) {
                            const { field, inRange, not } = filter;
                            tile.tileData.tabularDataFiltered = tile.tileData.tabularDataFiltered.filter(
                                (d: { [k: string]: number | string }) => {
                                    return not
                                        ? !(inRange[0] <= d[field] && d[field] <= inRange[1])
                                        : inRange[0] <= d[field] && d[field] <= inRange[1];
                                }
                            );
                        } else if (IsIncludeFilter(filter)) {
                            const { field, include, not } = filter;
                            tile.tileData.tabularDataFiltered = tile.tileData.tabularDataFiltered.filter(
                                (d: { [k: string]: number | string }) => {
                                    return not ? `${d[field]}`.includes(include) : !`${d[field]}`.includes(include);
                                }
                            );
                        }
                    });
                }

                // Construct separate gemini models for individual tiles
                const gm = new GeminidTrackModel(resolved, tile.tileData.tabularDataFiltered);

                // Add a track model to the tile object
                tile.geminidModels.push(gm);
            });

            return tile.geminidModels;
        }

        // rerender all tiles every time track size is changed
        setDimensions(newDimensions: any) {
            this.oldDimensions = this.dimensions;
            super.setDimensions(newDimensions);

            const visibleAndFetched = this.visibleAndFetchedTiles();
            visibleAndFetched.map((tile: any) => this.initTile(tile));
        }

        /**
         * Which scale should we use for calculating tile positions?
         *
         * Horizontal tracks should use the xScale and vertical tracks
         * should use the yScale
         *
         * This function should be overwritten by HorizontalTiled1DPixiTrack.js
         * and VerticalTiled1DPixiTrack.js
         */
        relevantScale() {
            return this._xScale;
        }

        calculateZoomLevel() {
            // offset by 2 because 1D tiles are more dense than 2D tiles
            // 1024 points per tile vs 256 for 2D tiles
            if (this.tilesetInfo.resolutions) {
                const zoomIndexX = tileProxy.calculateZoomLevelFromResolutions(
                    this.tilesetInfo.resolutions,
                    this._xScale,
                    this.tilesetInfo.min_pos[0],
                    this.tilesetInfo.max_pos[0] - 2
                );

                return zoomIndexX;
            }

            // the tileProxy calculateZoomLevel function only cares about the
            // difference between the minimum and maximum position
            const xZoomLevel = tileProxy.calculateZoomLevel(
                this._xScale,
                this.tilesetInfo.min_pos[0],
                this.tilesetInfo.max_pos[0],
                // bins_per_dimension is used for matrix dataset
                this.tilesetInfo.bins_per_dimension || this.tilesetInfo.tile_size
            );

            let zoomLevel = Math.min(xZoomLevel, this.maxZoom);
            zoomLevel = Math.max(zoomLevel, 0);

            return zoomLevel;
        }

        // getIndicesOfVisibleDataInTile(tile: any) {
        //     const visibleX = this._xScale.range();
        //     const visibleY = this._yScale.range();

        //     const tilePos = tile.mirrored
        //       ? [tile.tileData.tilePos[1], tile.tileData.tilePos[0]]
        //       : tile.tileData.tilePos;

        //     const {
        //       tileX,
        //       tileY,
        //       tileWidth,
        //       tileHeight,
        //     } = this.getTilePosAndDimensions(
        //       tile.tileData.zoomLevel,
        //       tilePos,
        //       this.binsPerTile(),
        //     );

        //     const tileXScale = d3.scaleLinear()
        //       .domain([0, this.binsPerTile()])
        //       .range([tileX, tileX + tileWidth]);

        //     const startX = Math.max(
        //       0,
        //       Math.round(tileXScale.invert(this._xScale.invert(visibleX[0]))) - 1,
        //     );

        //     const endX = Math.min(
        //       this.binsPerTile(),
        //       Math.round(tileXScale.invert(this._xScale.invert(visibleX[1]))),
        //     );

        //     const tileYScale = d3.scaleLinear()
        //       .domain([0, this.binsPerTile()])
        //       .range([tileY, tileY + tileHeight]);

        //     const startY = Math.max(
        //       0,
        //       Math.round(tileYScale.invert(this._yScale.invert(visibleY[0]))) - 1,
        //     );

        //     const endY = Math.min(
        //       this.binsPerTile(),
        //       Math.round(tileYScale.invert(this._yScale.invert(visibleY[1]))),
        //     );

        //     const result =
        //       tile.mirrored && tilePos[0] !== tilePos[1]
        //         ? [startY, startX, endY, endX]
        //         : [startX, startY, endX, endY];

        //     return result;
        //   }

        calculateVisibleTiles() {
            if (!this.tilesetInfo) {
                // if we don't know anything about this dataset, no point in trying to get tiles
                return;
            }

            // calculate the zoom level given the scales and the data bounds
            this.zoomLevel = this.calculateZoomLevel();

            if (this.tilesetInfo.resolutions) {
                const sortedResolutions = this.tilesetInfo.resolutions
                    .map((x: any) => +x)
                    .sort((a: any, b: any) => b - a);

                this.xTiles = tileProxy.calculateTilesFromResolution(
                    sortedResolutions[this.zoomLevel],
                    this._xScale,
                    this.tilesetInfo.min_pos[0],
                    this.tilesetInfo.max_pos[0]
                );

                if (this.trackOrientation === 'matrix') {
                    // it makes sense only when the y-axis is being used for a genomic field
                    this.yTiles = tileProxy.calculateTilesFromResolution(
                        sortedResolutions[this.zoomLevel],
                        this._yScale,
                        this.tilesetInfo.min_pos[0],
                        this.tilesetInfo.max_pos[0]
                    );
                }
            } else {
                this.xTiles = tileProxy.calculateTiles(
                    this.zoomLevel,
                    this._xScale,
                    this.tilesetInfo.min_pos[0],
                    this.tilesetInfo.max_pos[0],
                    this.tilesetInfo.max_zoom,
                    this.tilesetInfo.max_width
                );

                if (this.trackOrientation === 'matrix') {
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
            }

            this.setVisibleTiles(this.tilesToId(this.xTiles, this.yTiles, this.zoomLevel));
        }

        /**
         * Convert tile positions to tile IDs
         */
        tilesToId(xTiles: any[], yTiles: any[], zoomLevel: any) {
            if (xTiles && !yTiles) {
                // this means only the `x` axis is being used
                return xTiles.map(x => [zoomLevel, x]);
            }

            // this means `x` and `y` axes are being used together
            const tiles: any = [];
            xTiles.forEach(x => yTiles.forEach(y => tiles.push([zoomLevel, x, y])));
            return tiles;
        }

        BINS_PER_TILE = 256;

        binsPerTile() {
            return this.tilesetInfo.bins_per_dimension || this.BINS_PER_TILE;
        }

        /**
         * Get the tile's position in its coordinate system.
         *
         * @description
         * Normally the absolute coordinate system are the genome basepair positions
         */
        getTilePosAndDimensions(zoomLevel: number, tilePos: any, binsPerTileIn: any) {
            /**
             * Get the tile's position in its coordinate system.
             */
            const binsPerTile = binsPerTileIn || this.binsPerTile();

            if (this.tilesetInfo.resolutions) {
                const sortedResolutions = this.tilesetInfo.resolutions
                    .map((x: number) => +x)
                    .sort((a: number, b: number) => b - a);

                const chosenResolution = sortedResolutions[zoomLevel];

                const tileWidth = chosenResolution * binsPerTile;
                const tileHeight = tileWidth;

                const tileX = chosenResolution * binsPerTile * tilePos[0];
                const tileY = chosenResolution * binsPerTile * tilePos[1];

                return {
                    tileX,
                    tileY,
                    tileWidth,
                    tileHeight
                };
            }

            const xTilePos = tilePos[0];
            const yTilePos = tilePos[1];

            const minX = this.tilesetInfo.min_pos[0];

            const minY = this.options.reverseYAxis ? -this.tilesetInfo.max_pos[1] : this.tilesetInfo.min_pos[1];

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
                if (tooltip.markInfo.type === 'rect') {
                    this.mouseOverGraphics.lineStyle(
                        1,
                        HGC.utils.colorToHex('black'),
                        1, // alpha
                        1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                    );
                    this.mouseOverGraphics.beginFill(HGC.utils.colorToHex('white'), 0);

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
                        this.mouseOverGraphics.beginFill(HGC.utils.colorToHex('black'), 1);
                        this.mouseOverGraphics.drawCircle(cx, cy, 1);
                    }
                }

                if (this.originalSpec.tooltip) {
                    // render a tooltip
                    const content = (this.originalSpec.tooltip as any)
                        .map(
                            (d: any) =>
                                '<tr>' +
                                `<td style='padding: 4px 8px'>${d.field}</td>` +
                                `<td style='padding: 4px 8px'><b>${tooltip.datum[d.field]}</b></td>` +
                                '</tr>'
                        )
                        .join('');
                    return `<table style='text-align: left; margin-top: 12px'>${content}</table>`;
                }
            }
        }

        tileToLocalId(tile: any) {
            return tile.join('.');
        }

        tileToRemoteId(tile: any) {
            return tile.join('.');
        }
    }
    return new GeminidTrackClass(args);
}

// TODO: Change the icon
const icon =
    '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// default
GeminidTrack.config = {
    type: 'gemini-track',
    datatype: ['multivec', 'matrix', 'vector', 'csv', 'bed', 'json'],
    local: false, // TODO:
    orientation: '2d',
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

export default GeminidTrack;
