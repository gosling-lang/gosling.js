import * as d3 from 'd3-dsv';
import { CHROMOSOME_INTERVAL_HG38, CHROMOSOME_SIZE_HG38 } from '../core/utils/chrom-size';
import fetch from 'cross-fetch'; // TODO: Can we remove this and make the test working
import { sampleSize } from 'lodash';

/**
 * HiGlass data fetcher specific for Gemini which ultimately will accept any types of data other than CSV files.
 */
function CSVDataFetcher(HGC: any, ...args: any): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    class CSVDataFetcherClass {
        // @ts-ignore
        private dataConfig: GeminiDataConfig;
        // @ts-ignore
        private tilesetInfoLoading: boolean;
        private dataPromise: Promise<any> | undefined;
        private chromSizes: any;
        private values: any;

        constructor(params: any[]) {
            const [dataConfig] = params;
            this.dataConfig = dataConfig;
            this.tilesetInfoLoading = false;

            if (!dataConfig.url) {
                console.error('Please provide the `url` of the data');
                return;
            }

            // Prepare chromosome interval information
            const chromosomeSizes: { [k: string]: number } = CHROMOSOME_SIZE_HG38;
            const chromosomeCumPositions: { id: number; chr: string; pos: number }[] = [];
            const chromosomePositions: { [k: string]: { id: number; chr: string; pos: number } } = {};
            let prevEndPosition = 0;

            Object.keys(CHROMOSOME_SIZE_HG38).forEach((chrStr, i) => {
                const positionInfo = {
                    id: i,
                    chr: chrStr,
                    pos: prevEndPosition
                };

                chromosomeCumPositions.push(positionInfo);
                chromosomePositions[chrStr] = positionInfo;

                prevEndPosition += CHROMOSOME_SIZE_HG38[chrStr];
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
                this.dataPromise = this.fetchCSV();
            }
        }

        fetchCSV() {
            const {
                url,
                chromosomeField,
                genomicFields,
                quantitativeFields,
                headerNames,
                chromosomePrefix,
                longToWideId
            } = this.dataConfig;

            const separator = this.dataConfig.separator ?? ',';

            return fetch(url)
                .then(response => {
                    return response.ok ? response.text() : Promise.reject(response.status);
                })
                .then(text => {
                    const textWithHeader = headerNames ? `${headerNames.join(separator)}\n${text}` : text;
                    return d3.dsvFormat(separator).parse(textWithHeader, (row: any) => {
                        let successfullyGotChrInfo = true;

                        genomicFields.forEach((g: string) => {
                            if (!row[chromosomeField]) {
                                // TODO:
                                return;
                            }
                            try {
                                const chr = chromosomePrefix
                                    ? row[chromosomeField].replace(chromosomePrefix, 'chr')
                                    : row[chromosomeField].includes('chr')
                                    ? row[chromosomeField]
                                    : `chr${row[chromosomeField]}`;
                                row[g] = CHROMOSOME_INTERVAL_HG38[chr][0] + +row[g];
                            } catch (e) {
                                // genomic position did not parse properly
                                successfullyGotChrInfo = false;
                                // console.warn(
                                //     '[Gemini Data Fetcher] Genomic position cannot be parsed correctly.',
                                //     chromosomeField
                                // );
                            }
                        });

                        if (!successfullyGotChrInfo) {
                            // store row only when chromosome information is correctly parsed
                            return undefined;
                        }

                        quantitativeFields?.forEach((q: string) => {
                            row[q] = +row[q];
                        });
                        return row;
                    });
                })
                .then(json => {
                    if (longToWideId && json[0]?.[longToWideId]) {
                        // rows having identical IDs are juxtaposed horizontally
                        const keys = Object.keys(json[0]);
                        const newJson: { [k: string]: { [k: string]: string | number } } = {};
                        json.forEach(d => {
                            if (!newJson[d[longToWideId]]) {
                                newJson[d[longToWideId]] = JSON.parse(JSON.stringify(d));
                            } else {
                                keys.forEach(k => {
                                    newJson[d[longToWideId]][`${k}_2`] = d[k];
                                });
                            }
                        });
                        this.values = Object.keys(newJson).map(k => newJson[k]);
                    } else {
                        this.values = json;
                    }
                })
                .catch(error => {
                    console.error('[Gemini Data Fetcher] Error fetching data', error);
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
                    console.error('[Gemini Data Fetcher] Error parsing data:', err);
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
                    console.warn('[Gemini Data Fetcher] Invalid tile zoom or position:', z, x, y);
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

                // TODO;
                // let minY = tsInfo.min_pos[0] + x * tileWidth;
                // let maxY = tsInfo.min_pos[0] + (x + 1) * tileWidth;

                // filter the data so that visible data is sent to tracks
                const tabularData = this.values.filter((d: any) => {
                    return this.dataConfig.genomicFields.find((g: any) => minX < d[g] && d[g] <= maxX);
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

    return new CSVDataFetcherClass(args);
}

CSVDataFetcher.config = {
    type: 'csv'
};

export default CSVDataFetcher;
