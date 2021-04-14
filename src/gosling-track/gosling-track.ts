import { drawMark } from '../core/mark';
import { GoslingTrackModel } from '../core/gosling-track-model';
import { validateTrack } from '../core/utils/validate';
import { shareScaleAcrossTracks } from '../core/utils/scales';
import { resolveSuperposedTracks } from '../core/utils/overlay';
import { SingleTrack, OverlaidTrack, Datum } from '../core/gosling.schema';
import { IsDataDeepTileset } from '../core/gosling.schema.guards';
import { Tooltip } from '../gosling-tooltip';
import { sampleSize, uniqBy } from 'lodash';
import { scaleLinear } from 'd3-scale';
import colorToHex from '../core/utils/color-to-hex';
import { calculateData, filterData } from '../core/utils/data-transform';

// For using libraries, refer to https://github.com/higlass/higlass/blob/f82c0a4f7b2ab1c145091166b0457638934b15f3/app/scripts/configs/available-for-plugins.js
function GoslingTrack(HGC: any, ...args: any[]): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    // TODO: change the parent class to a more generic one (e.g., TiledPixiTrack)
    class GoslingTrackClass extends HGC.tracks.BarTrack {
        private originalSpec: SingleTrack | OverlaidTrack;
        private tooltips: Tooltip[];
        private tileSize: number;
        // TODO: add members that are used explicitly in the code

        constructor(params: any[]) {
            const [context, options] = params;
            super(context, options);

            this.context = context;
            this.originalSpec = this.options.spec;
            this.tileSize = this.tilesetInfo?.tile_size ?? 1024;

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

        initTile(tile: any) {
            this.tooltips = [];
            this.svgData = [];
            this.textsBeingUsed = 0;

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
            tile.mouseOverData = null;
            tile.graphics.clear();
            tile.graphics.removeChildren();
            this.pBorder.clear();
            this.pBorder.removeChildren();
            tile.drawnAtScale = this._xScale.copy(); // being used in `draw()` internally

            if (!tile.goslingModels) {
                // we do not have a track model prepared to visualize
                return;
            }

            tile.goslingModels.forEach((tm: GoslingTrackModel) => {
                // check visibility condition
                const trackWidth = this.dimensions[1];
                const zoomLevel = this._xScale.invert(trackWidth) - this._xScale.invert(0);
                if (!tm.trackVisibility({ zoomLevel })) {
                    return;
                }

                drawMark(HGC, this, tile, tm, this.options.theme);
            });
        }

        /**
         * This function reorganize the tileset information so that it can be more conveniently managed afterwards.
         */
        reorganizeTileInfo() {
            // console.log(this.visibleAndFetchedTiles(), this.tilesetInfo.tile_size);
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
        shouldMergeTiles() {
            return (
                this.originalSpec.dataTransform?.find(t => t.type === 'displace') &&
                this.visibleAndFetchedTiles()?.[0]?.tileData &&
                // we do not need to combine tiles w/ multivec, vector, matrix
                !this.visibleAndFetchedTiles()?.[0]?.tileData.dense
            );
        }

        /**
         * Combile multiple tiles into a single large tile.
         * This is sometimes necessary, for example, when applying a displacement algorithm.
         */
        combineAllTiles() {
            if (!this.shouldMergeTiles()) {
                // This means we do not need to merge tiles
                return;
            }

            const tiles = this.visibleAndFetchedTiles();

            if (!tiles || tiles.length === 0) {
                // Does not make sense to merge tiles
                return;
            }

            // Increase the size of tiles by length
            this.tileSize = (this.tilesetInfo?.tile_size ?? 1024) * tiles.length;

            let newData: Datum[] = [];

            tiles.forEach((t: any, i: number) => {
                // Merge data
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

            this.combineAllTiles();

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

        // TODO: Encapsulate this function
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

            // TODO: IMPORTANT: semantic zooming could be ultimately considered as superposing multiple tracks, and
            // its visibility is determined by certain user-defined condition.

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

                if (!tile.gos.tabularData) {
                    if (!IsDataDeepTileset(resolved.data)) {
                        console.warn('No data is specified');
                        return;
                    }

                    // TODO: encapsulation this conversion part
                    if (resolved.data.type === 'vector' || resolved.data.type === 'bigwig') {
                        if (!resolved.data.column || !resolved.data.value) {
                            console.warn(
                                'Proper data configuration is not provided. Please specify the name of data fields.'
                            );
                            return;
                        }

                        const bin = resolved.data.binSize ?? 1;
                        const tileSize = this.tileSize;

                        const { tileX, tileWidth } = this.getTilePosAndDimensions(
                            tile.gos.zoomLevel,
                            tile.gos.tilePos,
                            tileSize
                        );

                        const numericValues = tile.gos.dense;
                        const numOfGenomicPositions = tileSize;
                        const tileUnitSize = tileWidth / tileSize;

                        const valueName = resolved.data.value;
                        const columnName = resolved.data.column;
                        const startName = resolved.data.start ?? 'start';
                        const endName = resolved.data.end ?? 'end';

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

                        tile.gos.tabularData = tabularData;
                    } else if (resolved.data.type === 'multivec') {
                        if (!resolved.data.row || !resolved.data.column || !resolved.data.value) {
                            console.warn(
                                'Proper data configuration is not provided. Please specify the name of data fields.'
                            );
                            return;
                        }

                        const bin = resolved.data.binSize ?? 1;
                        const tileSize = this.tileSize;

                        const { tileX, tileWidth } = this.getTilePosAndDimensions(
                            tile.gos.zoomLevel,
                            tile.gos.tilePos,
                            tileSize
                        );

                        const numOfTotalCategories = tile.gos.shape[0];
                        const numericValues = tile.gos.dense;
                        const numOfGenomicPositions = tile.gos.shape[1];
                        const tileUnitSize = tileWidth / tileSize;

                        const rowName = resolved.data.row;
                        const valueName = resolved.data.value;
                        const columnName = resolved.data.column;
                        const startName = resolved.data.start ?? 'start';
                        const endName = resolved.data.end ?? 'end';
                        const categories: any = resolved.data.categories ?? [...Array(numOfTotalCategories).keys()]; // TODO:

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

                        tile.gos.tabularData = tabularData;
                    } else if (resolved.data.type === 'beddb') {
                        const { genomicFields, exonIntervalFields, valueFields } = resolved.data;

                        tile.gos.tabularData = [];
                        tile.gos.raw.forEach((d: any) => {
                            const { chrOffset, fields } = d;

                            const datum: { [k: string]: number | string } = {};
                            genomicFields.forEach(g => {
                                datum[g.name] = +fields[g.index] + chrOffset;
                            });

                            // values
                            valueFields?.forEach(v => {
                                datum[v.name] = v.type === 'quantitative' ? +fields[v.index] : fields[v.index];
                            });

                            tile.gos.tabularData.push({
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
                                    tile.gos.tabularData.push({
                                        ...datum,
                                        [exonStartField.name]: +es + chrOffset,
                                        [exonEndField.name]: +ee + chrOffset,
                                        type: 'exon'
                                    });

                                    // intron
                                    if (i + 1 < exonStartStrs.length) {
                                        const nextEs = exonStartStrs[i + 1];
                                        tile.gos.tabularData.push({
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
                        // console.log(tile.gos.tabularData);
                        // console.log(new Set(tile.gos.tabularData.map((d: any) => d.significance)));
                    }
                }

                /// DEBUG
                // console.log(tile.gos.tabularData);
                ///

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
                            case 'log':
                                tile.gos.tabularDataFiltered = calculateData(t, tile.gos.tabularDataFiltered);
                                break;
                            case 'displace':
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
                                    const { maxRows } = t;
                                    const boundingBoxes: { start: number; end: number; row: number }[] = [];

                                    base.sort(
                                        (a: Datum, b: Datum) => (a[startField] as number) - (b[startField] as number)
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
                        const numOrRows = tile.gos.tabularData.length;
                        pubsub.publish('data-preview', {
                            id: this.context.id,
                            dataConfig: JSON.stringify({ data: resolved.data }),
                            data:
                                NUM_OF_ROWS_IN_PREVIEW > numOrRows
                                    ? tile.gos.tabularData
                                    : sampleSize(tile.gos.tabularData, NUM_OF_ROWS_IN_PREVIEW)
                            // ...
                        });
                    }
                } catch (e) {
                    // ..
                }

                // Construct separate gosling models for individual tiles
                const gm = new GoslingTrackModel(resolved, tile.gos.tabularDataFiltered);

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
            this.renderTile(tile);
        } // prevent BarTracks draw method from having an effect

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
