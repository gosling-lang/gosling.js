// This worker is heavily based on https://github.com/higlass/higlass-pileup/blob/master/src/bam-fetcher-worker.js
import { text } from 'd3-request';
import { bisector } from 'd3-array';
import { tsvParseRows } from 'd3-dsv';
import { expose, Transfer } from 'threads/worker';
import { BamFile } from '@gmod/bam';
import QuickLRU from 'quick-lru';

import type { ChromInfo, TilesetInfo } from '@higlass/types';
import type { BamRecord } from '@gmod/bam';

function parseMD(mdString: string, useCounts: true): { type: string; length: number }[];
function parseMD(mdString: string, useCounts: false): { pos: number; base: string; length: 1; bamSeqShift: number }[];
function parseMD(mdString: string, useCounts: boolean) {
    let currPos = 0;
    let currNum = 0;
    let deletionEncountered = false;
    let bamSeqShift = 0;
    const substitutions = [];

    /* eslint-disable-next-line @typescript-eslint/prefer-for-of */
    for (let i = 0; i < mdString.length; i++) {
        if (mdString[i].match(/[0-9]/g)) {
            // a number, keep on going
            currNum = currNum * 10 + +mdString[i];
            deletionEncountered = false;
        } else if (mdString[i] === '^') {
            deletionEncountered = true;
        } else {
            currPos += currNum;

            if (useCounts) {
                substitutions.push({
                    length: currNum,
                    type: mdString[i]
                });
            } else if (deletionEncountered) {
                // Do nothing if there is a deletion and keep on going.
                // Note that there can be multiple deletions "^ATC"
                // Deletions are visualized using the CIGAR string
                // However, keep track of where in the bam seq we need to pull the variant.
                bamSeqShift -= 1;
            } else {
                substitutions.push({
                    pos: currPos,
                    base: mdString[i],
                    length: 1,
                    bamSeqShift
                });
            }

            currNum = 0;
            currPos += 1;
        }
    }

    return substitutions;
}

type Substitution = {
    pos: number;
    length: number;
    type: 'X' | 'I' | 'D' | 'N' | '=' | 'M' | 'S' | 'H';
    variant?: string;
};

type Segment = {
    // if two segments have the same name but different id, they are paired reads.
    // https://github.com/GMOD/bam-js/blob/7a57d24b6aef08a1366cca86ba5092254c7a7f56/src/bamFile.ts#L386
    id: string;
    name: string;
    start: number;
    end: number;
    md: string;
    chrName: string;
    chrOffset: number;
    cigar: string;
    mapq: string;
    strand: '+' | '-';
};

/**
 * Gets an array of all substitutions in the segment
 * @param segment  Current segment
 * @param seq  Read sequence from bam file.
 */
