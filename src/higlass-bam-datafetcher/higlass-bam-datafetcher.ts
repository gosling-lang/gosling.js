/*
 * This code is based on the following repo:
 * https://github.com/higlass/higlass-pileup
 */
import { Assembly } from '../core/gosling.schema';

function BAMDataFetcher(HGC: any, ...args: any): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    class BAMDataFetcherClass {
        // @ts-ignore
        private dataConfig: GeminiDataConfig;
        // @ts-ignore
        private tilesetInfoLoading: boolean;
        private dataPromise: Promise<any> | undefined;
        private chromSizes: any;
        private values: any;
        private assembly: Assembly;

        constructor(params: any[]) {
            this.assembly = 'hg38';
            console.warn(params);
            // console.log('HRE BAM ARE');
        }

        generateTilesetInfo(callback?: any) {
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

            // console.log('HRE BAM ARE, generateTilesetInfo');
            if (callback) {
                callback(retVal);
            }

            return retVal;
        }

        tilesetInfo(callback?: any) {
            // console.log('HRE BAM ARE, tilesetInfo');
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
            // console.log('HRE BAM ARE, fetchTilesDebounced');
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
            // console.log('HRE BAM ARE, tile');
            return this.tilesetInfo()?.then((tsInfo: any) => {
                const tileWidth = +tsInfo.max_width / 2 ** +z;

                // get the bounds of the tile
                const minX = tsInfo.min_pos[0] + x * tileWidth;
                const maxX = tsInfo.min_pos[0] + (x + 1) * tileWidth;

                // filter the data so that visible data is sent to tracks
                const tabularData = this.values.filter((d: any) => {
                    if (this.dataConfig.genomicFields) {
                        return this.dataConfig.genomicFields.find((g: any) => minX < d[g] && d[g] <= maxX);
                    } else {
                        const allGenomicFields: string[] = [];
                        this.dataConfig.genomicFieldsToConvert.forEach((d: any) =>
                            allGenomicFields.push(...d.genomicFields)
                        );
                        return allGenomicFields.find((g: any) => minX < d[g] && d[g] <= maxX);
                    }
                });

                // filter data based on the `DataTransform` spec
                // this.filter?.forEach(f => {
                //     tabularData = filterData(f, tabularData);
                // });

                // const sizeLimit = this.dataConfig.sampleLength ?? 1000;
                return {
                    // sample the data to make it managable for visualization components
                    tabularData: tabularData, //[], //tabularData.length > sizeLimit ? sampleSize(tabularData, sizeLimit) : tabularData,
                    server: null,
                    tilePos: [x],
                    zoomLevel: z
                };
            });
        }
    }

    return new BAMDataFetcherClass(args);
}

BAMDataFetcher.config = {
    type: 'bam'
};

export default BAMDataFetcher;
