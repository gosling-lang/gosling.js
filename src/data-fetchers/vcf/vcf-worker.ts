/*
 * This document is heavily based on the following repo by @alexander-veit:
 * https://github.com/dbmi-bgm/higlass-sv/blob/main/src/sv-fetcher-worker.js
 */
import VCF from '@gmod/vcf';
import { TabixIndexedFile } from '@gmod/tabix';
import { expose, Transfer } from 'threads/worker';
import { sampleSize } from 'lodash-es';

import { fetchChromInfo, RemoteFile } from '../utils';

import type { TilesetInfo } from '@higlass/types';
import type { ExtendedChromInfo } from '../utils';

// promises indexed by urls
const vcfFiles: Record<string, TabixIndexedFile> = {};
const vcfHeaders: Record<string, Promise<string>> = {};
const tbiVCFParsers: Record<string, VCF> = {};

// const MAX_TILES = 20;
// https://github.com/GMOD/vcf-js/blob/c4a9cbad3ba5a3f0d1c817d685213f111bf9de9b/src/parse.ts#L284-L291
type VcfRecord = {
    CHROM: string;
    POS: number;
    ID: null | string[];
    REF: string;
    ALT: null | string[];
    QUAL: null | number;
    FILTER: null | string;
    INFO: Record<string, true | (number | null)[] | string[]>;
};

export type Tile = Omit<VcfRecord, 'ALT' | 'INFO'> & {
    ALT: string | undefined;
    MUTTYPE: ReturnType<typeof getMutationType>;
    SUBTYPE: ReturnType<typeof getSubstitutionType>;
    INFO: string;
    ORIGINALPOS: number;
    POS: number;
    POSEND: number;
    DISTPREV: number | null;
    DISTPREVLOGE: number | null;
};

// promises indexed by url
const chromSizes: Record<string, Promise<ExtendedChromInfo>> = {};
const chromInfos: Record<string, ExtendedChromInfo> = {};
const tileValues: Record<string, Tile[]> = {}; // new LRU({ max: MAX_TILES });
const tilesetInfos: Record<string, TilesetInfo> = {};

// const vcfData = [];

// indexed by uuid
type DataConfig = {
    vcfUrl: string;
    chromSizesUrl: string;
    sampleLength: number;
};
const dataConfs: Record<string, DataConfig> = {};

const init = (uid: string, vcfUrl: string, tbiUrl: string, chromSizesUrl: string, sampleLength: number) => {
    if (!vcfFiles[vcfUrl]) {
        vcfFiles[vcfUrl] = new TabixIndexedFile({
            filehandle: new RemoteFile(vcfUrl),
            tbiFilehandle: new RemoteFile(tbiUrl)
        });

        vcfHeaders[vcfUrl] = vcfFiles[vcfUrl].getHeader();
    }

    if (chromSizesUrl) {
        chromSizes[chromSizesUrl] = chromSizes[chromSizesUrl] ?? fetchChromInfo(chromSizesUrl);
    }

    dataConfs[uid] = { vcfUrl, chromSizesUrl, sampleLength };
};

const tilesetInfo = (uid: string) => {
    const { chromSizesUrl, vcfUrl } = dataConfs[uid];
    const promises = [vcfHeaders[vcfUrl], chromSizes[chromSizesUrl]] as const;
    return Promise.all(promises).then(([header, chromInfo]) => {
        if (!tbiVCFParsers[vcfUrl]) {
            tbiVCFParsers[vcfUrl] = new VCF({ header });
        }

        const TILE_SIZE = 1024;
        chromInfos[chromSizesUrl] = chromInfo;

        const retVal = {
            tile_size: TILE_SIZE,
            max_zoom: Math.ceil(Math.log(chromInfo.totalLength / TILE_SIZE) / Math.log(2)),
            max_width: chromInfo.totalLength,
            min_pos: [0],
            max_pos: [chromInfo.totalLength]
        };

        tilesetInfos[uid] = retVal;
        return retVal;
    });
};

const getMutationType = (ref: string, alt?: string) => {
    if (!alt) return 'unknown';
    if (ref.length === alt.length) return 'substitution';
    if (ref.length > alt.length) return 'deletion';
    if (ref.length < alt.length) return 'insertion';
    return 'unknown';
};

const getSubstitutionType = (ref: string, alt?: string) => {
    switch (ref + alt) {
        case 'CA':
        case 'GT':
            return 'C>A';
        case 'CG':
        case 'GC':
            return 'C>G';
        case 'CT':
        case 'GA':
            return 'C>T';
        case 'TA':
        case 'AT':
            return 'T>A';
        case 'TC':
        case 'AG':
            return 'T>C';
        case 'TG':
        case 'AC':
            return 'T>G';
        default:
            return 'unknown';
    }
};

