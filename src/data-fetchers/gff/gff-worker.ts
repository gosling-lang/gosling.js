import { TabixIndexedFile } from '@gmod/tabix';
import GFF from '@gmod/gff';
import type { GFF3FeatureLine } from '@gmod/gff';
import { expose, Transfer } from 'threads/worker';
import { sampleSize } from 'lodash-es';
import type { TilesetInfo } from '@higlass/types';
import type { ChromSizes } from '@gosling.schema';
import { DataSource, RemoteFile } from '../utils';
import { parsedDataToTiles } from './utils';

export type GffFileOptions = {
    sampleLength: number;
};

export type GffTile = GFF3FeatureLine;

export interface EmptyTile {
    tilePositionId: string;
}

/**
 * A class to represent a GFF file. It takes care of setting up gmod/tabix.
 */
export class GffFile {
    #uid: string;
    tbi: TabixIndexedFile;

    constructor(tbi: TabixIndexedFile, uid: string) {
        this.tbi = tbi;
        this.#uid = uid;
    }
    /**
     * Function to create an instance of BedFile
     * @param url A string which is the URL of the bed file
     * @param indexUrl A string which is the URL of the bed  index file
     * @param uid A unique identifier for the worker
     * @returns an instance of BedFile
     */
    static fromUrl(url: string, indexUrl: string, uid: string) {
        const tbi = new TabixIndexedFile({
            filehandle: new RemoteFile(url),
            tbiFilehandle: new RemoteFile(indexUrl)
        });
        return new GffFile(tbi, uid);
    }
    /**
     * Retrieves the lines between a range of absolute genomic coordinates
     * @param minX the minimum absolute coordinate
     * @param maxX the maximum absolute coordinate
     * @returns A promise to an array of strings, where each string is a line from the GFF
     */
    #getLinePromises(minX: number, maxX: number) {
        const source = dataSources.get(this.#uid)!;
        let curMinX = minX;
        const { chromLengths, cumPositions } = source.chromInfo;
        const linePromises: Promise<string[]>[] = [];
        for (const cumPos of cumPositions) {
            const chromName = cumPos.chr;
            const chromStart = cumPos.pos;
            const chromEnd = cumPos.pos + chromLengths[chromName];
            let startPos, endPos;

            // Early break, rather than creating an nested if
            if (chromStart > curMinX || curMinX >= chromEnd) {
                continue;
            }

            // start of the visible region is within this chromosome
            const linePromise = new Promise<string[]>(resolve => {
                const lines: string[] = [];
                const lineCallback = (line: string) => {
                    lines.push(line);
                };

                if (maxX > chromEnd) {
                    startPos = curMinX - chromStart;
                    endPos = chromEnd - chromStart;
                } else {
                    startPos = Math.floor(curMinX - chromStart);
                    endPos = Math.ceil(maxX - chromStart);
                }

                this.tbi.getLines(chromName.substring(3), startPos, endPos, lineCallback).then(() => {
                    resolve(lines);
                });
            });

            linePromises.push(linePromise);

            if (maxX <= chromEnd) {
                continue;
            }

            curMinX = chromEnd;
        }
        return linePromises;
    }
    /**
     * Makes tiles for a given range of genomic positions
     * @param minX the minimum absolute coordinate
     * @param maxX the maximum absolute coordinate
     * @returns A promise to an array of GffTiles
     */
    async getTileData(minX: number, maxX: number): Promise<GffTile[]> {
        console.warn('getTileData called');
        const source = dataSources.get(this.#uid)!;
        // maximum number of features that can be shown
        const sampleLength = source.options.sampleLength;

        /**
         * Filters out chromosome features and child features if there are too many features
         * @param lines an array of strings, where each string is a line from the GFF
         * @returns an array of strings, where each string is a line from the GFF
         */
        function filterLines(lines: string[]): string[] {
            if (lines.length >= sampleLength) {
                console.warn('Downsampling');
                // Keep only the non child lines
                const nonChildLines = lines.filter(line => {
                    const lineColumns = line.split('\t');
                    const attributes = lineColumns[8];
                    const lineType = lineColumns[2]; // use this to remove the chromosome features
                    return !attributes.includes('Parent=') && !(lineType == 'chromosome');
                });
                return sampleSize(nonChildLines, sampleLength);
            } else {
                // we want to remove the chromosome lines
                return lines.filter(line => {
                    const lineColumns = line.split('\t');
                    const lineType = lineColumns[2];
                    return !(lineType == 'chromosome');
                });
            }
        }

        const linePromises = this.#getLinePromises(minX, maxX);
        const allLines = (await Promise.all(linePromises)).flat();
        console.warn(allLines);
        const filteredLines = filterLines(allLines);

        const parseOptions = {
            disableDerivesFromReferences: true,
            parseFeatures: true,
            parseComments: false,
            parseDirectives: false,
            parseSequences: false
        };
        // parseStringSync creates a new Parser object internally when it gets called so we can reduce that overhead if
        // we parse all of the lines together
        console.warn('started parse');
        const parsedLines = GFF.parseStringSync(filteredLines.join('\n'), parseOptions);
        console.warn('parsed', parsedDataToTiles(parsedLines));
        return parsedDataToTiles(parsedLines);
    }
}

// promises indexed by urls
const bedFiles: Map<string, GffFile> = new Map();

/**
 * Object to store tile data. Each key a string which contains the coordinates of the tile
 */
const tileValues: Record<string, GffTile[]> = {};
/**
 * Maps from UID to Bed File info
 */
const dataSources: Map<string, DataSource<GffFile, GffFileOptions>> = new Map();

function init(
    uid: string,
    bed: { url: string; indexUrl: string },
    chromSizes: ChromSizes,
    options: Partial<GffFileOptions> = {}
) {
    let bedFile = bedFiles.get(bed.url);
    if (!bedFile) {
        bedFile = GffFile.fromUrl(bed.url, bed.indexUrl, uid);
    }
    const dataSource = new DataSource(bedFile, chromSizes, {
        sampleLength: 1000,
        ...options
    });
    dataSources.set(uid, dataSource);
}

const tilesetInfo = (uid: string) => {
    return dataSources.get(uid)!.tilesetInfo;
};

/**
 * Updates `tileValues` with the data for a specific tile.
 * @param uid A string which is the unique identifier of the worker
 * @param z A number which is the z coordinate of the tile
 * @param x A number which is the x coordinate of the tile
 */
const tile = async (uid: string, z: number, x: number): Promise<void[]> => {
    const source = dataSources.get(uid)!;
    // const parseLine = await source.file.getParser();

    const CACHE_KEY = `${uid}.${z}.${x}`;

    // TODO: Caching is needed
    // if (!tileValues[CACHE_KEY]) {
    tileValues[CACHE_KEY] = [];
    // }

    const tileWidth = +source.tilesetInfo.max_width / 2 ** +z;

    // get bounds of this tile
    const minX = source.tilesetInfo.min_pos[0] + x * tileWidth;
    const maxX = source.tilesetInfo.min_pos[0] + (x + 1) * tileWidth;

    tileValues[CACHE_KEY] = await source.file.getTileData(minX, maxX);
    return [];
};

const fetchTilesDebounced = async (uid: string, tileIds: string[]) => {
    const tiles: Record<string, EmptyTile> = {};
    const validTileIds: string[] = [];
    const tilePromises: Promise<void[]>[] = [];

    for (const tileId of tileIds) {
        const parts = tileId.split('.');
        const z = parseInt(parts[0], 10);
        const x = parseInt(parts[1], 10);

        if (Number.isNaN(x) || Number.isNaN(z)) {
            console.warn('Invalid tile zoom or position:', z, x);
            continue;
        }
        validTileIds.push(tileId);
        tilePromises.push(tile(uid, z, x));
    }
    return Promise.all(tilePromises).then(values => {
        for (let i = 0; i < values.length; i++) {
            const validTileId = validTileIds[i];
            tiles[validTileId] = { tilePositionId: validTileId };
        }
        return tiles;
    });
};

/**
 * Sends the data fetcher data from `tileValues`
 * @param uid A string which is the unique identifier of the worker
 * @param tileIds An array of strings where each string identifies a tile with a particular coordinate
 * @returns A transferable buffer
 */
const getTabularData = (uid: string, tileIds: string[]) => {
    const data: GffTile[][] = [];

    tileIds.forEach(tileId => {
        const parts = tileId.split('.');
        const z = parseInt(parts[0], 10);
        const x = parseInt(parts[1], 10);

        const tileValue = tileValues[`${uid}.${z}.${x}`];

        if (!tileValue) {
            console.warn(`No tile data constructed (${tileId})`);
        }

        data.push(tileValue);
    });
    const output = Object.values(data).flat();

    const buffer = new TextEncoder().encode(JSON.stringify(output)).buffer;
    return Transfer(buffer, [buffer]);
};

const tileFunctions = {
    init,
    tilesetInfo,
    fetchTilesDebounced,
    tile,
    getTabularData
};

export type WorkerApi = typeof tileFunctions;
export type { TilesetInfo };

expose(tileFunctions);