function getSubstitutions(segment: Segment, seq: string) {
    let substitutions: Substitution[] = [];
    let softClippingAtReadStart: null | { type: string; length: number } = null;

    if (segment.cigar) {
        const cigarSubs = parseMD(segment.cigar, true);
        let currPos = 0;

        for (const sub of cigarSubs) {
            if (sub.type === 'X') {
                // sequence mismatch, no need to do anything
                substitutions.push({
                    pos: currPos,
                    length: sub.length,
                    type: 'X'
                });

                currPos += sub.length;
            } else if (sub.type === 'I') {
                substitutions.push({
                    pos: currPos,
                    length: sub.length,
                    type: 'I'
                });
            } else if (sub.type === 'D') {
                substitutions.push({
                    pos: currPos,
                    length: sub.length,
                    type: 'D'
                });
                currPos += sub.length;
            } else if (sub.type === 'N') {
                substitutions.push({
                    pos: currPos,
                    length: sub.length,
                    type: 'N'
                });
                currPos += sub.length;
            } else if (sub.type === '=' || sub.type === 'M') {
                currPos += sub.length;
            } else {
                // console.log('skipping:', sub.type);
            }
            // if (referenceConsuming.has(sub.base)) {
            //   if (queryConsuming.has(sub.base)) {
            //     substitutions.push(
            //     {
            //       pos:
            //     })
            //   }
            // }
        }

        const firstSub = cigarSubs[0];
        const lastSub = cigarSubs[cigarSubs.length - 1];

        // Soft clipping can happen at the beginning, at the end or both
        // positions are from the beginning of the read
        if (firstSub.type === 'S') {
            softClippingAtReadStart = firstSub;
            // soft clipping at the beginning
            substitutions.push({
                pos: -firstSub.length,
                type: 'S',
                length: firstSub.length
            });
        }
        // soft clipping at the end
        if (lastSub.type === 'S') {
            substitutions.push({
                pos: segment.end - segment.start,
                length: lastSub.length,
                type: 'S'
            });
        }

        // Hard clipping can happen at the beginning, at the end or both
        // positions are from the beginning of the read
        if (firstSub.type === 'H') {
            substitutions.push({
                pos: -firstSub.length,
                type: 'H',
                length: firstSub.length
            });
        }
        if (lastSub.type === 'H') {
            substitutions.push({
                pos: segment.end - segment.start,
                length: lastSub.length,
                type: 'H'
            });
        }
    }

    if (segment.md) {
        const mdSubstitutions = parseMD(segment.md, false);
        mdSubstitutions.forEach(function (substitution: typeof mdSubstitutions[number] & { variant?: string }) {
            let posStart = substitution['pos'] + substitution['bamSeqShift']!;
            let posEnd = posStart + substitution['length'];
            // When there is soft clipping at the beginning,
            // we need to shift the position where we read the variant from the sequence
            // not necessary when there is hard clipping
            if (softClippingAtReadStart !== null) {
                posStart += softClippingAtReadStart.length;
                posEnd += softClippingAtReadStart.length;
            }
            substitution['variant'] = seq.substring(posStart, posEnd);
            // @ts-expect-error
            delete substitution['bamSeqShift'];
        });
        // @ts-expect-error
        substitutions = mdSubstitutions.concat(substitutions);
    }

    return substitutions;
}

/////////////////////////////////////////////////
/// ChromInfo
/////////////////////////////////////////////////

const chromInfoBisector = bisector((d: { pos: number }) => d.pos).left;

const chrToAbs = (chrom: string, chromPos: number, chromInfo: ChromInfo) =>
    chromInfo.chrPositions[chrom].pos + chromPos;

const absToChr = (absPosition: number, chromInfo: ChromInfo) => {
    if (!chromInfo || !chromInfo.cumPositions || !chromInfo.cumPositions.length) {
        return null;
    }

    let insertPoint = chromInfoBisector(chromInfo.cumPositions, absPosition);
    const lastChr = chromInfo.cumPositions[chromInfo.cumPositions.length - 1].chr;
    const lastLength = chromInfo.chromLengths[lastChr];

    // @ts-expect-error
    insertPoint -= insertPoint > 0 && 1;

    let chrPosition = Math.floor(absPosition - chromInfo.cumPositions[insertPoint].pos);
    let offset = 0;

    if (chrPosition < 0) {
        // before the start of the genome
        offset = chrPosition - 1;
        chrPosition = 1;
    }

    if (insertPoint === chromInfo.cumPositions.length - 1 && chrPosition > lastLength) {
        // beyond the last chromosome
        offset = chrPosition - lastLength;
        chrPosition = lastLength;
    }

    return [chromInfo.cumPositions[insertPoint].chr, chrPosition, offset, insertPoint] as const;
};