// We return an empty tile. We get the data from SvTrack
const tile = async (uid: string, z: number, x: number): Promise<void[]> => {
    const { chromSizesUrl, vcfUrl } = dataConfs[uid];

    if (!vcfHeaders[vcfUrl]) return [];

    const CACHE_KEY = `${uid}.${z}.${x}`;

    // TODO: Caching is needed
    // if (!tileValues[CACHE_KEY]) {
    tileValues[CACHE_KEY] = [];
    // }

    const tsInfo = await tilesetInfo(uid);
    const recordPromises: Promise<void>[] = [];

    const tileWidth = +tsInfo.max_width / 2 ** +z;

    // get bounds of this tile
    const minX = tsInfo.min_pos[0] + x * tileWidth;
    const maxX = tsInfo.min_pos[0] + (x + 1) * tileWidth;

    let curMinX = minX;

    const { chromLengths, cumPositions } = chromInfos[chromSizesUrl];
    const tbiVCFParser = tbiVCFParsers[vcfUrl];

    cumPositions.forEach(cumPos => {
        const chromName = cumPos.chr;
        const chromStart = cumPos.pos;
        const chromEnd = cumPos.pos + chromLengths[chromName];

        const parseLineStoreData = (line: string, prevPos?: number) => {
            const vcfRecord: VcfRecord = tbiVCFParser.parseLine(line);
            const POS = cumPos.pos + vcfRecord.POS + 1;

            let ALT: string | undefined;
            if (Array.isArray(vcfRecord.ALT) && vcfRecord.ALT.length > 0) {
                ALT = vcfRecord.ALT[0];
            }

            // Additionally inferred values
            const DISTPREV = !prevPos ? null : vcfRecord.POS - prevPos;
            const DISTPREVLOGE = !prevPos ? null : Math.log(vcfRecord.POS - prevPos);
            const MUTTYPE = getMutationType(vcfRecord.REF, ALT);
            const SUBTYPE = getSubstitutionType(vcfRecord.REF, ALT);
            const POSEND = POS + vcfRecord.REF.length;

            // Create key values
            const data: Tile = {
                ...vcfRecord,
                ALT,
                MUTTYPE,
                SUBTYPE,
                INFO: JSON.stringify(vcfRecord.INFO),
                ORIGINALPOS: vcfRecord.POS,
                POS,
                POSEND,
                DISTPREV,
                DISTPREVLOGE
            };

            Object.keys(vcfRecord.INFO).forEach(key => {
                const val = vcfRecord.INFO[key];
                if (Array.isArray(val)) return [key, val[0]] as const;
                return [key, val] as const;
            });

            // Store this column
            tileValues[CACHE_KEY] = tileValues[CACHE_KEY].concat([data]);

            // Return current POS
            return vcfRecord.POS;
        };

        let startPos, endPos;
        if (chromStart <= curMinX && curMinX < chromEnd) {
            // start of the visible region is within this chromosome
            let prevPOS: number | undefined;
            if (maxX > chromEnd) {
                // the visible region extends beyond the end of this chromosome
                // fetch from the start until the end of the chromosome

                startPos = curMinX - chromStart;
                endPos = chromEnd - chromStart;
                recordPromises.push(
                    vcfFiles[vcfUrl]
                        .getLines(chromName, startPos, endPos, line => {
                            prevPOS = parseLineStoreData(line, prevPOS);
                        })
                        .then(() => {})
                );
            } else {
                startPos = Math.floor(curMinX - chromStart);
                endPos = Math.ceil(maxX - chromStart);
                recordPromises.push(
                    vcfFiles[vcfUrl]
                        .getLines(chromName, startPos, endPos, line => {
                            prevPOS = parseLineStoreData(line, prevPOS);
                        })
                        .then(() => {})
                );
                return;
            }

            curMinX = chromEnd;
        }
    });

    return Promise.all(recordPromises).then(values => values.flat());
};

const fetchTilesDebounced = async (uid: string, tileIds: string[]) => {
    const tiles: Record<string, Tile> = {};
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
            // @ts-expect-error values is void, this should never happen.
            tiles[validTileId] = values[i];
            // @ts-expect-error values is void, this should never happen.
            tiles[validTileId].tilePositionId = validTileId;
        }
        return tiles;
    });
};

const getTabularData = (uid: string, tileIds: string[]) => {
    const data: Tile[][] = [];

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

    const sampleLength = dataConfs[uid].sampleLength;
    if (output.length >= sampleLength) {
        // TODO: we can make this more generic
        // priotize that mutations with closer each other are selected when sampling.
        const highPriority = output.sort((a, b) => -(a.DISTPREV ?? 0) + (b.DISTPREV ?? 0)).slice(0, sampleLength / 2.0);
        output = sampleSize(output, sampleLength / 2.0).concat(highPriority);
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
