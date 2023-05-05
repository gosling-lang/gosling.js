/*
 * This document is heavily based on the following repo by @alexander-veit:
 * https://github.com/dbmi-bgm/higlass-sv/blob/main/src/sv-fetcher-worker.js
 */

import { TabixIndexedFile } from '@gmod/tabix';
import GFF from '@gmod/gff';
import { expose, Transfer } from 'threads/worker';
import { sampleSize } from 'lodash-es';
import type { TilesetInfo } from '@higlass/types';
import type { ChromSizes } from '@gosling.schema';
import { DataSource, RemoteFile } from '../utils';

export type GffFileOptions = {
    sampleLength: number;
};

export interface GffTile {
    chrom: string;
    chromStart: number;
    chromEnd: number;
}

export interface EmptyTile {
    tilePositionId: string;
}

/**
 * A class to represent a BED file. It takes care of setting up gmod/tabix.
 */
export class GffFile {
    #parser: (gff: string) => any[];
    #uid: string;

    constructor(public tbi: TabixIndexedFile, uid: string) {
        this.#uid = uid;
        this.#parser = (gff: string) =>
            GFF.parseStringSync(gff, {
                parseFeatures: true,
                parseComments: false,
                parseDirectives: false,
                parseSequences: false
            });
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
     * Retrieves data within a certain coordinate range
     * @param minX A number which is the minimum X boundary of the tile
     * @param maxX A number which is the maximum X boundary of the tile
     * @param callback A callback function which takes in parsed BED file data record
     * @returns A promise of array of promises which resolve when the data has been successfully retrieved
     */
    async getTileData(minX: number, maxX: number) {
        const source = dataSources.get(this.#uid)!;
        const linePromises: Promise<string[]>[] = []; // These promises resolve when the data has been retrieved

        let curMinX = minX;

        const { chromLengths, cumPositions } = source.chromInfo;

        for (const cumPos of cumPositions) {
            const chromName = cumPos.chr;
            const chromStart = cumPos.pos;
            const chromEnd = cumPos.pos + chromLengths[chromName];
            let startPos, endPos;

            if (chromStart > curMinX || curMinX >= chromEnd) {
                continue;
            }

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

                source.file.tbi.getLines(chromName, startPos, endPos, lineCallback).then(() => {
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
}

// promises indexed by urls
const gffFiles: Map<string, GffFile> = new Map();

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
    gff: { url: string; indexUrl: string },
    chromSizes: ChromSizes,
    options: Partial<GffFileOptions> = {}
) {
    let gffFile = gffFiles.get(gff.url);
    if (!gffFile) {
        gffFile = GffFile.fromUrl(gff.url, gff.indexUrl, uid);
    }
    const dataSource = new DataSource(gffFile, chromSizes, {
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
const tile = async (uid: string, z: number, x: number): Promise<string[]> => {
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

    const recordPromises = await source.file.getTileData(minX, maxX);

    return (await Promise.all(recordPromises)).flat();
};

const fetchTilesDebounced = async (uid: string, tileIds: string[]) => {
    const tiles: Record<string, EmptyTile> = {};
    const validTileIds: string[] = [];
    const tilePromises: Promise<string[]>[] = [];

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

    let output = Object.values(data).flat();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sampleLength = dataSources.get(uid)!.options.sampleLength;
    if (output.length >= sampleLength) {
        // TODO: we can make this more generic
        // priotize that mutations with closer each other are selected when sampling.
        output = sampleSize(output, sampleLength / 2.0);
    }

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
