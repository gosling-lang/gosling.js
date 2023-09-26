import { dsvFormat as d3dsvFormat, type DSVRowString } from 'd3-dsv';
import { computeChromSizes } from '../../core/utils/assembly';
import { sampleSize } from 'lodash-es';
import type { Assembly, CsvData, FilterTransform, Datum } from '@gosling-lang/gosling-schema';
import { filterData } from '../../core/utils/data-transform';
import { type CommonDataConfig, filterUsingGenoPos, sanitizeChrName, RemoteFile } from '../utils';

type CsvDataConfig = CsvData & CommonDataConfig & { filter?: FilterTransform[] };

interface ChromSizes {
    chrToAbs: (chrom: string, chromPos: number) => number;
    cumPositions: { id: number; chr: string; pos: number }[];
    chrPositions: { [k: string]: { id: number; chr: string; pos: number } };
    totalLength: number;
    chromLengths: { [k: string]: number };
}

/**
 * Used in #tile() to associate tile coordinates with data
 */
interface TileInfo {
    tabularData: Datum[];
    server: null;
    tilePos: number[];
    zoomLevel: number;
    tilePositionId?: string;
}
/**
 * This is what all the tile information eventually gets organized into.
 */
export interface LoadedTiles {
    [tilePositionId: string]: TileInfo;
}

/**
 * Used in #generateTilesetInfo()
 */
interface TilesetInfo {
    tile_size: number;
    max_zoom: number;
    max_width: number;
    min_pos: number[];
    max_pos: number[];
}

export class CsvDataFetcherClass {
    dataConfig: CsvDataConfig;
    // @ts-ignore
    tilesetInfoLoading: boolean; // Used in TiledPixiTrack

    #dataPromise: Promise<void> | undefined;
    #chromSizes: ChromSizes;
    #parsedData!: DSVRowString<string>[]; // Either set in the constructor or in #fetchCsv()
    #assembly: Assembly;
    #filter: FilterTransform[] | undefined;
    #file: RemoteFile;

    constructor(dataConfig: CsvDataConfig) {
        this.dataConfig = dataConfig;
        this.tilesetInfoLoading = false;
        this.#assembly = this.dataConfig.assembly;
        this.#filter = this.dataConfig.filter;

        if (!dataConfig.url) {
            console.error('Please provide the `url` of the data');
        }

        // Use any headers for this particular URL
        const { urlFetchOptions, url } = dataConfig;
        this.#file = new RemoteFile(url, { overrides: urlFetchOptions });

        this.#chromSizes = this.#generateChomSizeInfo();
        this.#dataPromise = this.#fetchCsv();
    }

    /**
     * Fetches CSV file from url, parses it, and sets this.#parsedData
     */
    async #fetchCsv(): Promise<void> {
        const { chromosomeField, genomicFields, headerNames, longToWideId, genomicFieldsToConvert } = this.dataConfig;

        const separator = this.dataConfig.separator ?? ',';

