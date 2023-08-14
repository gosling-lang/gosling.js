/*
 * This code is based on the following repo:
 * https://github.com/higlass/higlass-bigwig-datafetcher/blob/main/src/BigwigDataFetcher.js
 */
import { BigWig } from '@gmod/bbi';
import type { Assembly, BigWigData } from '@gosling-lang/gosling-schema';
import { computeChromSizes } from '../../core/utils/assembly';
import { type CommonDataConfig, RemoteFile } from '../utils';

import type { Feature } from '@gmod/bbi';
import type { ChromInfo, TilesetInfo } from '@higlass/types';

type BigWigDataConfig = BigWigData & CommonDataConfig;

type Tile = {
    tilePos: [number];
    tileId: string;
    zoomLevel: number;
    min_value: number;
    max_value: number;
    dense: (number | null)[];
    denseDataExtrema: InstanceType<import('@higlass/types').HGC['utils']['DenseDataExtrema1D']>;
    minNonZero: number;
    maxNonZero: number;
};

type BigWigHeader = {
    zoomLevels: { reductionLevel: number }[];
};

type ExtendedFeature = Feature & { startAbs: number; endAbs: number };

function BigWigDataFetcher(HGC: import('@higlass/types').HGC, dataConfig: BigWigDataConfig) {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    const cls = class BigWigDataFetcherClass {
        dataConfig: typeof dataConfig;
        bwFileHeader: BigWigHeader | null;
        bwFile: BigWig | null;
        TILE_SIZE: number;
        errorTxt: string;
        dataPromises: Promise<unknown>[];
        chromSizes: ChromInfo<string> & { chrToAbs: (name: string, pos: number) => number };
        assembly?: Assembly;
        tilesetInfoLoading?: boolean;

        constructor() {
            this.dataConfig = dataConfig;
            this.assembly = this.dataConfig.assembly;
            this.bwFileHeader = null;
            this.bwFile = null;
            this.TILE_SIZE = 1024;

            this.errorTxt = '';
            this.dataPromises = [];

            // Prepare chromosome interval information
            const chromosomeSizes = computeChromSizes(this.assembly).size;

            const chromosomeCumPositions: ChromInfo['cumPositions'] = [];
            const chromosomePositions: Record<string, ChromInfo['cumPositions'][number]> = {};
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
                chrToAbs: (chrom, chromPos) => this.chromSizes.chrPositions[chrom].pos + chromPos,
                cumPositions: chromosomeCumPositions,
                chrPositions: chromosomePositions,
                totalLength: prevEndPosition,
                chromLengths: chromosomeSizes
            };

            this.dataPromises.push(this.loadBBI(dataConfig));
        }

        async loadBBI(dataConfig: { url: string }) {
            if (dataConfig.url) {
                this.bwFile = new BigWig({
                    filehandle: new RemoteFile(dataConfig.url)
                });
                return this.bwFile.getHeader().then((h: BigWigHeader) => {
                    this.bwFileHeader = h;
                });
            } else {
                console.error('Please enter a "url" field to the data config');
                return null;
            }
        }

        tilesetInfo(callback?: (info: TilesetInfo | { error: string }) => void) {
            this.tilesetInfoLoading = true;

            return Promise.all(this.dataPromises)
                .then(() => {
                    this.tilesetInfoLoading = false;

                    const totalLength = this.chromSizes.totalLength;

                    const retVal = {
                        tile_size: this.TILE_SIZE,
                        max_zoom: Math.ceil(Math.log(totalLength / this.TILE_SIZE) / Math.log(2)),
                        max_width: 2 ** Math.ceil(Math.log(totalLength) / Math.log(2)),
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
                            error: `Error parsing bigwig: ${err}`
                        });
                    }
                    return null;
                });
        }

        fetchTilesDebounced(receivedTiles: (tiles: Record<string, Tile>) => void, tileIds: string[]) {
            const tiles: Record<string, Tile & { tilePositionId?: string }> = {};
            const validTileIds: string[] = [];
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
                for (let i = 0; i < values.length; i++) {
                    const validTileId = validTileIds[i];
                    tiles[validTileId] = values[i];
                    tiles[validTileId].tilePositionId = validTileId;
                }

                receivedTiles(tiles);
            });
            // tiles = tileResponseToData(tiles, null, tileIds);
            return tiles;
        }

        async tile(z: number, x: number) {
            const tsInfo = (await this.tilesetInfo())!;
            const tileWidth = +tsInfo.max_width / 2 ** +z;

            const recordPromises: Promise<ExtendedFeature[]>[] = [];

            const tile: Partial<Tile> = {
                tilePos: [x],
                tileId: `bigwig.${z}.${x}`,
                zoomLevel: z
            };

            // get the bounds of the tile
            const minXOriginal = tsInfo.min_pos[0] + x * tileWidth;
            let minX = minXOriginal;
            const maxX = tsInfo.min_pos[0] + (x + 1) * tileWidth;

            const basesPerPixel = this.determineScale(minX, maxX);
            const basesPerBin = (maxX - minX) / this.TILE_SIZE;

            const binStarts: number[] = [];
            for (let i = 0; i < this.TILE_SIZE; i++) {
                binStarts.push(minX + i * basesPerBin);
            }

            const { chromLengths, cumPositions } = this.chromSizes;

            cumPositions.forEach(cumPos => {
                const chromName = cumPos.chr;
                const chromStart = cumPos.pos;
                const chromEnd = cumPos.pos + chromLengths[chromName];

                let startPos, endPos;

                if (chromStart <= minX && minX < chromEnd) {
                    // start of the visible region is within this chromosome

                    if (maxX > chromEnd) {
                        // the visible region extends beyond the end of this chromosome
                        // fetch from the start until the end of the chromosome
                        startPos = minX - chromStart;
                        endPos = chromEnd - chromStart;
                        recordPromises.push(
                            this.bwFile!.getFeatures(chromName, startPos, endPos, {
                                scale: 1 / basesPerPixel
                            }).then(values => {
                                values.forEach((v: Feature & { startAbs?: number; endAbs?: number }) => {
                                    v['startAbs'] = HGC.utils.chrToAbs(chromName, v.start, this.chromSizes);
                                    v['endAbs'] = HGC.utils.chrToAbs(chromName, v.end, this.chromSizes);
                                });
                                return values as (Feature & { startAbs: number; endAbs: number })[];
                            })
                        );

                        minX = chromEnd;
                    } else {
                        startPos = Math.floor(minX - chromStart);
                        endPos = Math.ceil(maxX - chromStart);
                        if (!this.bwFile) return;
                        recordPromises.push(
                            this.bwFile
                                .getFeatures(chromName, startPos, endPos, {
                                    scale: 1 / basesPerPixel
                                })
                                .then(values => {
                                    values.forEach((v: Feature & { startAbs?: number; endAbs?: number }) => {
                                        v['startAbs'] = HGC.utils.chrToAbs(chromName, v.start, this.chromSizes);
                                        v['endAbs'] = HGC.utils.chrToAbs(chromName, v.end, this.chromSizes);
                                    });
                                    return values as (Feature & { startAbs: number; endAbs: number })[];
                                })
                        );
                        return;
                    }
                }
            });

            return Promise.all(recordPromises).then(v => {
                const values = v.flat();

                const dense: (number | null)[] = [];
                for (let i = 0; i < this.TILE_SIZE; i++) {
                    dense.push(null);
                }

                // Currently we use the same binning strategy in all cases (basesPerBin =>< basesPerBinInFile)
                binStarts.forEach((curStart, index) => {
                    if (curStart < minXOriginal || curStart > maxX) {
                        return;
                    }
                    const filtered = values
                        .filter(v => {
                            return curStart >= v.startAbs && curStart < v.endAbs;
                        })
                        .map(v => v.score);
                    dense[index] = filtered.length > 0 ? filtered[0] : null;
                });

                const dde = new HGC.utils.DenseDataExtrema1D(dense);
                // @ts-expect-error Math.min() allows `null` but results in min
                tile.min_value = Math.min(...dense);
                // @ts-expect-error Math.max() allows `null` but results in min
                tile.max_value = Math.max(...dense);
                tile.dense = dense;
                tile.denseDataExtrema = dde;
                tile.minNonZero = dde.minNonZeroInTile;
                tile.maxNonZero = dde.maxNonZeroInTile;
                return tile as Tile;
            });
        }

        // We never want to request more than 1024 * 20 elements from the file.
        determineScale(minX: number, maxX: number) {
            const reductionLevels = [1];
            const numRequestedElements = maxX - minX;

            if (!this.bwFileHeader) {
                throw Error('no bigwig header');
            }

            this.bwFileHeader.zoomLevels.forEach(z => {
                reductionLevels.push(z.reductionLevel);
            });

            let level: number | undefined;
            reductionLevels.forEach(rl => {
                if (level) return; // we found one

                const numElementsFromFile = numRequestedElements / rl;
                if (numElementsFromFile <= this.TILE_SIZE * 20) {
                    level = rl;
                }
            });

            // return the highest reductionLevel, if we could not find anything better
            return level || reductionLevels.slice(-1)[0];
        }
    };

    return new cls();
}

BigWigDataFetcher.config = {
    type: 'bigwig'
};

export default BigWigDataFetcher;
