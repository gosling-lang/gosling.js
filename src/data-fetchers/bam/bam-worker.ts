// Adopted from https://github.com/higlass/higlass-pileup/blob/master/src/bam-fetcher-worker.js
import { expose, Transfer } from 'threads/worker';
import { BamFile as _BamFile } from '@gmod/bam';
import QuickLRU from 'quick-lru';

import type { TilesetInfo } from '@higlass/types';
import type { BamRecord } from '@gmod/bam';

import { DataSource, RemoteFile } from '../utils';
import type { ChromSizes } from '@gosling.schema';

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

export type Segment = {
    // if two segments have the same name but different id, they are paired reads.
    // https://github.com/GMOD/bam-js/blob/7a57d24b6aef08a1366cca86ba5092254c7a7f56/src/bamFile.ts#L386
    id: string;
    name: string;
    start: number;
    end: number;
    md: string;
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

const bamRecordToJson = (bamRecord: BamRecord) => {
    const seq = bamRecord.get('seq');
    const segment: Segment = {
        // if two segments have the same name but different id, they are paired reads.
        // https://github.com/GMOD/bam-js/blob/7a57d24b6aef08a1366cca86ba5092254c7a7f56/src/bamFile.ts#L386
        // @ts-expect-error private field!!
        id: bamRecord._id,
        name: bamRecord.get('name'),
        // @ts-expect-error private field!!
        start: +bamRecord.data.start,
        // @ts-expect-error private field!!
        end: +bamRecord.data.end,
        md: bamRecord.get('MD'),
        cigar: bamRecord.get('cigar'),
        mapq: bamRecord.get('mq'),
        strand: bamRecord.get('strand') === 1 ? '+' : '-'
    };
    return Object.assign(segment, { substitutions: getSubstitutions(segment, seq) });
};

type JsonBamRecord = ReturnType<typeof bamRecordToJson>;

class BamFile extends _BamFile {
    headerPromise: ReturnType<BamFile['getHeader']>;
    constructor(...args: ConstructorParameters<typeof _BamFile>) {
        super(...args);
        this.headerPromise = this.getHeader();
    }
    static fromUrl(url: string, indexUrl: string) {
        return new BamFile({
            bamFilehandle: new RemoteFile(url),
            baiFilehandle: new RemoteFile(indexUrl)
            // fetchSizeLimit: 500000000,
            // chunkSizeLimit: 100000000,
            // yieldThreadTime: 1000,
        });
    }

    async getJsonRecordsForRange(...args: Parameters<_BamFile['getRecordsForRange']>) {
        const records = await this.getRecordsForRange(...args);
        return records.map(bamRecordToJson);
    }
}

interface BamFileOptions {
    loadMates: boolean;
    maxInsertSize: number;
    extractJunction: boolean;
    junctionMinCoverage: number;
}

// indexed by dataset uuid
const dataSources: Map<string, DataSource<BamFile, BamFileOptions>> = new Map();
// indexed by bam url
const bamFileCache: Map<string, BamFile> = new Map();
const tileCache = new QuickLRU<string, JsonBamRecord[] | { error: string }>({ maxSize: 20 });

const init = async (
    uid: string,
    bam: { url: string; indexUrl: string },
    chromSizes: ChromSizes,
    options: Partial<BamFileOptions> = {}
) => {
    if (!bamFileCache.has(bam.url)) {
        const bamFile = BamFile.fromUrl(bam.url, bam.indexUrl);
        await bamFile.getHeader(); // reads bam/bai headers
        bamFileCache.set(bam.url, bamFile);
    }
    const bamFile = bamFileCache.get(bam.url)!;
    const dataSource = new DataSource(bamFile, chromSizes, {
        loadMates: false,
        maxInsertSize: 5000,
        extractJunction: false,
        junctionMinCoverage: 1,
        ...options
    });
    dataSources.set(uid, dataSource);
};

const tilesetInfo = (uid: string) => {
    return dataSources.get(uid)!.tilesetInfo;
};

function getGenomicRegions(
    tileCoord: { x: number; z: number },
    { chromInfo, tilesetInfo }: DataSource<BamFile, BamFileOptions>
) {
    const MAX_TILE_WIDTH = 200000;
    const tileWidth = +tilesetInfo.max_width / 2 ** tileCoord.z;

    if (tileWidth > MAX_TILE_WIDTH) {
        // this.errorTextText('Zoomed out too far for this track. Zoomin further to see reads');
        return [];
    }

    // get the bounds of the tile
    let minX = tilesetInfo.min_pos[0] + tileCoord.x * tileWidth;
    const maxX = tilesetInfo.min_pos[0] + (tileCoord.x + 1) * tileWidth;

    type RelativeRegion = {
        start: number;
        end: number;
    };

    const regions: [{ chr: string; pos: number }, RelativeRegion][] = [];

    for (const c of chromInfo.cumPositions) {
        const extent = c.pos + chromInfo.chromLengths[c.chr];

        // start of visible region
        if (!(c.pos <= maxX && minX < extent)) {
            continue;
        }

        if (maxX > extent) {
            // the visible region extends beyond the end of this chromosome
            // fetch from the start until the end of the chromosome
            const region = { start: minX - c.pos, end: extent - c.pos };
            regions.push([c, region]);

            // continue onto the next chromosome
            minX = extent;
        } else {
            // the end of the region is within this chromosome
            const region = { start: Math.floor(minX - c.pos), end: Math.ceil(maxX - c.pos) };
            regions.push([c, region]);

            // end the loop because we've retrieved the last chromosome
            break;
        }
    }

    return regions;
}

const tile = async (uid: string, z: number, x: number): Promise<JsonBamRecord[]> => {
    const tileCacheKey = `${uid}.${z}.${x}`;

    let data = tileCache.get(tileCacheKey);

    if (data) {
        return data as JsonBamRecord[];
    }

    const bam = dataSources.get(uid)!;
    if (!('max_width' in bam.tilesetInfo)) {
        throw new Error('tilesetInfo does not include `max_width`, which is required for the Gosling BamDataFetcher.');
    }

    const recordPromises = getGenomicRegions({ x, z }, bam).map(async ([c, region]) => {
        const records = await bam.file.getJsonRecordsForRange(c.chr, region.start, region.end, {
            viewAsPairs: bam.options.loadMates
            // TODO: Turning this on results in "too many requests error"
            // https://github.com/gosling-lang/gosling.js/pull/556
            // pairAcrossChr: typeof loadMates === 'undefined' ? false : loadMates,
        });
        return records.map(r => ({
            ...r,
            // increment start/end by offset
            start: r.start + 1 + c.pos,
            end: r.end + 1 + c.pos
        }));
    });
    data = (await Promise.all(recordPromises)).flat();
    tileCache.set(tileCacheKey, data);
    return data;
};

function parseTileIds(ids: string[]) {
    const parsed: [string, { z: number; x: number }][] = [];
    for (const id of ids) {
        const parts = id.split('.');
        const z = parseInt(parts[0], 10);
        const x = parseInt(parts[1], 10);
        if (Number.isNaN(z) || Number.isNaN(x)) {
            console.warn('Invalid tile zoom or position:', z, x);
            continue;
        }
        parsed.push([id, { z, x }]);
    }
    return parsed;
}

const fetchTilesDebounced = async (uid: string, tileIds: string[]) => {
    const promises = parseTileIds(tileIds).map(async ([id, { z, x }]) => {
        const result = await tile(uid, z, x);
        // tag each resuilt with the tileId
        const data = result.map(t => ({ ...t, tilePositionId: id }));
        return Promise.resolve([id, data] as const);
    });
    return Object.fromEntries(await Promise.all(promises));
};

const getTabularData = (uid: string, tileIds: string[]) => {
    const { options } = dataSources.get(uid)!;
    const allSegments: Record<string, Segment & { substitutions: string }> = {};

    for (const tileId of tileIds) {
        const tileValue = tileCache.get(`${uid}.${tileId}`);

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
    if (options.loadMates) {
        // TODO: avoid mutation?
        findMates(segments, options.maxInsertSize);
    }

    let output: Junction[] | SegmentWithMate[] | Segment[];
    if (options.extractJunction) {
        // Reference(ggsashimi): https://github.com/guigolab/ggsashimi/blob/d686d59b4e342b8f9dcd484f0af4831cc092e5de/ggsashimi.py#L136
        output = findJunctions(segments, options.junctionMinCoverage);
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

export type SegmentWithMate = Segment & {
    mateIds: string[];
    foundMate: boolean;
    insertSize: number;
    largeInsertSize: boolean;
    svType: string;
    numMates: number;
};

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

export type Junction = { start: number; end: number; score: number };

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
