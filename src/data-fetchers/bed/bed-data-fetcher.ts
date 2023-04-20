import { dsvFormat as d3dsvFormat } from 'd3-dsv';
import { computeChromSizes } from '../../core/utils/assembly';
import { sampleSize } from 'lodash-es';
import type { Assembly, BedData, FilterTransform, Datum } from '@gosling.schema';
import { filterData } from '../../core/utils/data-transform';
import { type CommonDataConfig, filterUsingGenoPos } from '../utils';

type BedDataConfig = BedData & CommonDataConfig & { filter: FilterTransform[] };

interface ChomSizes {
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

/**
 * Enum of the BED12 header
 */
enum BED12 {
    Chrom = 'chrom',
    ChromStart = 'chromStart',
    ChromEnd = 'chromEnd',
    Name = 'name',
    Score = 'score',
    Strand = 'strand',
    ThickStart = 'thickStart',
    ThickEnd = 'thickEnd',
    ItemRgb = 'itemRgb',
    BlockCount = 'blockCount',
    BlockSizes = 'blockSizes',
    MyField = 'myField'
}

/**
 * HiGlass data fetcher specific for Gosling which ultimately will accept any types of data other than CSV files.
 */
function BedDataFetcher(HGC: any, ...args: any): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    class BedDataFetcherClass {
        dataConfig: BedDataConfig;
        // @ts-ignore
        tilesetInfoLoading: boolean; // Used in TiledPixiTrack

        #dataPromise: Promise<void> | undefined;
        #chromSizes: ChomSizes;
        #parsedCSVdata!: { [k: string]: string | number }[]; // Either set in the constructor or in #fetchCsv()
        #assembly: Assembly;
        #filter: FilterTransform[] | undefined;

        constructor(params: any[]) {
            console.warn('Bed constructor called');
            const [dataConfig] = params;
            this.dataConfig = dataConfig;
            this.tilesetInfoLoading = false;
            this.#assembly = this.dataConfig.assembly;
            this.#filter = this.dataConfig.filter;

            if (!dataConfig.url) {
                console.error('Please provide the `url` of the data');
            }

            this.#chromSizes = this.#generateChomSizeInfo();

            if (dataConfig.data) {
                // we have raw data that we can use right away
                this.#parsedCSVdata = dataConfig.data;
            } else {
                this.#dataPromise = this.#fetchBed();
            }
        }
        /**
         * Determines the correct header names of the BED file, based on the number of columns in the file
         * and provided custom fields
         * @param customFields The custom fields passed in to the data configuration
         * @param n_cols the number of columns found in the bed file
         * @returns array of the headers of the bed file
         */
        static #determineHeader(customFields: string[], n_cols: number): string[] {
            const standardHeaders = [
                BED12.Chrom,
                BED12.ChromStart,
                BED12.ChromEnd,
                BED12.Name,
                BED12.Score,
                BED12.Strand,
                BED12.ThickStart,
                BED12.ThickEnd,
                BED12.ItemRgb,
                BED12.BlockCount,
                BED12.BlockSizes,
                BED12.MyField
            ];

            if (customFields.length === 0) {
                if (n_cols > standardHeaders.length) {
                    throw new Error('BED file error: more columns found than expected');
                }
                return standardHeaders.slice(0, n_cols);
            }
            if (n_cols > standardHeaders.length) {
                if (n_cols !== standardHeaders.length + customFields.length) {
                    throw new Error(`BED file error: unexpected number of custom fields. Found ${n_cols} columns 
                    which is different from the expected ${standardHeaders.length + customFields.length}`);
                }
                return (standardHeaders as string[]).concat(customFields);
            } else {
                if (standardHeaders.length - n_cols >= 3) {
                    return (standardHeaders as string[]).slice(0, n_cols - customFields.length).concat(customFields);
                } else {
                    throw new Error(`There are ${n_cols} total and ${customFields.length} custom columns. The 
                    first three columns are required to be ${BED12.Chrom}, ${BED12.ChromStart}, ${BED12.ChromEnd}`);
                }
            }
        }
        /**
         * Calculates the number column in a tabular data string
         * @param tabularString: the tabular data in string format
         * @param separator: the text delimiter of tabularString
         */
        static #calcNCols(tabularString: string, separator: string): number {
            const newLinePos = tabularString.indexOf('\n');
            const firstRow = tabularString.slice(0, newLinePos);
            return firstRow.split(separator).length;
        }

        /**
         * Fetches CSV file from url, parses it, and sets this.#parsedCSVdata
         */
        async #fetchBed(): Promise<void> {
            const url = this.dataConfig.url;
            const customFields = this.dataConfig.customFields ?? [];
            const separator = this.dataConfig.separator ?? ',';

            try {
                const response = await fetch(url);
                const text = await (response.ok ? response.text() : Promise.reject(response.status));

                const n_cols = BedDataFetcherClass.#calcNCols(text, separator);
                console.warn(n_cols);
                const headerNames = BedDataFetcherClass.#determineHeader(customFields, n_cols);
                // Collect the column names which contain choromosome coordinates
                const chromPosHeaders = [BED12.ChromStart, BED12.ChromEnd];
                if (headerNames[6] === BED12.ThickStart) chromPosHeaders.push(BED12.ThickStart);
                if (headerNames[7] === BED12.ThickEnd) chromPosHeaders.push(BED12.ThickEnd);

                console.warn(headerNames);
                console.warn('position headers', chromPosHeaders);

                const textWithHeader = `${headerNames.join(separator)}\n${text}`;
                const json = d3dsvFormat(separator).parse(textWithHeader, row => {
                    chromPosHeaders.forEach(chromPosCol => {
                        const chromPosition = row[chromPosCol] as string;
                        if (typeof row[BED12.Chrom] === 'string' && parseInt(chromPosition) >= 0) {
                            row[chromPosCol] = this.#calcCumulativePos(row[BED12.Chrom], chromPosition);
                        }
                    });
                    return row;
                });
                console.warn(json);
                this.#parsedCSVdata = json;
            } catch (error) {
                console.error('[Gosling Data Fetcher] Error fetching data', error);
            }
        }

        /**
         * Calculates the cumulative chromosome position based on the chromosome name and position
         * @param chromName A string, the name of the chromosome
         * @param chromPosition A number, the position within the chromosome
         */
        #calcCumulativePos(chromName: string, chromPosition: string) {
            if (this.#assembly !== 'unknown') {
                return computeChromSizes(this.#assembly).interval[chromName][0] + +chromPosition;
            } else {
                return chromPosition;
            }
        }
        /**
         * Called in TiledPixiTrack
         */
        tilesetInfo(callback?: (loadedTiles: TilesetInfo) => void): Promise<TilesetInfo | void> | undefined {
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
        #generateTilesetInfo(callback?: (loadedTiles: TilesetInfo) => void): TilesetInfo {
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
         * @param receivedTiles A function from TiledPixiTrack
         * @param tileIds An array of tile IDs
         */
        fetchTilesDebounced(receivedTiles: (loadedTiles: any) => void, tileIds: any[]): void {
            const tiles: { [k: string]: any } = {};

            const validTileIds: any[] = [];
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

            Promise.all(tilePromises).then(values => {
                values.forEach((value, i) => {
                    const validTileId = validTileIds[i];
                    tiles[validTileId] = value;
                    tiles[validTileId].tilePositionId = validTileId;
                });
                receivedTiles(tiles);
            });
        }
        /**
         * Creates an object to associate a tile position with the corresponding data
         * @param z An integer, the z coordinate of the tile
         * @param x An integer, the x coodinate of the tile
         * @param y An integer, the y coordinate of the tile
         * @returns A promise of an object with tile coordinates and data
         */
        #tile(z: number, x: number, y: number): Promise<TileInfo> | undefined {
            return this.tilesetInfo()?.then((tsInfo: any) => {
                const tileWidth = +tsInfo.max_width / 2 ** +z;

                // get the bounds of the tile
                const minX = tsInfo.min_pos[0] + x * tileWidth;
                const maxX = tsInfo.min_pos[0] + (x + 1) * tileWidth;

                // filter the data so that only the visible data is sent to tracks
                let tabularData = filterUsingGenoPos(this.#parsedCSVdata, [minX, maxX], this.dataConfig);

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
            });
        }

        /**
         * This function calculates chromosome position and size based on the assembly (this.#assembly)
         * @returns An object containing chromosome information and a way to calculate absolute position
         */
        #generateChomSizeInfo(): ChomSizes {
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

    return new BedDataFetcherClass(args);
}

BedDataFetcher.config = {
    type: 'bed'
};

export default BedDataFetcher;
