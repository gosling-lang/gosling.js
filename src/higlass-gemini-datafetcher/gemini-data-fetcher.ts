import * as d3 from 'd3-dsv';
import { CHROMOSOME_INTERVAL_HG19, CHROMOSOME_SIZE_HG19 } from '../core/utils/chrom-size';

// TODO: Accept multiple data infos as array, instead of having `Alt` variables.
/**
 * HiGlass data fetcher specific for Gemini which ultimately will accept any types of data other than CSV files.
 */
function GeminiDataFetcher(HGC: any, ...args: any): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    const { slugid } = HGC.libraries;

    class CSVDataFetcherClass {
        // @ts-ignore
        private dataConfig: GeminiDataConfig;
        // @ts-ignore
        private tilesetInfoLoading: boolean;
        // @ts-ignore
        private trackUid: string;
        private dataPromise: Promise<any> | undefined;
        private dataPromiseAlt: Promise<any> | undefined; // being used for semantic zooming
        private chromSizes: any;
        private data: any;
        private dataAlt: any;

        constructor(params: any[]) {
            const [dataConfig] = params;
            this.dataConfig = dataConfig;
            this.trackUid = slugid.nice();
            this.tilesetInfoLoading = false;

            if (!dataConfig.url) {
                console.error('Please provide the `url` of the data');
                return;
            }

            // Prepare chromosome interval information
            const chromosomeSizes: { [k: string]: number } = CHROMOSOME_SIZE_HG19;
            const chromosomeCumPositions: { id: number; chr: string; pos: number }[] = [];
            const chromosomePositions: { [k: string]: { id: number; chr: string; pos: number } } = {};
            let prevEndPosition = 0;

            Object.keys(CHROMOSOME_SIZE_HG19).forEach((chrStr, i) => {
                const positionInfo = {
                    id: i,
                    chr: chrStr,
                    pos: prevEndPosition
                };

                chromosomeCumPositions.push(positionInfo);
                chromosomePositions[chrStr] = positionInfo;

                prevEndPosition += CHROMOSOME_SIZE_HG19[chrStr];
            });
            this.chromSizes = {
                chrToAbs: (chrom: string, chromPos: number) => this.chromSizes.chrPositions[chrom].pos + chromPos,
                cumPositions: chromosomeCumPositions,
                chrPositions: chromosomePositions,
                totalLength: prevEndPosition,
                chromLengths: chromosomeSizes
            };

            if (dataConfig.data && dataConfig.data.length !== 0) {
                // we have raw data that we can use right away
                this.data = dataConfig.data;
            } else {
                this.dataPromise = this.fetchCSV(
                    this.dataConfig.url,
                    this.dataConfig.chromosomeField,
                    this.dataConfig.genomicFields,
                    this.dataConfig.quantitativeFields
                );
                if (this.dataConfig.urlAlt) {
                    this.dataPromiseAlt = this.fetchCSV(
                        this.dataConfig.urlAlt,
                        this.dataConfig.chromosomeField,
                        this.dataConfig.genomicFields,
                        this.dataConfig.quantitativeFieldsAlt
                    );
                }
            }
        }

        fetchCSV(url: string, chromosomeField: string, genomicFields: string[], quantitativeFields?: string[]) {
            return fetch(url)
                .then(response => {
                    return response.ok ? response.text() : Promise.reject(response.status);
                })
                .then(text => {
                    return d3.csvParse(text, (row: any) => {
                        genomicFields.forEach(g => {
                            try {
                                row[g] = CHROMOSOME_INTERVAL_HG19[`chr${row[chromosomeField]}`][0] + +row[g];
                            } catch (e) {
                                console.warn('[Gemini Data Fetcher] Genomic position cannot be parsed correctly.');
                            }
                        });
                        quantitativeFields?.forEach(q => {
                            row[q] = +row[q];
                        });
                        return row;
                    });
                })
                .then(json => {
                    if (url === this.dataConfig.url) this.data = json;
                    else this.dataAlt = json;
                })
                .catch(error => {
                    console.error('[Gemini Data Fetcher] Error fetching data', error);
                });
        }

        tilesetInfo(callback?: any) {
            if (!this.dataPromise || (this.dataConfig.urlAlt && !this.dataPromiseAlt)) {
                // data promise is not prepared yet
                return;
            }

            this.tilesetInfoLoading = true;

            return this.dataPromise
                .then(() => {
                    this.tilesetInfoLoading = false;

                    const TILE_SIZE = 1024;
                    const totalLength = this.chromSizes.totalLength;
                    let retVal = {};

                    retVal = {
                        tile_size: TILE_SIZE,
                        max_zoom: Math.ceil(Math.log(totalLength / TILE_SIZE) / Math.log(2)),
                        max_width: totalLength,
                        min_pos: [0],
                        max_pos: [totalLength]
                    };

                    if (callback) {
                        callback(retVal);
                    }

                    return retVal;
                })
                .catch(err => {
                    this.tilesetInfoLoading = false;

                    console.error(err);

                    if (callback) {
                        callback({
                            error: `[Gemini Data Fetcher] Error parsing gff: ${err}`
                        });
                    }
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

                if (Number.isNaN(x) || Number.isNaN(z)) {
                    console.warn('[Gemini Data Fetcher] Invalid tile zoom or position:', z, x);
                    continue;
                }

                validTileIds.push(tileId);
                tilePromises.push(this.tile(z, x));
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

        tile(z: any, x: any) {
            return this.tilesetInfo()?.then((/*tsInfo: any*/) => {
                // const tileWidth = +tsInfo.max_width / 2 ** +z;

                // get the bounds of the tile
                // const minX = tsInfo.min_pos[0] + x * tileWidth;
                // const maxX = tsInfo.min_pos[0] + (x + 1) * tileWidth;

                const tabularData = this.data;
                // .filter(
                //     (d: any) => d['Basepair_stop'] > minX && d['Basepair_start'] < maxX
                // );

                const tabularDataAlt = this.dataAlt;
                // ?.filter(
                //     (d: any) => d['end'] > minX && d['start'] < maxX
                // );

                return {
                    tabularData,
                    tabularDataAlt,
                    server: null,
                    tilePos: [x],
                    zoomLevel: z
                };
            });
        }
    }

    return new CSVDataFetcherClass(args);
}

GeminiDataFetcher.config = {
    type: 'csv'
};

export default GeminiDataFetcher;
