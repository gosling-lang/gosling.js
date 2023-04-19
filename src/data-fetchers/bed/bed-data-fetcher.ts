import { dsvFormat as d3dsvFormat } from 'd3-dsv';
import { computeChromSizes } from '../../core/utils/assembly';
import { sampleSize } from 'lodash-es';
import type { Assembly, BedData, FilterTransform } from '@gosling.schema';
import { filterData } from '../../core/utils/data-transform';
import { type CommonDataConfig, filterUsingGenoPos } from '../utils';

type BedDataConfig = BedData & CommonDataConfig & { filter: FilterTransform[] };

/**
 * HiGlass data fetcher specific for Gosling which fetches BED files
 */
function BedDataFetcher(HGC: any, ...args: any): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    class BedDataFetcherClass {
        private dataConfig: BedDataConfig;
        // @ts-ignore
        private tilesetInfoLoading: boolean;
        private dataPromise: Promise<any> | undefined;
        private chromSizes: any;
        private values: any;
        private assembly: Assembly;
        private filter: FilterTransform[] | undefined;

        constructor(params: any[]) {
            const [dataConfig] = params;
            this.dataConfig = dataConfig;
            this.tilesetInfoLoading = false;
            this.assembly = this.dataConfig.assembly;
            this.filter = this.dataConfig.filter;

            if (!dataConfig.url) {
                console.error('Please provide the `url` of the data');
                return;
            }

            // Prepare chromosome interval information
            const chromosomeSizes: { [k: string]: number } = computeChromSizes(this.assembly).size;
            const chromosomeCumPositions: { id: number; chr: string; pos: number }[] = [];
            const chromosomePositions: { [k: string]: { id: number; chr: string; pos: number } } = {};
            let prevEndPosition = 0;

            Object.keys(computeChromSizes(this.assembly).size).forEach((chrStr, i) => {
                const positionInfo = {
                    id: i,
                    chr: chrStr,
                    pos: prevEndPosition
                };

                chromosomeCumPositions.push(positionInfo);
                chromosomePositions[chrStr] = positionInfo;

                prevEndPosition += computeChromSizes(this.assembly).size[chrStr];
            });
            this.chromSizes = {
                chrToAbs: (chrom: string, chromPos: number) => this.chromSizes.chrPositions[chrom].pos + chromPos,
                cumPositions: chromosomeCumPositions,
                chrPositions: chromosomePositions,
                totalLength: prevEndPosition,
                chromLengths: chromosomeSizes
            };

            if (dataConfig.data) {
                // we have raw data that we can use right away
                this.values = dataConfig.data;
            } else {
                this.dataPromise = this.fetchBed();
            }
        }
        /**
         * Determines the correct header names of the BED file, based on the number of columns in the file
         * and provided custom fields
         * @param customFields The custom fields passed in to the data configuration
         * @param n_cols the number of columns found in the bed file
         * @returns array of the headers of the bed file
         */
        static #determineHeader(customFields: string[], n_cols: number): string[] {
            const standardHeaders = [
                'chrom',
                'chromStart',
                'chromEnd',
                'name',
                'score',
                'strand',
                'thickStart',
                'thickEnd',
                'itemRgb',
                'blockCount',
                'blockSizes',
                'myField'
            ];

            if (customFields.length === 0) {
                if (n_cols > standardHeaders.length) {
                    console.warn('BED file error: more columns found than expected');
                }
                return standardHeaders.slice(0, n_cols);
            }
            if (n_cols > standardHeaders.length) {
                if (n_cols !== standardHeaders.length + customFields.length) {
                    console.warn(`BED file error: unexpected number of custom fields. Found ${n_cols} columns 
                    which is different from the expected ${standardHeaders.length + customFields.length}`);
                }
                return standardHeaders.concat(customFields);
            } else {
                return standardHeaders.slice(0, n_cols - customFields.length).concat(customFields);
            }
        }
        /**
         * Calculates the number column in a tabular data string
         * @param tabularString: the tabular data in string format
         * @param separator: the text delimiter of tabularString
         */
        static #calcNCols(tabularString: string, separator: string): number {
            const newLinePos = tabularString.indexOf('\n');
            const firstRow = tabularString.slice(0, newLinePos);
            return firstRow.split(separator).length;
        }

        fetchBed() {
            const { url } = this.dataConfig;
            const customFields = this.dataConfig.customFields ?? [];
            const separator = this.dataConfig.separator ?? '\t';

            return fetch(url)
                .then(response => {
                    return response.ok ? response.text() : Promise.reject(response.status);
                })
                .then(text => {
                    const n_cols = BedDataFetcherClass.#calcNCols(text, separator);
                    const headerNames = BedDataFetcherClass.#determineHeader(customFields, n_cols);

                    const textWithHeader = headerNames ? `${headerNames.join(separator)}\n${text}` : text;
                    return d3dsvFormat(separator).parse(textWithHeader);
                })
                .then(json => {
                    this.values = json;
                })
                .catch(error => {
                    console.error('[Gosling Data Fetcher] Error fetching data', error);
                });
        }

        generateTilesetInfo(callback?: any) {
            this.tilesetInfoLoading = false;

            const TILE_SIZE = 1024;
            const totalLength = this.chromSizes.totalLength;
            const retVal = {
                tile_size: TILE_SIZE,
                max_zoom: Math.ceil(Math.log(totalLength / TILE_SIZE) / Math.log(2)),
                max_width: totalLength,
                min_pos: [0, 0],
                max_pos: [totalLength, totalLength]
            };

            if (callback) {
                callback(retVal);
            }

            return retVal;
        }

        tilesetInfo(callback?: any) {
            if (!this.dataPromise) {
                // data promise is not prepared yet
                return;
            }

            this.tilesetInfoLoading = true;

            return this.dataPromise
                .then(() => this.generateTilesetInfo(callback))
                .catch(err => {
                    this.tilesetInfoLoading = false;
                    console.error('[Gosling Data Fetcher] Error parsing data:', err);
                });
        }

        fetchTilesDebounced(receivedTiles: any, tileIds: any) {
            const tiles: { [k: string]: any } = {};

            const validTileIds: any[] = [];
            const tilePromises = [];

            for (const tileId of tileIds) {
                const parts = tileId.split('.');
                const z = parseInt(parts[0], 10);
                const x = parseInt(parts[1], 10);
                const y = parseInt(parts[2], 10);

                if (Number.isNaN(x) || Number.isNaN(z)) {
                    console.warn('[Gosling Data Fetcher] Invalid tile zoom or position:', z, x, y);
                    continue;
                }

                validTileIds.push(tileId);
                tilePromises.push(this.tile(z, x, y));
            }

            Promise.all(tilePromises).then(values => {
                values.forEach((value, i) => {
                    const validTileId = validTileIds[i];
                    tiles[validTileId] = value;
                    tiles[validTileId].tilePositionId = validTileId;
                });
                receivedTiles(tiles);
            });

            return tiles;
        }

        tile(z: any, x: any, y: any) {
            return this.tilesetInfo()?.then((tsInfo: any) => {
                const tileWidth = +tsInfo.max_width / 2 ** +z;

                // get the bounds of the tile
                const minX = tsInfo.min_pos[0] + x * tileWidth;
                const maxX = tsInfo.min_pos[0] + (x + 1) * tileWidth;

                // filter the data so that only the visible data is sent to tracks
                let tabularData = filterUsingGenoPos(this.values, [minX, maxX], this.dataConfig);

                // filter data based on the `DataTransform` spec
                this.filter?.forEach(f => {
                    tabularData = filterData(f, tabularData);
                });

                const sizeLimit = this.dataConfig.sampleLength ?? 1000;
                return {
                    // sample the data to make it managable for visualization components
                    tabularData: tabularData.length > sizeLimit ? sampleSize(tabularData, sizeLimit) : tabularData,
                    server: null,
                    tilePos: [x, y],
                    zoomLevel: z
                };
            });
        }
    }

    return new BedDataFetcherClass(args);
}

BedDataFetcher.config = {
    type: 'bed'
};

export default BedDataFetcher;
