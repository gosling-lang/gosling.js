import { computeChromSizes } from '../../core/utils/assembly';
import { sampleSize } from 'lodash-es';
import type { Assembly, JsonData } from '@gosling.schema';
import { type CommonDataConfig, filterUsingGenoPos, sanitizeChrName } from '../utils';

type CsvDataConfig = JsonData & CommonDataConfig;

/**
 * HiGlass data fetcher specific for Gosling which ultimately will accept any types of data other than JSON values.
 */
function JsonDataFetcher(HGC: any, ...args: any): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    class JsonDataFetcherClass {
        private dataConfig: CsvDataConfig;
        // @ts-ignore
        private tilesetInfoLoading: boolean;
        private chromSizes: any;
        private values: any;
        private assembly: Assembly;

        constructor(params: any[]) {
            const [dataConfig] = params;
            this.dataConfig = dataConfig;
            this.tilesetInfoLoading = false;
            this.assembly = this.dataConfig.assembly;

            if (!dataConfig.values) {
                console.error('Please provide `values` of the JSON data');
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

            const { chromosomeField, genomicFields, genomicFieldsToConvert } = this.dataConfig;
            this.values = dataConfig.values.map((row: any) => {
                try {
                    if (genomicFieldsToConvert) {
                        // This spec is used when multiple chromosomes are stored in a single row
                        genomicFieldsToConvert.forEach(chromMap => {
                            const genomicFields = chromMap.genomicFields;
                            const chromName = sanitizeChrName(row[chromMap.chromosomeField], this.assembly) as string;

                            genomicFields.forEach((positionCol: string) => {
                                const chromPosition = row[positionCol] as string;
                                row[positionCol] = String(this.chromSizes.chrToAbs(chromName, chromPosition));
                            });
                        });
                    } else if (chromosomeField && genomicFields) {
                        genomicFields.forEach((positionCol: string) => {
                            const chromPosition = row[positionCol] as string;
                            const chromName = sanitizeChrName(row[chromosomeField], this.assembly) as string;
                            row[positionCol] = String(this.chromSizes.chrToAbs(chromName, chromPosition));
                        });
                    }
                    return row;
                } catch {
                    // skip the rows that had errors in them
                    return undefined;
                }
            });
        }

        tilesetInfo(callback?: any) {
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
            const tsInfo = this.tilesetInfo();
            const tileWidth = +tsInfo.max_width / 2 ** +z;

            // get the bounds of the tile
            const minX = tsInfo.min_pos[0] + x * tileWidth;
            const maxX = tsInfo.min_pos[0] + (x + 1) * tileWidth;

            // filter the data so that visible data is sent to tracks
            let tabularData = filterUsingGenoPos(this.values, [minX, maxX], this.dataConfig);

            // sample the data to make it managable for visualization components
            const sizeLimit = this.dataConfig.sampleLength ?? 1000;
            if (sizeLimit < tabularData.length) {
                tabularData = sampleSize(tabularData, sizeLimit);
            }

            return {
                tabularData,
                server: null,
                tilePos: [x, y],
                zoomLevel: z
            };
        }
    }

    return new JsonDataFetcherClass(args);
}

JsonDataFetcher.config = {
    type: 'json'
};

export default JsonDataFetcher;
