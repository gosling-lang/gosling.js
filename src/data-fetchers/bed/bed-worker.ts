/*
 * This document is heavily based on the following repo by @alexander-veit:
 * https://github.com/dbmi-bgm/higlass-sv/blob/main/src/sv-fetcher-worker.js
 */

import { TabixIndexedFile } from '@gmod/tabix';
import { expose, Transfer } from 'threads/worker';
import { sampleSize } from 'lodash-es';
import type { TilesetInfo } from '@higlass/types';
import type { ChromSizes } from '@gosling.schema';
import { DataSource, RemoteFile } from '../utils';
import type { EmptyTile, BedTile } from './shared-types';
import BedParser from './parser';

export type BedFileOptions = {
    sampleLength: number;
    customFields?: string[];
};

/**
 * A class to represent a BED file. It takes care of setting up gmod/tabix.
 */
export class BedFile {
    #parseLine?: (line: string, chromStart: number) => BedTile;
    #customFields?: string[];
    #uid: string;

    constructor(public tbi: TabixIndexedFile, uid: string) {
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
        return new BedFile(tbi, uid);
    }
    set customFields(custom: string[]) {
        this.#customFields = custom;
    }
    /**
     * Creates a parser. Parser cannot be created in the constructor because it relies on chromosome information
     * which gets created by DataSource
     * @returns A function to parse lines of BED files
     */
    async getParser() {
        if (!this.#parseLine) {
            const n_columns = this.#customFields ? await this.#calcNColumns() : undefined;
            const parseLine = await new BedParser(this.#customFields, n_columns).getLineParser();
            this.#parseLine = parseLine;
        }
        return this.#parseLine;
    }
    /**
     * Function to calculate the number of columns in the BED file. Needed when custom column names are supplied
     * Relatively inefficient because the gmod/tabix API only has a way to retrieve lines based on genomic coordinates,
     * but I believe this is better than fetching the BED file itself because then it only has to be fetched and
     * unzipped once.
     * @param uid A string which is the UID associated worker. Used to retrieve the chromosome information
     * @returns
     */
    async #calcNColumns() {
        const source = dataSources.get(this.#uid)!;
        const { chromLengths, cumPositions } = source.chromInfo;
        let n_cols = 0;
        for (const cumPos of cumPositions) {
            const chromName = cumPos.chr;
            const chromStart = cumPos.pos;
            const chromEnd = cumPos.pos + chromLengths[chromName];
            n_cols = await new Promise(resolve => {
                source.file.tbi.getLines(chromName, chromStart, chromEnd, line => {
                    resolve(line.split('\t').length);
                });
            });
            if (n_cols > 0) break;
        }
        console.warn('columns', n_cols);
        return n_cols;
    }
    /**
     * Retrieves data within a certain coordinate range
     * @param minX A number which is the minimum X boundary of the tile
     * @param maxX A number which is the maximum X boundary of the tile
     * @param callback A callback function which takes in parsed BED file data record
     * @returns A promise of array of promises which resolve when the data has been successfully retrieved
     */
    async getTileData(minX: number, maxX: number, callback: (bedRecord: BedTile) => unknown) {
        const source = dataSources.get(this.#uid)!;
        const parseLine = await this.getParser();
        const recordPromises: Promise<void>[] = []; // These promises resolve when the data has been retrieved

        let curMinX = minX;

        const { chromLengths, cumPositions } = source.chromInfo;

        cumPositions.forEach(cumPos => {
            const chromName = cumPos.chr;
            const chromStart = cumPos.pos;
            const chromEnd = cumPos.pos + chromLengths[chromName];

            let startPos, endPos;
            if (chromStart <= curMinX && curMinX < chromEnd) {
                if (maxX > chromEnd) {
                    // the visible region extends beyond the end of this chromosome
                    // fetch from the start until the end of the chromosome

                    startPos = curMinX - chromStart;
                    endPos = chromEnd - chromStart;
                    recordPromises.push(
                        source.file.tbi
                            .getLines(chromName, startPos, endPos, line => {
                                const bedRecord = parseLine(line, chromStart);
                                callback(bedRecord);
                            })
                            .then(() => {})
                    );
                } else {
                    startPos = Math.floor(curMinX - chromStart);
                    endPos = Math.ceil(maxX - chromStart);
                    recordPromises.push(
                        source.file.tbi
                            .getLines(chromName, startPos, endPos, line => {
                                const bedRecord = parseLine(line, chromStart);
                                callback(bedRecord);
                            })
                            .then(() => {})
                    );
                    return;
                }

                curMinX = chromEnd;
            }
        });
        return recordPromises;
    }
}

// promises indexed by urls
const bedFiles: Map<string, BedFile> = new Map();

/**
 * Object to store tile data. Each key a string which contains the coordinates of the tile
 */
const tileValues: Record<string, BedTile[]> = {};
/**
 * Maps from UID to Bed File info
 */
const dataSources: Map<string, DataSource<BedFile, BedFileOptions>> = new Map();

function init(
    uid: string,
    bed: { url: string; indexUrl: string },
    chromSizes: ChromSizes,
    options: Partial<BedFileOptions> = {}
) {
    console.warn('bed init called');
    let bedFile = bedFiles.get(bed.url);
    if (!bedFile) {
        bedFile = BedFile.fromUrl(bed.url, bed.indexUrl, uid);
        if (options.customFields) bedFile.customFields = options.customFields;
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
    console.warn('bed tile called');
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

    const recordPromises = await source.file.getTileData(minX, maxX, (bedRecord: BedTile) => {
        tileValues[CACHE_KEY] = tileValues[CACHE_KEY].concat([bedRecord]);
    });

    return Promise.all(recordPromises);
};

const fetchTilesDebounced = async (uid: string, tileIds: string[]) => {
    console.warn('fetch tiles debounced called');
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
    const data: BedTile[][] = [];

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