function natcmp(xRow: string | [string, number], yRow: string | [string, number]): number {
    const x = xRow[0];
    const y = yRow[0];

    if (x.indexOf('_') >= 0) {
        const xParts = x.split('_');
        if (y.indexOf('_') >= 0) {
            // chr_1 vs chr_2
            const yParts = y.split('_');

            return natcmp(xParts[1], yParts[1]);
        }

        // chr_1 vs chr1
        // chr1 comes first
        return 1;
    }

    if (y.indexOf('_') >= 0) {
        // chr1 vs chr_1
        // y comes second
        return -1;
    }

    const xParts: (string | number)[] = [];
    const yParts: (string | number)[] = [];

    for (const part of x.match(/(\d+|[^\d]+)/g) ?? []) {
        xParts.push(Number.isNaN(part) ? part.toLowerCase() : +part);
    }

    for (const part of y.match(/(\d+|[^\d]+)/g) ?? []) {
        xParts.push(Number.isNaN(part) ? part.toLowerCase() : +part);
    }

    // order of these parameters is purposefully reverse how they should be
    // ordered
    for (const key of ['m', 'y', 'x']) {
        if (y.toLowerCase().includes(key)) return -1;
        if (x.toLowerCase().includes(key)) return 1;
    }

    if (xParts < yParts) {
        return -1;
    } else if (yParts > xParts) {
        return 1;
    }

    return 0;
}

function parseChromsizesRows(data: (string[] | [string, number])[]): ChromInfo {
    const cumValues: ChromInfo['cumPositions'] = [];
    const chromLengths: ChromInfo['chromLengths'] = {};
    const chrPositions: ChromInfo['chrPositions'] = {};

    let totalLength = 0;

    for (let i = 0; i < data.length; i++) {
        const length = Number(data[i][1]);
        totalLength += length;

        const newValue = {
            id: i,
            chr: data[i][0],
            pos: totalLength - length
        };

        cumValues.push(newValue);
        chrPositions[newValue.chr] = newValue;
        chromLengths[data[i][0]] = length;
    }

    return {
        cumPositions: cumValues,
        chrPositions,
        totalLength,
        chromLengths
    };
}

type ExtendedChromInfo = ChromInfo & {
    absToChr(absPos: number): ReturnType<typeof absToChr>;
    chrToAbs(chr: [name: string, pos: number]): ReturnType<typeof chrToAbs> | null;
};

function ChromosomeInfo(filepath: string, success: (info: ExtendedChromInfo | null) => void) {
    return text(filepath, (error, chrInfoText) => {
        if (error) {
            // console.warn('Chromosome info not found at:', filepath);
            if (success) success(null);
        } else {
            const data = tsvParseRows(chrInfoText);
            const ret = parseChromsizesRows(data);
            if (success)
                success({
                    ...ret,
                    absToChr: absPos => (ret.chrPositions ? absToChr(absPos, ret) : null),
                    chrToAbs: ([chrName, chrPos]) => (ret.chrPositions ? chrToAbs(chrName, chrPos, ret) : null)
                });
        }
    });
}

/////////////////////////////////////////////////////
/// End Chrominfo
/////////////////////////////////////////////////////

const bamRecordToJson = (bamRecord: BamRecord, chrName: string, chrOffset: number) => {
    const seq = bamRecord.get('seq');
    const segment: Segment = {
        // if two segments have the same name but different id, they are paired reads.
        // https://github.com/GMOD/bam-js/blob/7a57d24b6aef08a1366cca86ba5092254c7a7f56/src/bamFile.ts#L386
        // @ts-expect-error private field!!
        id: bamRecord._id,
        name: bamRecord.get('name'),
        // @ts-expect-error private field!!
        start: +bamRecord.data.start + 1 + chrOffset,
        // @ts-expect-error private field!!
        end: +bamRecord.data.end + 1 + chrOffset,
        md: bamRecord.get('MD'),
        chrName,
        chrOffset,
        cigar: bamRecord.get('cigar'),
        mapq: bamRecord.get('mq'),
        strand: bamRecord.get('strand') === 1 ? '+' : '-'
    };
    return Object.assign(segment, { substitutions: getSubstitutions(segment, seq) });
};

type JsonBamRecord = ReturnType<typeof bamRecordToJson>;

// promises indexed by urls
const bamFiles: Record<string, BamFile> = {};
const bamHeaders: Record<string, ReturnType<BamFile['getHeader']>> = {};

const MAX_TILES = 20;

// promises indexed by chromSizesUrl
const chromSizes: Record<string, Promise<ExtendedChromInfo | null>> = {};
// promises indexed by uid
const chromInfos: Record<string, ChromInfo> = {};

