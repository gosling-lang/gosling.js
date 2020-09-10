import * as d3 from 'd3-dsv';
import { Datum } from '../core/gemini.schema';

// TODO: include to the dataConfig
const EXAMPLE_CHR_SIZES: any = {
    chr1: 249250621,
    chr2: 243199373,
    chr3: 198022430,
    chr4: 191154276,
    chr5: 180915260,
    chr6: 171115067,
    chr7: 159138663,
    chr8: 146364022,
    chr9: 141213431,
    chr10: 135534747,
    chr11: 135006516,
    chr12: 133851895,
    chr13: 115169878,
    chr14: 107349540,
    chr15: 102531392,
    chr16: 90354753,
    chr17: 81195210,
    chr18: 78077248,
    chr19: 59128983,
    chr20: 63025520,
    chr21: 48129895,
    chr22: 51304566,
    chrX: 155270560,
    chrY: 59373566,
    chrM: 16571
};

function GeminiDataFetcher(HGC: any, ...args: any): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    const { slugid } = HGC.libraries;

    class CSVDataFetcherClass {
        // @ts-ignore
        private dataConfig: { url: string; type: 'csv'; data: Datum[] };
        // @ts-ignore
        private tilesetInfoLoading: boolean;
        // @ts-ignore
        private trackUid: string;
        private dataPromise: Promise<any> | undefined;
        private chromSizes: any;
        private data: any;

        constructor(params: any[]) {
            const [dataConfig] = params;
            this.dataConfig = dataConfig;
            this.trackUid = slugid.nice();
            this.tilesetInfoLoading = false;

            if (!dataConfig.url) {
                console.error('Please provide the `url` of the data');
                return;
            }

            if (dataConfig.data && dataConfig.data.length !== 0) {
                // we have raw data that we can use right away
                this.data = dataConfig.data;
            } else {
                this.dataPromise = fetch(dataConfig.url)
                    .then(response => {
                        return response.ok ? response.text() : Promise.reject(response.status);
                    })
                    .then(text => {
                        return d3.csvParse(text, (row: any) => {
                            if (!dataConfig.quantitativeFields && !dataConfig.nominalFields) {
                                return row;
                            }
                            dataConfig.quantitativeFields.forEach((q: string) => {
                                row[q] = +row[q];
                            });
                            return row;
                        });
                    })
                    .then(json => {
                        // chrom sizes
                        const cumPositions: { id: number; chr: string; pos: number }[] = [];
                        const chromLengths: { [k: string]: number } = EXAMPLE_CHR_SIZES;
                        const chrPositions: { [k: string]: { id: number; chr: string; pos: number } } = {};
                        let prevEndPosition = 0;

                        Object.keys(EXAMPLE_CHR_SIZES).forEach((chrStr, i) => {
                            const positionInfo = {
                                id: i,
                                chr: chrStr,
                                pos: prevEndPosition
                            };

                            cumPositions.push(positionInfo);
                            chrPositions[chrStr] = positionInfo;

                            prevEndPosition += EXAMPLE_CHR_SIZES[chrStr];
                        });
                        this.chromSizes = {
                            chrToAbs: (chrom: string, chromPos: number) =>
                                this.chromSizes.chrPositions[chrom].pos + chromPos,
                            cumPositions,
                            chrPositions,
                            totalLength: prevEndPosition,
                            chromLengths
                        };

                        this.data = json;
                    })
                    .catch(error => {
                        console.error('Error fetching data', error);
                    });
            }
        }

        tilesetInfo(callback?: any) {
            if (!this.dataPromise) return; // data promise is not prepared yet

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
                            error: `Error parsing gff: ${err}`
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
                    console.warn('Invalid tile zoom or position:', z, x);
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
            return this.tilesetInfo()?.then((tsInfo: any) => {
                const tileWidth = +tsInfo.max_width / 2 ** +z;

                // get the bounds of the tile
                const minX = tsInfo.min_pos[0] + x * tileWidth;
                const maxX = tsInfo.min_pos[0] + (x + 1) * tileWidth;

                const tabularData = this.data.filter(
                    (d: any) => d['Basepair_stop'] > minX && d['Basepair_start'] < maxX
                );

                return {
                    tabularData,
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
