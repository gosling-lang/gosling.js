import { GET_CHROM_SIZES } from '../../core/utils/assembly';
import { sampleSize } from 'lodash-es';

/**
 * HiGlass data fetcher specific for Gosling which ultimately will accept any types of data other than CSV files.
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
        private assembly: string;

        constructor(params: any[]) {
            const [dataConfig] = params;
            this.dataConfig = dataConfig;
            this.tilesetInfoLoading = false;
            this.assembly = this.dataConfig.assembly;

            if (!dataConfig.values) {
                console.error('Please provide `values` of the raw data');
                return;
            }

            // Prepare chromosome interval information
            const chromosomeSizes: { [k: string]: number } = GET_CHROM_SIZES(this.assembly).size;
            const chromosomeCumPositions: { id: number; chr: string; pos: number }[] = [];
            const chromosomePositions: { [k: string]: { id: number; chr: string; pos: number } } = {};
            let prevEndPosition = 0;

            Object.keys(GET_CHROM_SIZES(this.assembly).size).forEach((chrStr, i) => {
                const positionInfo = {
                    id: i,
                    chr: chrStr,
                    pos: prevEndPosition
                };

                chromosomeCumPositions.push(positionInfo);
                chromosomePositions[chrStr] = positionInfo;

                prevEndPosition += GET_CHROM_SIZES(this.assembly).size[chrStr];
            });
            this.chromSizes = {
                chrToAbs: (chrom: string, chromPos: number) => this.chromSizes.chrPositions[chrom].pos + chromPos,
                cumPositions: chromosomeCumPositions,
                chrPositions: chromosomePositions,
                totalLength: prevEndPosition,
                chromLengths: chromosomeSizes
            };

            this.values = dataConfig.values.map((row: any) => {
                let successfullyGotChrInfo = true;

                this.dataConfig.genomicFields.forEach((g: any) => {
                    if (!row[this.dataConfig.chromosomeField]) {
                        // TODO:
                        return;
                    }
                    try {
                        const chr = row[this.dataConfig.chromosomeField].includes('chr')
                            ? row[this.dataConfig.chromosomeField]
                            : `chr${row[this.dataConfig.chromosomeField]}`;
                        row[g] = GET_CHROM_SIZES(this.assembly).interval[chr][0] + +row[g];
                    } catch (e) {
                        // genomic position did not parse properly
                        successfullyGotChrInfo = false;
                        // console.warn(
                        //     '[Gosling Data Fetcher] Genomic position cannot be parsed correctly.',
                        //     this.dataConfig.chromosomeField
                        // );
                    }
                });

                if (!successfullyGotChrInfo) {
                    // store row only when chromosome information is correctly parsed
                    return undefined;
                }

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
                    console.warn('[Gosling Data Fetcher] Invalid tile zoom or position:', z, x);
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
            let tabularData = this.values;

            const sizeLimit = this.dataConfig.sampleLength ?? 1000;

            if (sizeLimit < tabularData.length) {
                tabularData = tabularData.filter((d: any) => {
                    return this.dataConfig.genomicFields.find((g: any) => minX < d[g] && d[g] <= maxX);
                });
            }

            // sample the data to make it managable for visualization components
            if (sizeLimit < tabularData.length) {
                tabularData = sampleSize(tabularData, sizeLimit);
            }

            return {
                tabularData,
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