const tileValues = new QuickLRU<string, JsonBamRecord[] | { error: string }>({ maxSize: MAX_TILES });
const tilesetInfos: Record<string, TilesetInfo> = {};

export type DataConfig = {
    bamUrl: string;
    baiUrl: string;
    chromSizesUrl?: string;
    loadMates?: boolean;
    maxInsertSize?: number;
    extractJunction?: boolean;
    junctionMinCoverage?: number;
};

// indexed by uuid
const dataConfs: Record<string, Omit<DataConfig, 'baiUrl'>> = {};

const init = (
    uid: string,
    {
        bamUrl,
        baiUrl,
        chromSizesUrl,
        loadMates = false,
        maxInsertSize = 5000,
        extractJunction = false,
        junctionMinCoverage = 1
    }: DataConfig
) => {
    if (!bamFiles[bamUrl]) {
        // we do not yet have this file cached
        bamFiles[bamUrl] = new BamFile({
            bamUrl,
            baiUrl
            // fetchSizeLimit: 500000000,
            // chunkSizeLimit: 100000000 ,
            // yieldThreadTime: 1000
        });

        // we have to fetch the header before we can fetch data
        bamHeaders[bamUrl] = bamFiles[bamUrl].getHeader();
    }

    // if no chromsizes are passed in, we'll retrieve them from the BAM file
    if (chromSizesUrl) {
        // cache by bamUrl
        chromSizes[chromSizesUrl] = new Promise(resolve => {
            ChromosomeInfo(chromSizesUrl, resolve);
        }); 
    }

    dataConfs[uid] = { bamUrl, chromSizesUrl, loadMates, maxInsertSize, extractJunction, junctionMinCoverage };
};

const tilesetInfo = (uid: string) => {
    const { chromSizesUrl, bamUrl } = dataConfs[uid];
    const promises = [
        // why do we await bamHeaders if not used in this function?
        bamHeaders[bamUrl],
        chromSizesUrl ? chromSizes[chromSizesUrl] : undefined
    ] as const;

    return Promise.all(promises).then(res => {
        const maybeInfo = res[1];
        const TILE_SIZE = 1024;
        let chromInfo: ChromInfo;

        if (maybeInfo) {
            // this means we received a chromInfo file
            chromInfo = maybeInfo;
        } else {
            // no chromInfo provided so we have to take it from the bam file index
            const chroms: [name: string, length: number][] = [];

            // @ts-expect-error indexToChr is a protected field
            const indexToChr = bamFiles[bamUrl].indexToChr;

            for (const { refName: chrName, length } of indexToChr) {
                chroms.push([chrName, length]);
            }
            chroms.sort(natcmp);
            chromInfo = parseChromsizesRows(chroms);
        }

        chromInfos[uid] = chromInfo;

        tilesetInfos[uid] = {
            tile_size: TILE_SIZE,
            bins_per_dimension: TILE_SIZE,
            max_zoom: Math.ceil(Math.log(chromInfo.totalLength / TILE_SIZE) / Math.log(2)),
            max_width: chromInfo.totalLength,
            min_pos: [0],
            max_pos: [chromInfo.totalLength]
        };

        return tilesetInfos[uid];
    });
};

