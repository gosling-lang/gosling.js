import { CHROMOSOME_INTERVAL_HG38, CHROMOSOME_SIZE_HG38 } from '../core/utils/chrom-size';
import { sampleSize } from 'lodash';

/**
 * HiGlass data fetcher specific for Gemini which ultimately will accept any types of data other than CSV files.
 */
function RawDataFetcher(HGC: any, ...args: any): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    class RawDataFetcherClass {
        // @ts-ignore
        private dataConfig: GeminiDataConfig;
        // @ts-ignore
        private tilesetInfoLoading: boolean;
        private chromSizes: any;
        private values: any;

        constructor(params: any[]) {
            const [dataConfig] = params;
            this.dataConfig = dataConfig;
            this.tilesetInfoLoading = false;

            if (!dataConfig.values) {
                console.error('Please provide `values` of the raw data');
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

            this.values = dataConfig.values.map((row: any) => {
                this.dataConfig.genomicFields.forEach((g: any) => {
                    if (!row[this.dataConfig.chromosomeField]) {
                        // TODO:
                        return;
                    }
                    try {
                        const chr = row[this.dataConfig.chromosomeField].includes('chr')
                            ? row[this.dataConfig.chromosomeField]
                            : `chr${row[this.dataConfig.chromosomeField]}`;
                        row[g] = CHROMOSOME_INTERVAL_HG38[chr][0] + +row[g];
                    } catch (e) {
                        console.warn(
                            '[Gemini Data Fetcher] Genomic position cannot be parsed correctly.',
                            this.dataConfig.chromosomeField
                        );
                    }
                });
                this.dataConfig.quantitativeFields?.forEach((q: string) => {
                    row[q] = +row[q];
                });
                return row;
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
                min_pos: [0],
                max_pos: [totalLength]
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
            const tsInfo = this.tilesetInfo();
            const tileWidth = +tsInfo.max_width / 2 ** +z;

            // get the bounds of the tile
            const minX = tsInfo.min_pos[0] + x * tileWidth;
            const maxX = tsInfo.min_pos[0] + (x + 1) * tileWidth;

            // filter the data so that visible data is sent to tracks
            const tabularData = this.values.filter((d: any) => {
                let inRange = false;
                this.dataConfig.genomicFields.forEach((g: any) => {
                    if (d[g] > minX && d[g] < maxX) {
                        inRange = true;
                    }
                });
                return inRange;
            });

            const sizeLimit = this.dataConfig.sampleLength ?? 1000;
            return {
                // sample the data to make it managable for visualization components
                tabularData: tabularData.length > sizeLimit ? sampleSize(tabularData, sizeLimit) : tabularData,
                server: null,
                tilePos: [x],
                zoomLevel: z
            };
        }
    }

    return new RawDataFetcherClass(args);
}

RawDataFetcher.config = {
    type: 'json'
};

export default RawDataFetcher;