        try {
            const buffer = await this.#file.readFile();
            const text = buffer.toString();
            const textWithHeader = headerNames ? `${headerNames.join(separator)}\n${text}` : text;

            const parsedCSV = d3dsvFormat(separator).parse(textWithHeader, (row: DSVRowString<string>) =>
                this.#processCsvRow(row, genomicFieldsToConvert, chromosomeField, genomicFields)
            );

            if (longToWideId && parsedCSV[0]?.[longToWideId]) {
                // rows having identical IDs are juxtaposed horizontally
                const columnNames = Object.keys(parsedCSV[0]);
                const newJson: { [k: string]: DSVRowString<string> } = {};
                parsedCSV.forEach(row => {
                    if (!newJson[row[longToWideId] as string]) {
                        newJson[row[longToWideId] as string] = JSON.parse(JSON.stringify(row));
                    } else {
                        columnNames.forEach(colName => {
                            newJson[row[longToWideId] as string][`${colName}_2`] = row[colName];
                        });
                    }
                });
                this.#parsedData = Object.keys(newJson).map(k_3 => newJson[k_3]);
            } else {
                this.#parsedData = parsedCSV;
            }
        } catch (error) {
            console.error('[Gosling Data Fetcher] Error fetching data', error);
        }
    }

    /**
     * Function passed into DSV parser to process each row
     * @param row An object which contains the row information. The keys are the column names
     * @param genomicFieldsToConvert From data config
     * @param chromosomeField From data config
     * @param genomicFields From data config
     * @returns The processed row
     */
    #processCsvRow(
        row: DSVRowString,
        genomicFieldsToConvert: CsvData['genomicFieldsToConvert'],
        chromosomeField: CsvData['chromosomeField'],
        genomicFields: CsvData['genomicFields']
    ) {
        try {
            if (genomicFieldsToConvert) {
                // This spec is used when multiple chromosomes are stored in a single row
                genomicFieldsToConvert.forEach(chromMap => {
                    const genomicFields_1 = chromMap.genomicFields;
                    const chromName = row[chromMap.chromosomeField] as string;

                    genomicFields_1.forEach((positionCol: string) => {
                        const chromPosition = row[positionCol] as string;
                        row[positionCol] = String(this.#calcCumulativePos(chromName, chromPosition));
                    });
                });
            } else if (chromosomeField && genomicFields) {
                genomicFields.forEach((positionCol_1: string) => {
                    const chromPosition_1 = row[positionCol_1] as string;
                    const chromName_1 = row[chromosomeField] as string;
                    row[positionCol_1] = String(this.#calcCumulativePos(chromName_1, chromPosition_1));
                });
            }
            return row;
        } catch {
            // skip the rows that had errors in them
            return undefined;
        }
    }

    /**
     * Calculates the cumulative chromosome position based on the chromosome name and position
     * @param chromName A string, the name of the chromosome
     * @param chromPosition A string, the position within the chromosome
     */
    #calcCumulativePos(chromName: string, chromPosition: string) {
        if (this.#assembly !== 'unknown') {
            // This means we need to use the relative position considering the start position of individual chr.
            const chrName = sanitizeChrName(chromName, this.#assembly, this.dataConfig.chromosomePrefix);
            return computeChromSizes(this.#assembly).interval[chrName][0] + +chromPosition;
        } else {
            return chromPosition;
        }
    }
    /**
     * Called in TiledPixiTrack
     */
    tilesetInfo(callback?: (tilesetInto: TilesetInfo) => void): Promise<TilesetInfo | void> | undefined {
        if (!this.#dataPromise) {
            // data promise is not prepared yet
            return;
        }

        this.tilesetInfoLoading = true;

        return this.#dataPromise
            .then(() => this.#generateTilesetInfo(callback))
            .catch(err => {
                this.tilesetInfoLoading = false;
                console.error('[Gosling Data Fetcher] Error parsing data:', err);
            });
    }
    /**
     * Called by this.tilesetInfo() to call a callback function with tileset info.
     */
    #generateTilesetInfo(callback?: (tilesetInfo: TilesetInfo) => void): TilesetInfo {
        this.tilesetInfoLoading = false;

        const TILE_SIZE = 1024;
        const totalLength = this.#chromSizes.totalLength;
        const retVal = {
            tile_size: TILE_SIZE,
            max_zoom: Math.ceil(Math.log(totalLength / TILE_SIZE) / Math.log(2)),
            max_width: totalLength,
            min_pos: [0, 0],
            max_pos: [totalLength, totalLength]
        };

        if (callback) {
            callback(retVal);
        }

        return retVal;
    }
    /**
     * Called in TiledPixiTrack.
     * @param receivedTiles A function from TiledPixiTrack which takes in all the loaded tiles
     * @param tileIds An array of tile IDs. Ex. ['1.0', '1.1']
     */
    fetchTilesDebounced(receivedTiles: (loadedTiles: LoadedTiles) => void, tileIds: string[]): void {
        const tiles: LoadedTiles = {};

        const validTileIds: string[] = [];
        const tilePromises = [];

        for (const tileId of tileIds) {
            const parts = tileId.split('.');
            const z = parseInt(parts[0], 10);
            const x = parseInt(parts[1], 10);
            const y = parseInt(parts[2], 10);

            if (Number.isNaN(x) || Number.isNaN(z)) {
                console.warn('[Gosling Data Fetcher] Invalid tile zoom or position:', z, x, y);
                continue;
            }

            validTileIds.push(tileId);
            tilePromises.push(this.#tile(z, x, y));
        }

        Promise.all(tilePromises).then(tileInfo => {
            tileInfo.forEach((tileInfo, i) => {
                if (tileInfo) {
                    const validTileId = validTileIds[i];
                    tiles[validTileId] = tileInfo;
                    tiles[validTileId].tilePositionId = validTileId;
                }
            });
            receivedTiles(tiles);
        });
    }
    /**
     * Creates an object to associate a tile position with the corresponding data
     * @param z An integer, the z coordinate of the tile
     * @param x An integer, the x coordinate of the tile
     * @param y An integer, the y coordinate of the tile
     * @returns A promise of an object with tile coordinates and data
     */
    async #tile(z: number, x: number, y: number): Promise<TileInfo | undefined> {
        const tilesetInfo = await this.tilesetInfo();
        if (!tilesetInfo) return;

        const tileWidth = +tilesetInfo.max_width / 2 ** +z;

        // get the bounds of the tile
        const minX = tilesetInfo.min_pos[0] + x * tileWidth;
        const maxX = tilesetInfo.min_pos[0] + (x + 1) * tileWidth;

        // filter the data so that only the visible data is sent to tracks
        let tabularData = filterUsingGenoPos(this.#parsedData as Datum[], [minX, maxX], this.dataConfig);

        // filter data based on the `DataTransform` spec
        this.#filter?.forEach(f => {
            tabularData = filterData(f, tabularData);
        });

        const sizeLimit = this.dataConfig.sampleLength ?? 1000;
        return {
            // sample the data to make it managable for visualization components
            tabularData: tabularData.length > sizeLimit ? sampleSize(tabularData, sizeLimit) : tabularData,
            server: null,
            tilePos: [x, y],
            zoomLevel: z
        };
    }

    /**
     * This function calculates chromosome position and size based on the assembly (this.#assembly)
     * @returns An object containing chromosome information and a way to calculate absolute position
     */
    #generateChomSizeInfo(): ChromSizes {
        // Prepare chromosome interval information
        const chromosomeSizes: { [k: string]: number } = computeChromSizes(this.#assembly).size;
        const chromosomeCumPositions: { id: number; chr: string; pos: number }[] = [];
        const chromosomePositions: { [k: string]: { id: number; chr: string; pos: number } } = {};
        let prevEndPosition = 0;

        Object.keys(chromosomeSizes).forEach((chrStr, i) => {
            const positionInfo = {
                id: i,
                chr: chrStr,
                pos: prevEndPosition
            };

            chromosomeCumPositions.push(positionInfo);
            chromosomePositions[chrStr] = positionInfo;

            prevEndPosition += chromosomeSizes[chrStr];
        });

        return {
            chrToAbs: (chrom: string, chromPos: number) => this.#chromSizes.chrPositions[chrom].pos + chromPos,
            cumPositions: chromosomeCumPositions,
            chrPositions: chromosomePositions,
            totalLength: prevEndPosition,
            chromLengths: chromosomeSizes
        };
    }
}

/**
 * HiGlass data fetcher specific for Gosling which ultimately will accept any types of data other than CSV files.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CsvDataFetcher(
    _HGC: import('@higlass/types').HGC,
    dataConfig: CsvDataConfig,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _pubsub: Record<string, any>
): CsvDataFetcherClass {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    return new CsvDataFetcherClass(dataConfig);
}

CsvDataFetcher.config = {
    type: 'csv'
};

export default CsvDataFetcher;