const tile = async (uid: string, z: number, x: number): Promise<JsonBamRecord[]> => {
    const MAX_TILE_WIDTH = 200000;
    const { bamUrl, chromSizesUrl, loadMates } = dataConfs[uid];
    const bamFile = bamFiles[bamUrl];

    const info = await tilesetInfo(uid);

    if (!('max_width' in info)) {
        throw new Error('tilesetInfo does not include `max_width`, which is required for the Gosling BamDataFetcher.');
    }

    const tileWidth = +info.max_width / 2 ** +z;

    const recordPromises: Promise<JsonBamRecord[]>[] = [];

    if (tileWidth > MAX_TILE_WIDTH) {
        // this.errorTextText('Zoomed out too far for this track. Zoomin further to see reads');
        return new Promise(resolve => resolve([]));
    }

    // get the bounds of the tile
    let minX = info.min_pos[0] + x * tileWidth;
    const maxX = info.min_pos[0] + (x + 1) * tileWidth;

    const chromInfo = chromInfos[uid];

    const { chromLengths, cumPositions } = chromInfo;

    const opt = {
        viewAsPairs: loadMates
        // TODO: Turning this on results in "too many requests error"
        // https://github.com/gosling-lang/gosling.js/pull/556
        // pairAcrossChr: typeof loadMates === 'undefined' ? false : loadMates,
    };

    /* eslint-disable-next-line @typescript-eslint/prefer-for-of */
    for (let i = 0; i < cumPositions.length; i++) {
        const chromName = cumPositions[i].chr;
        const chromStart = cumPositions[i].pos;
        const chromEnd = cumPositions[i].pos + chromLengths[chromName];
        tileValues.set(`${uid}.${z}.${x}`, []);

        if (chromStart <= minX && minX < chromEnd) {
            // start of the visible region is within this chromosome

            if (maxX > chromEnd) {
                // the visible region extends beyond the end of this chromosome
                // fetch from the start until the end of the chromosome
                recordPromises.push(
                    bamFile
                        .getRecordsForRange(chromName, minX - chromStart, chromEnd - chromStart, opt)
                        .then(records => {
                            const mappedRecords = records.map(rec =>
                                bamRecordToJson(rec, chromName, cumPositions[i].pos)
                            );
                            tileValues.set(
                                `${uid}.${z}.${x}`,
                                (tileValues.get(`${uid}.${z}.${x}`) as JsonBamRecord[]).concat(mappedRecords)
                            );
                            return [];
                            // return mappedRecords;
                        })
                );

                // continue onto the next chromosome
                minX = chromEnd;
            } else {
                const startPos = Math.floor(minX - chromStart);
                const endPos = Math.ceil(maxX - chromStart);
                // the end of the region is within this chromosome
                recordPromises.push(
                    bamFile.getRecordsForRange(chromName, startPos, endPos, opt).then(records => {
                        const mappedRecords = records.map(rec => bamRecordToJson(rec, chromName, cumPositions[i].pos));
                        tileValues.set(
                            `${uid}.${z}.${x}`,
                            (tileValues.get(`${uid}.${z}.${x}`) as JsonBamRecord[]).concat(mappedRecords)
                        );
                        return [];
                    })
                );
                // end the loop because we've retrieved the last chromosome
                break;
            }
        }
    }

    // flatten the array of promises so that it looks like we're getting one long list of value
    return Promise.all(recordPromises).then(values => {
        return values.flat();
    });
};

const fetchTilesDebounced = async (uid: string, tileIds: string[]) => {
    const tiles: Record<string, JsonBamRecord[] & { tilePositionId: string }> = {};
    const validTileIds: string[] = [];
    const tilePromises: Promise<JsonBamRecord[]>[] = [];

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
        values.forEach((d, i) => {
            const validTileId = validTileIds[i];
            tiles[validTileId] = Object.assign(d, { tilePositionId: validTileId });
        });
        return tiles;
    });
};

const getTabularData = (uid: string, tileIds: string[]) => {
    const config = dataConfs[uid];
    const allSegments: Record<string, Segment & { substitutions: string }> = {};

    for (const tileId of tileIds) {
        const tileValue = tileValues.get(`${uid}.${tileId}`);

        if (!tileValue) {
            continue;
        }

        if ('error' in tileValue) {
            throw new Error(tileValue.error);
        }

        for (const segment of tileValue) {
            allSegments[segment.id] = {
                ...segment,
                substitutions: JSON.stringify(segment.substitutions)
            };
        }
    }

    const segments = Object.values(allSegments);

    // find and set mate info when the `data.loadMates` flag is on.
    if (config.loadMates) {
        // TODO: avoid mutation?
        findMates(segments, config.maxInsertSize);
    }

    let output: Junction[] | SegmentWithMate[] | Segment[];
    if (config.extractJunction) {
        // Reference(ggsashimi): https://github.com/guigolab/ggsashimi/blob/d686d59b4e342b8f9dcd484f0af4831cc092e5de/ggsashimi.py#L136
        output = findJunctions(segments, config.junctionMinCoverage);
    } else {
        output = segments;
    }

    const buffer = new TextEncoder().encode(JSON.stringify(output)).buffer;
    return Transfer(buffer, [buffer]);
};

