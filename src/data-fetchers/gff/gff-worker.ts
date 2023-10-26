import { TabixIndexedFile } from '@gmod/tabix';
import GFF from '@gmod/gff';
import type { GFF3FeatureLineWithRefs, GFF3Feature, GFF3Sequence } from '@gmod/gff';
import { expose, Transfer } from 'threads/worker';
import { sampleSize } from 'lodash-es';
import type { TilesetInfo } from '@higlass/types';
import type { ChromSizes } from '@gosling-lang/gosling-schema';
import { DataSource, RemoteFile } from '../utils';
import { isGFF3Feature, makeRandomSortedArray } from './utils';

export type GffFileOptions = {
    sampleLength: number;
    attributesToFields?: { attribute: string; defaultValue: string }[];
    urlFetchOptions?: RequestInit;
    indexUrlFetchOptions?: RequestInit;
};

export interface GffTile extends GFF3FeatureLineWithRefs {
    attribute?: string;
}

export interface EmptyTile {
    tilePositionId: string;
}

/**
 * A class to represent a GFF file. It takes care of setting up gmod/tabix.
 */
class GffFile {
    #uid: string;
    tbi: TabixIndexedFile;
    #n_features?: number;

    constructor(tbi: TabixIndexedFile, uid: string) {
        this.tbi = tbi;
        this.#uid = uid;
    }
    /**
     * Function to create an instance of BedFile
     * @param url A string which is the URL of the bed file
     * @param indexUrl A string which is the URL of the bed  index file
     * @param uid A unique identifier for the worker
     * @param urlFetchOptions When the url is fetched, these options will be used
     * @param indexUrlFetchOptions When the index URL is fetched, these options will be used
     * @returns an instance of BedFile
     */
    static fromUrl(
        url: string,
        indexUrl: string,
        uid: string,
        urlFetchOptions?: RequestInit,
        indexUrlFetchOptions?: RequestInit
    ): GffFile {
        const tbi = new TabixIndexedFile({
            filehandle: new RemoteFile(url, { overrides: urlFetchOptions }),
            tbiFilehandle: new RemoteFile(indexUrl, { overrides: indexUrlFetchOptions })
        });
        return new GffFile(tbi, uid);
    }
    /**
     * Calculates the total number of features in a file
     * @returns A number of the features in a file
     */
    async #getNumberFeatures() {
        if (!this.#n_features) {
            const source = dataSources.get(this.#uid)!;
            const { cumPositions } = source.chromInfo;
            const countPromises: Promise<number>[] = [];
            for (const cumPos of cumPositions) {
                const chromName = cumPos.chr;
                countPromises.push(this.tbi.lineCount(chromName));
            }
            const counts = await Promise.all(countPromises);
            const total_counts = counts.reduce((acc, cur) => acc + cur, 0);
            this.#n_features = total_counts;
        }
        return this.#n_features;
    }
    /**
     * Retrieves the lines between a range of absolute genomic coordinates
     * @param minX the minimum absolute coordinate
     * @param maxX the maximum absolute coordinate
     * @returns A promise to an array of strings, where each string is a line from the GFF
     */
    #getLinePromises(minX: number, maxX: number): Promise<string[]>[] {
        const source = dataSources.get(this.#uid)!;
        let curMinX = minX;
        const { chromLengths, cumPositions } = source.chromInfo;
        const linePromises: Promise<string[]>[] = [];
        // This helps with the performance of viewing many features over a large genomic range
        // Strategy: Get features from randomly selected windows within the entire region
        // If the total number of features in the file is less than MAX_FEATURES, then we don't do this.
        const MAX_FEATURES = 500000; // if the number of features is less than this, we just get all the lines
        const MAX_WINDOW = 4000000; // if the maxX - minX is less than this, then we'll just get all the lines
        if (this.#n_features && this.#n_features > MAX_FEATURES && maxX - minX > MAX_WINDOW) {
            const diff = maxX - minX;
            const windowSize = 50000;
            const n_samples = 100;

            const totalBins = Math.floor(diff / windowSize);
            const selectedBins = makeRandomSortedArray(n_samples, totalBins);
            const binLines = selectedBins.map(bin => {
                const binStart = minX + bin * windowSize;
                const binEnd = binStart + windowSize;
                return this.#getLinePromises(binStart, binEnd);
            });
            return binLines.flat();
        }

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

                this.tbi.getLines(chromName, startPos, endPos, lineCallback).then(() => {
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
        const source = dataSources.get(this.#uid)!;
        const sampleLength = source.options.sampleLength; // maximum number of features that can be shown
        const attributesToFields = source.options.attributesToFields;

        await this.#getNumberFeatures();
        /**
         * Function to filter out child features if there are too many features
         * @param lines an array of strings, where each string is a line from the GFF
         * @returns an array of strings, where each string is a line from the GFF
         */
        function filterLines(lines: string[]): string[] {
            // Keep only the non child lines
            const nonChildLines = lines.filter(line => {
                const lineColumns = line.split('\t');
                const attributes = lineColumns[8]; // this is the attributes column
                return !attributes.includes('Parent=');
            });
            return sampleSize(nonChildLines, sampleLength);
        }

        /**
         * Function to reformat the output of GFF.parseStringSync() into tiles
         * @param parsed Output from GFF.parseStringSync()
         * @returns An array of GffTile
         */
        function parsedLinesToTiles(parsed: (GFF3Feature | GFF3Sequence)[]): GffTile[] {
            let tiles: GffTile[] = [];
            for (const line of parsed) {
                if (isGFF3Feature(line)) {
                    for (const feature of line) {
                        // make the start and end absolute
                        if (feature.seq_id && feature.start)
                            feature.start = source.chromInfo.chrToAbs([feature.seq_id, feature.start]);
                        if (feature.seq_id && feature.end)
                            feature.end = source.chromInfo.chrToAbs([feature.seq_id, feature.end]);
                        tiles.push(feature);
                    }
                }
            }
            // Add specific attributes to each tile if specified
            if (attributesToFields) {
                tiles = tiles.map(tile => {
                    const attributes = tile.attributes;
                    const cleanAtt: { [key: string]: unknown } = {};
                    attributesToFields.forEach(attMap => {
                        const attName = attMap.attribute;
                        const attDefault = attMap.defaultValue;
                        if (attributes == null || !(attName in attributes) || !Array.isArray(attributes[attName]))
                            cleanAtt[attName] = attDefault;
                        else {
                            const attVal = attributes[attName];
                            if (Array.isArray(attVal)) {
                                // Join the array array if there is more than one element
                                cleanAtt[attName] = attVal.length == 1 ? attVal[0] : attVal.join(',');
                            }
                        }
                    });
                    return { ...tile, ...cleanAtt };
                });
            }
            return tiles;
        }

        // First, we get the lines we want to parse and filter out the lines we don't want to parse
        const linePromises = this.#getLinePromises(minX, maxX);
        const allLines = (await Promise.all(linePromises)).flat();
        let linesToParse = [];
        if (allLines.length > sampleLength) {
            linesToParse = filterLines(allLines);
        } else {
            linesToParse = allLines;
        }
        // Second, we parse the lines using gmod/gff
        const parseOptions = {
            disableDerivesFromReferences: true,
            parseFeatures: true,
            parseComments: false,
            parseDirectives: false,
            parseSequences: false
        };
        const parsedLines = GFF.parseStringSync(linesToParse.join('\n'), parseOptions);
        // Third, we reformat the parsed GFF into the expected tile format
        const tiles = parsedLinesToTiles(parsedLines);
        return tiles;
    }
}

// promises indexed by urls
const gffFiles: Map<string, GffFile> = new Map();

/**
 * Object to store tile data. Each key a string which contains the coordinates of the tile
 */
const tileValues: Record<string, GffTile[]> = {};
/**
 * Maps from UID to GFF File info
 */
const dataSources: Map<string, DataSource<GffFile, GffFileOptions>> = new Map();

function init(
    uid: string,
    bed: { url: string; indexUrl: string },
    chromSizes: ChromSizes,
    options: Partial<GffFileOptions> = {}
) {
    let gffFile = gffFiles.get(bed.url);
    if (!gffFile) {
        gffFile = GffFile.fromUrl(bed.url, bed.indexUrl, uid, options.urlFetchOptions, options.indexUrlFetchOptions);
    }
    const dataSource = new DataSource(gffFile, chromSizes, {
        sampleLength: 1000, // default sampleLength
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
