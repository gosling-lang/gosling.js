/*
 * This document is heavily based on the following repo by @alexander-veit:
 * https://github.com/dbmi-bgm/higlass-sv/blob/main/src/sv-fetcher-worker.js
 */

import BED from '@gmod/bed';
import { TabixIndexedFile } from '@gmod/tabix';
import { expose, Transfer } from 'threads/worker';
import { sampleSize } from 'lodash-es';
import type { TilesetInfo } from '@higlass/types';
import type { ChromSizes } from '@gosling.schema';
import { DataSource, RemoteFile, EmptyTile } from '../utils';

/**
 * A class to represent a BED file. It takes care of setting up gmod/tabix.
 */
export class BedFile {
    #parseLine?: (line: string, chromStart: number) => BedRecord;
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
    async getTileData(minX: number, maxX: number, callback: (bedRecord: BedRecord) => unknown) {
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
/**
 * A class to create a BED file parser
 */
class BedParser {
    #customFields?: string[];
    #n_columns?: number;

    /**
     * Constructor for BedParser
     * @param customFields An array of strings, where each string is the name of a custom column
     * @param n_columns A number which is the number of columns in the Bed File
     */
    constructor(customFields?: string[], n_columns?: number) {
        this.#customFields = customFields;
        this.#n_columns = n_columns;
    }
    /**
     * Creates an instance of gmod/BED and returns a function which can parse a single BED file line
     * @returns A function to parse a single line of the BED file
     */
    async getLineParser() {
        /** Helper function to calculate cumulative chromosome positions */
        function relativeToCumulative(pos: number, chromStart: number) {
            return chromStart + pos + 1;
        }
        let parser: BED;
        if (this.#customFields) {
            const customAutoSqlSchema = this.constructBedAutoSql();
            parser = new BED({ autoSql: customAutoSqlSchema });
        } else {
            parser = new BED();
        }
        const lineParser = (line: string, chromStart: number) => {
            const bedRecord: BedRecord = parser.parseLine(line) as BedRecord;
            const fieldsToConvert = ['chromStart', 'chromEnd', 'thickEnd', 'thickStart'];
            fieldsToConvert.forEach(field => {
                if (bedRecord[field]) bedRecord[field] = relativeToCumulative(bedRecord[field] as number, chromStart);
            });
            return bedRecord;
        };
        return lineParser;
    }
    /**
     * Generates an autoSql schema for a BED file that has custom columns
     * @returns A string which is the autoSql spec
     */
    constructBedAutoSql() {
        const AUTO_SQL_HEADER = `table customBedSchema\n"BED12"\n    (\n`;
        const AUTO_SQL_FOOTER = '\n    )';

        const autoSqlFields = this.generateAutoSQLFields();
        return String.prototype.concat(AUTO_SQL_HEADER, autoSqlFields, AUTO_SQL_FOOTER);
    }
    /**
     * Generates the fields used in the autoSql schema. For custom column names.
     * @returns A string which is are the fields in the autoSql schema
     */
    generateAutoSQLFields() {
        const BED12Fields: FieldInfo[] = [
            ['string', 'chrom'],
            ['uint', 'chromStart'],
            ['uint', 'chromEnd'],
            ['string', 'name'],
            ['float', 'score'],
            ['char', 'strand'],
            ['uint', 'thickStart'],
            ['uint', 'thickEnd'],
            ['string', 'itemRgb'],
            ['uint', 'blockCount'],
            ['uint[blockCount]', 'blockSizes'],
            ['uint[blockCount]', 'blockStarts']
        ];
        if (!this.#n_columns) throw new Error('Number of columns was not able to be determined');
        if (!this.#customFields) return ''; // This function should never be called if there are no custom fields
        const customFieldType = 'string';
        const customFieldsWithTypes = this.#customFields.map(column => [customFieldType, column] as FieldInfo);

        let allFields: FieldInfo[];
        const REQUIRED_COLS = 3;
        if (this.#n_columns > BED12Fields.length) {
            if (this.#n_columns !== BED12Fields.length + this.#customFields.length) {
                throw new Error(`BED file error: unexpected number of custom fields. Found ${this.#n_columns} columns 
                    which is different from the expected ${BED12Fields.length + this.#customFields.length}`);
            }
            allFields = BED12Fields.concat(customFieldsWithTypes);
        } else {
            if (this.#n_columns - this.#customFields.length >= REQUIRED_COLS) {
                allFields = BED12Fields.slice(0, this.#n_columns - this.#customFields.length).concat(
                    customFieldsWithTypes
                );
            } else {
                throw new Error(
                    `Expected ${
                        REQUIRED_COLS + this.#customFields.length
                    } columns (${REQUIRED_COLS} required columns and ${
                        this.#customFields.length
                    } custom columns) but found ${this.#n_columns} columns`
                );
            }
        }

        const fieldDescription = 'custom input'; // A genetic description to satisfy the autoSQL parser
        const autoSqlFields = allFields
            .map(fieldInfo => `    ${fieldInfo[0]} ${fieldInfo[1]}; "${fieldDescription}"`)
            .join('\n');

        return autoSqlFields;
    }
}
/**
 * Used in BedParser to associate column names with data types
 */
type FieldInfo = [type: string, fieldName: string];

// promises indexed by urls
const bedFiles: Map<string, BedFile> = new Map();

type BedFileOptions = {
    sampleLength: number;
    customFields?: string[];
};

/**
 * All data stored in each BED file eventually gets put into this
 */
type BedRecord = {
    chrom: string;
    chromStart: number;
    chromEnd: number;
    name?: string;
    score?: number;
    strand?: string;
    thickStart?: number;
    thickEnd?: number;
    itemRgb?: string;
    blockCount?: number;
    blockSizes?: number;
    blockStarts?: number;
    [customField: string]: string | number | undefined;
};

export type BedTile = BedRecord;

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

    const recordPromises = await source.file.getTileData(minX, maxX, (bedRecord: BedRecord) => {
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