const groupBy = <T, K extends keyof T>(xs: readonly T[], key: K): Record<string, T[]> =>
    xs.reduce((rv, x) => {
        // @ts-expect-error
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});

type SegmentWithMate = Segment & {
    mateIds: string[];
    foundMate: boolean;
    insertSize: number;
    largeInsertSize: boolean;
    svType: string;
    numMates: number;
};

/**
 * @param {string} uid data config UID
 * @param {Segment[]} segments
 */
const findMates = (segments: Segment[], maxInsertSize = 0) => {
    // @ts-expect-error This methods mutates this above aob
    const segmentsByReadName: Record<string, SegmentWithMate[]> = groupBy(segments, 'name');

    // Iterate entries and set information about mates
    Object.values(segmentsByReadName).forEach(segmentGroup => {
        if (segmentGroup.length === 2) {
            const read = segmentGroup[0];
            const mate = segmentGroup[1];
            read.mateIds = [mate.id];
            mate.mateIds = [read.id];
            // Additional info we want
            const [l, r] = [read, mate].sort((a, b) => +a.start - +b.start);
            const insertSize = Math.max(0, +r.start - +l.end);
            const largeInsertSize = insertSize >= maxInsertSize;

            let svType: string;
            if (!largeInsertSize) {
                svType = 'normal read';
            } else if (l.strand === '+' && r.strand === '-') {
                svType = 'deletion (+-)';
            } else if (l.strand === '+' && r.strand === '+') {
                svType = 'inversion (++)';
            } else if (l.strand === '-' && r.strand === '-') {
                svType = 'inversion (--)';
            } else if (l.strand === '-' && r.strand === '+') {
                svType = 'duplication (-+)';
            } else {
                svType = `(${l.strand}${r.strand})`;
            }

            // if(largeInsertSize) console.log(svType);
            [read, mate].forEach(d => {
                d.foundMate = true;
                d.insertSize = insertSize;
                d.largeInsertSize = largeInsertSize;
                d.svType = svType;
                d.numMates = 2;
            });
        } else {
            // We do not handle such cases for now
            segmentGroup.forEach(d => {
                d.mateIds = segmentGroup.filter(mate => mate.id !== d.id).map(mate => mate.id);
                d.foundMate = false;
                d.insertSize = -1;
                d.largeInsertSize = false;
                d.svType = segmentGroup.length === 1 ? 'mates not found within chromosome' : 'more than two mates';
                d.numMates = segmentGroup.length;
            });
        }
    });
    return segmentsByReadName;
};

type Junction = { start: number; end: number; score: number };

const findJunctions = (segments: { start: number; end: number; substitutions: string }[], minCoverage = 0) => {
    const junctions: Junction[] = [];
    segments.forEach(segment => {
        const substitutions: { pos: number; length: number }[] = JSON.parse(segment.substitutions);
        substitutions.forEach(sub => {
            const don = segment.start + sub.pos;
            const acc = segment.start + sub.pos + sub.length;
            if (segment.start < don && acc < segment.end) {
                const j = junctions.find(d => d.start === don && d.end === acc);
                if (j) {
                    j.score += 1;
                } else {
                    junctions.push({ start: don, end: acc, score: 1 });
                }
            }
        });
    });
    return junctions.filter(d => d.score >= minCoverage);
};

const tileFunctions = {
    init,
    tilesetInfo,
    fetchTilesDebounced,
    tile,
    getTabularData
};

expose(tileFunctions);

export type WorkerApi = typeof tileFunctions;
export type { TilesetInfo };
export type Tiles = Awaited<ReturnType<typeof fetchTilesDebounced>>;
