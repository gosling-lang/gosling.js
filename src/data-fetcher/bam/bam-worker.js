// This worker is heavily based on https://github.com/higlass/higlass-pileup/blob/master/src/bam-fetcher-worker.js
import { text } from 'd3-request';
import { group } from 'd3-array';
import { bisector } from 'd3-array';
import { tsvParseRows } from 'd3-dsv';
import { color } from 'd3-color';
import { scaleLinear, scaleBand, scaleOrdinal, scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';
import { expose, Transfer } from 'threads/worker';
import { BamFile } from '@gmod/bam';
import LRU from 'lru-cache';
import Logging from '../../core/utils/log';

export function colorToRGBA(colorStr, opacity = 1) {
    let c = color(colorStr);

    if (!c) {
        c = color('gray');
    }

    return [c.rgb().r / 255.0, c.rgb().g / 255.0, c.rgb().b / 255.0, opacity];
}

export const PILEUP_COLORS = {
    BG: [0.89, 0.89, 0.89, 1], // gray for the read background
    BG2: [0.85, 0.85, 0.85, 1], // used as alternating color in the read counter band
    BG_MUTED: [0.92, 0.92, 0.92, 1], // covergae background, when it is not exact
    A: [0, 0, 1, 1], // blue for A
    C: [1, 0, 0, 1], // red for c
    G: [0, 1, 0, 1], // green for g
    T: [1, 1, 0, 1], // yellow for T
    S: [0, 0, 0, 0.5], // darker grey for soft clipping
    H: [0, 0, 0, 0.5], // darker grey for hard clipping
    X: [0, 0, 0, 0.7], // black for unknown
    I: [1, 0, 1, 0.5], // purple for insertions
    D: [1, 0.5, 0.5, 0.5], // pink-ish for deletions
    N: [1, 1, 1, 1],
    BLACK: [0, 0, 0, 1],
    BLACK_05: [0, 0, 0, 0.5],
    PLUS_STRAND: [0.75, 0.75, 1, 1],
    MINUS_STRAND: [1, 0.75, 0.75, 1]
};

export const PILEUP_COLOR_IXS = {};
Object.keys(PILEUP_COLORS).map((x, i) => {
    PILEUP_COLOR_IXS[x] = i;

    return null;
});

export const cigarTypeToText = type => {
    if (type === 'D') {
        return 'Deletion';
    } else if (type === 'S') {
        return 'Soft clipping';
    } else if (type === 'H') {
        return 'Hard clipping';
    } else if (type === 'I') {
        return 'Insertion';
    } else if (type === 'N') {
        return 'Skipped region';
    }

    return type;
};

export const parseMD = (mdString, useCounts) => {
    let currPos = 0;
    let currNum = 0;
    let deletionEncountered = false;
    let bamSeqShift = 0;
    const substitutions = [];

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
};

/**
 * Gets an array of all substitutions in the segment
 * @param  {String} segment  Current segment
 * @param  {String} seq   Read sequence from bam file.
 * @return {Array}  Substitutions.
 */
export const getSubstitutions = (segment, seq) => {
    let substitutions = [];
    let softClippingAtReadStart = null;

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
                pos: segment.to - segment.from,
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
                pos: segment.to - segment.from,
                length: lastSub.length,
                type: 'H'
            });
        }
    }

    if (segment.md) {
        const mdSubstitutions = parseMD(segment.md, false);

        mdSubstitutions.forEach(function (substitution) {
            let posStart = substitution['pos'] + substitution['bamSeqShift'];
            let posEnd = posStart + substitution['length'];
            // When there is soft clipping at the beginning,
            // we need to shift the position where we read the variant from the sequence
            // not necessary when there is hard clipping
            if (softClippingAtReadStart !== null) {
                posStart += softClippingAtReadStart.length;
                posEnd += softClippingAtReadStart.length;
            }
            substitution['variant'] = seq.substring(posStart, posEnd);
            delete substitution['bamSeqShift'];
        });

        substitutions = mdSubstitutions.concat(substitutions);
    }

    return substitutions;
};

/////////////////////////////////////////////////
/// ChromInfo
/////////////////////////////////////////////////

const chromInfoBisector = bisector(d => d.pos).left;

const groupBy = (xs, key) =>
    xs.reduce((rv, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});

const chrToAbs = (chrom, chromPos, chromInfo) => chromInfo.chrPositions[chrom].pos + chromPos;

const absToChr = (absPosition, chromInfo) => {
    if (!chromInfo || !chromInfo.cumPositions || !chromInfo.cumPositions.length) {
        return null;
    }

    let insertPoint = chromInfoBisector(chromInfo.cumPositions, absPosition);
    const lastChr = chromInfo.cumPositions[chromInfo.cumPositions.length - 1].chr;
    const lastLength = chromInfo.chromLengths[lastChr];

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

    return [chromInfo.cumPositions[insertPoint].chr, chrPosition, offset, insertPoint];
};

function natcmp(xRow, yRow) {
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

    const xParts = [];
    const yParts = [];

    for (const part of x.match(/(\d+|[^\d]+)/g)) {
        xParts.push(Number.isNaN(part) ? part.toLowerCase() : +part);
    }

    for (const part of y.match(/(\d+|[^\d]+)/g)) {
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

function parseChromsizesRows(data) {
    const cumValues = [];
    const chromLengths = {};
    const chrPositions = {};

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

function ChromosomeInfo(filepath, success) {
    const ret = {};

    ret.absToChr = absPos => (ret.chrPositions ? absToChr(absPos, ret) : null);

    ret.chrToAbs = ([chrName, chrPos] = []) => (ret.chrPositions ? chrToAbs(chrName, chrPos, ret) : null);

    return text(filepath, (error, chrInfoText) => {
        if (error) {
            // console.warn('Chromosome info not found at:', filepath);
            if (success) success(null);
        } else {
            const data = tsvParseRows(chrInfoText);
            const chromInfo = parseChromsizesRows(data);

            Object.keys(chromInfo).forEach(key => {
                ret[key] = chromInfo[key];
            });
            if (success) success(ret);
        }
    });
}

/////////////////////////////////////////////////////
/// End Chrominfo
/////////////////////////////////////////////////////

const bamRecordToJson = (bamRecord, chrName, chrOffset) => {
    const seq = bamRecord.get('seq');

    const segment = {
        id: bamRecord._id,
        from: +bamRecord.data.start + 1 + chrOffset,
        to: +bamRecord.data.end + 1 + chrOffset,
        md: bamRecord.get('MD'),
        chrName,
        chrOffset,
        cigar: bamRecord.get('cigar'),
        mapq: bamRecord.get('mq'),
        strand: bamRecord.get('strand') === 1 ? '+' : '-',
        row: null,
        substitutions: []
    };

    segment.substitutions = getSubstitutions(segment, seq);

    return segment;
};

// promises indexed by urls
const bamFiles = {};
const bamHeaders = {};

const MAX_TILES = 20;

// promises indexed by url
const chromSizes = {};
const chromInfos = {};
const tileValues = new LRU({ max: MAX_TILES });
const tilesetInfos = {};

// indexed by uuid
const dataConfs = {};

const init = (uid, bamUrl, baiUrl, chromSizesUrl) => {
    // TODO: Example URL
    // chromSizesUrl = `https://s3.amazonaws.com/gosling-lang.org/data/${'hg18'}.chrom.sizes`;
    chromSizesUrl = 'https://aveit.s3.amazonaws.com/higlass/data/sequence/hg38.mod.chrom.sizes';

    if (!bamFiles[bamUrl]) {
        bamFiles[bamUrl] = new BamFile({
            bamUrl,
            baiUrl
        });

        // we have to fetch the header before we can fetch data
        bamHeaders[bamUrl] = bamFiles[bamUrl].getHeader();
    }

    if (chromSizesUrl) {
        // if no chromsizes are passed in, we'll retrieve them
        // from the BAM file
        chromSizes[chromSizesUrl] =
            chromSizes[chromSizesUrl] ||
            new Promise(resolve => {
                ChromosomeInfo(chromSizesUrl, resolve);
            });
    }

    dataConfs[uid] = {
        bamUrl,
        chromSizesUrl
    };
};

const tilesetInfo = uid => {
    const { chromSizesUrl, bamUrl } = dataConfs[uid];
    const promises = chromSizesUrl ? [bamHeaders[bamUrl], chromSizes[chromSizesUrl]] : [bamHeaders[bamUrl]];

    return Promise.all(promises).then(values => {
        const TILE_SIZE = 1024;
        let chromInfo = null;

        if (values.length > 1) {
            // we've passed in a chromInfo file
            chromInfo = values[1];
        } else {
            // no chromInfo provided so we have to take it from the bam file index
            const chroms = [];
            for (const { refName, length } of bamFiles[bamUrl].indexToChr) {
                chroms.push([refName, length]);
            }

            chroms.sort(natcmp);

            chromInfo = parseChromsizesRows(chroms);
        }

        chromInfos[chromSizesUrl] = chromInfo;

        const retVal = {
            tile_size: TILE_SIZE,
            bins_per_dimension: TILE_SIZE,
            max_zoom: Math.ceil(Math.log(chromInfo.totalLength / TILE_SIZE) / Math.log(2)),
            max_width: chromInfo.totalLength,
            min_pos: [0],
            max_pos: [chromInfo.totalLength]
        };

        tilesetInfos[uid] = retVal;

        return retVal;
    });
};

const tile = async (uid, z, x) => {
    const MAX_TILE_WIDTH = 200000;
    const { bamUrl, chromSizesUrl } = dataConfs[uid];
    const bamFile = bamFiles[bamUrl];

    return tilesetInfo(uid).then(tsInfo => {
        const tileWidth = +tsInfo.max_width / 2 ** +z;
        const recordPromises = [];

        if (tileWidth > MAX_TILE_WIDTH) {
            // this.errorTextText('Zoomed out too far for this track. Zoomin further to see reads');
            return new Promise(resolve => resolve([]));
        }

        // get the bounds of the tile
        let minX = tsInfo.min_pos[0] + x * tileWidth;
        const maxX = tsInfo.min_pos[0] + (x + 1) * tileWidth;

        const chromInfo = chromInfos[chromSizesUrl];

        const { chromLengths, cumPositions } = chromInfo;

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
                            .getRecordsForRange(chromName, minX - chromStart, chromEnd - chromStart)
                            .then(records => {
                                const mappedRecords = records.map(rec =>
                                    bamRecordToJson(rec, chromName, cumPositions[i].pos)
                                );
                                tileValues.set(
                                    `${uid}.${z}.${x}`,
                                    tileValues.get(`${uid}.${z}.${x}`).concat(mappedRecords)
                                );
                            })
                    );

                    // continue onto the next chromosome
                    minX = chromEnd;
                } else {
                    const endPos = Math.ceil(maxX - chromStart);
                    const startPos = Math.floor(minX - chromStart);
                    // the end of the region is within this chromosome
                    recordPromises.push(
                        bamFile
                            .getRecordsForRange(chromName, startPos, endPos, {
                                // viewAsPairs: true,
                                // maxInsertSize: 2000,
                            })
                            .then(records => {
                                const mappedRecords = records.map(rec =>
                                    bamRecordToJson(rec, chromName, cumPositions[i].pos)
                                );

                                tileValues.set(
                                    `${uid}.${z}.${x}`,
                                    tileValues.get(`${uid}.${z}.${x}`).concat(mappedRecords)
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
    });
};

const fetchTilesDebounced = async (uid, tileIds) => {
    const tiles = {};

    const validTileIds = [];
    const tilePromises = [];

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
            tiles[validTileId] = d;
            tiles[validTileId].tilePositionId = validTileId;
        });
        return tiles;
    });
};

const getTabularData = (uid, tileIds) => {
    const allSegments = {};
    for (const tileId of tileIds) {
        const tileValue = tileValues.get(`${uid}.${tileId}`);

        if (tileValue.error) {
            throw new Error(tileValue.error);
        }

        for (const segment of tileValue) {
            allSegments[segment.id] = {
                ...segment,
                substitutions: JSON.stringify(segment.substitutions)
            };
        }
    }

    const segmentList = Object.values(allSegments);
    const buffer = Buffer.from(JSON.stringify(segmentList)).buffer;
    return Transfer(buffer, [buffer]);
};

function getValueUsingChannel(datum, channel) {
    if (channel && channel.field) {
        return datum[channel.field];
    }
    return undefined;
}

function visualPropertyByChannel(spec, scales, channelKey, datum) {
    const value = datum !== undefined ? getValueUsingChannel(datum, spec[channelKey]) : undefined; // Is this safe enough?
    return encodedValue(spec, scales, channelKey, value);
}

function IsChannelDeep(channel) {
    return typeof channel === 'object' && !('value' in channel);
}

function IsChannelValue(channel) {
    return channel !== null && typeof channel === 'object' && 'value' in channel;
}

const SUPPORTED_CHANNELS = [
    'x',
    'xe',
    'x1',
    'x1e',

    'y',
    'ye',
    'y1',
    'y1e',

    'color',
    'size',
    'row',
    'stroke',
    'strokeWidth',
    'opacity',
    'text'
    // ...
];

function generateScales(spec) {
    const channelScales = {};
    // const spec = this.spec();

    /// DEBUG
    // console.log(spec);
    //

    SUPPORTED_CHANNELS.forEach(channelKey => {
        const channel = spec[channelKey];

        if (IsChannelValue(channel)) {
            channelScales[channelKey] = () => channel.value;
        } else if (IsChannelDeep(channel)) {
            if (channelKey === 'text') {
                // We do not generate scales for 'text' marks.
                return;
            }

            const domain = channel.domain;
            const range = channel.range;

            if (domain === undefined || range === undefined) {
                // we do not have sufficient info to generate scales
                return;
            }

            if (channel.type === 'quantitative' || channel.type === 'genomic') {
                switch (channelKey) {
                    case 'x':
                    case 'x1':
                    case 'xe':
                    case 'x1e':
                    case 'y':
                    case 'size':
                    case 'opacity':
                    case 'strokeWidth':
                        channelScales[channelKey] = scaleLinear().domain(domain).range(range);
                        break;
                    case 'color':
                    case 'stroke':
                        const interpolate = interpolateViridis;
                        channelScales[channelKey] = scaleSequential(interpolate).domain(channel.domain);
                        break;
                    default:
                        break;
                    // console.warn('Not supported channel for calculating scales');
                }
            } else if (channel.type === 'nominal') {
                switch (channelKey) {
                    case 'x':
                    case 'xe':
                    case 'y':
                    case 'row':
                        channelScales[channelKey] = scaleBand().domain(domain).range(range);
                        break;
                    case 'size':
                        channelScales[channelKey] = scaleOrdinal().domain(domain).range(range);
                        break;
                    case 'color':
                    case 'stroke':
                        channelScales[channelKey] = scaleOrdinal(range).domain(domain);
                        break;
                    default:
                        break;
                    // console.warn('Not supported channel for calculating scales');
                }
            }
        }
    });
    return channelScales;
}

function encodedValue(spec, scales, channelKey, value) {
    // return scales[channelKey] && typeof scales[channelKey] === 'function' ? scales[channelKey](value) : undefined;

    if (channelKey === 'text' && value !== undefined) {
        return `${+value ? ~~value : value}`;
        // TODO: Better formatting?
        // return `${+value ? (+value - ~~value) > 0 ? (+value).toExponential(1) : ~~value : value}`;
    }

    const channel = spec[channelKey];
    const channelFieldType = IsChannelDeep(channel) ? channel.type : IsChannelValue(channel) ? 'constant' : undefined;

    if (!channelFieldType) {
        // Shouldn't be reached. Channel should be either encoded with data or a constant value.
        return undefined;
    }

    if (channelFieldType === 'constant') {
        // Just return the constant value.
        return channel.value;
    }

    if (value === undefined) {
        // Value is undefined, so returning undefined.
        return undefined;
    }

    // if (typeof channelScales[channelKey] !== 'function') {
    //     // Scale is undefined, so returning undefined.
    //     return undefined;
    // }

    // The type of a channel scale is determined by a { channel type, field type } pair
    switch (channelKey) {
        case 'x':
        case 'y':
        case 'x1':
        case 'y1':
        case 'xe':
        case 'ye':
        case 'x1e':
            if (channelFieldType === 'quantitative' || channelFieldType === 'genomic') {
                // return scaleLinear().domain(channel.domain).range(channel.range)(value);
                return scales[channelKey](value);
            }
            if (channelFieldType === 'nominal') {
                // return scaleBand().domain(channel.domain).range(channel.range)(value);
                return scales[channelKey](value);
            }
            break;
        case 'color':
        case 'stroke':
            if (channelFieldType === 'quantitative') {
                // let interpolate = interpolateViridis;
                // return scaleSequential(interpolate).domain(channel.domain)(value);
                return scales[channelKey](value);
            }
            if (channelFieldType === 'nominal') {
                // return scaleOrdinal().domain(channel.domain).range(channel.range)(value);
                return scales[channelKey](value);
            }
            /* genomic is not supported */
            break;
        case 'size':
            if (channelFieldType === 'quantitative') {
                // return scaleLinear().domain(channel.domain).range(channel.range)(value);
                return scales[channelKey](value);
            }
            if (channelFieldType === 'nominal') {
                // return scaleOrdinal().domain(channel.domain).range(channel.range)(value);
                return scales[channelKey](value);
            }
            /* genomic is not supported */
            break;
        case 'row':
            /* quantitative is not supported */
            if (channelFieldType === 'nominal') {
                // return scaleBand().domain(channel.domain).range(channel.range)(value);
                return scales[channelKey](value);
            }
            /* genomic is not supported */
            break;
        case 'strokeWidth':
        case 'opacity':
            if (channelFieldType === 'quantitative') {
                // return scaleLinear().domain(channel.domain).range(channel.range)(value);
                return scales[channelKey](value);
            }
            /* nominal is not supported */
            /* genomic is not supported */
            break;
        default:
            console.warn(`${channelKey} is not supported for encoding values, so returning a undefined value`);
            return undefined;
    }
}

/**
 * Retrieve an encoded visual property of a visual mark.
 */
function encodedPIXIProperty(spec, scales, propertyKey, datum, additionalInfo) {
    const mark = spec.mark;

    // if (!IsShallowMark(mark)) {
    //     // we do not consider deep marks, yet
    //     return undefined;
    // }

    // common visual properties, not specific to visual marks
    if (
        ['text', 'color', 'row', 'stroke', 'opacity', 'strokeWidth', 'x', 'y', 'xe', 'x1', 'x1e', 'size'].includes(
            propertyKey
        )
    ) {
        return visualPropertyByChannel(spec, scales, propertyKey, datum);
    }

    switch (mark) {
        case 'bar':
            return barProperty(spec, scales, propertyKey, datum, additionalInfo);
        case 'point':
        case 'text':
            // return pointProperty(this, propertyKey, datum);
            return undefined;
        case 'rect':
            return rectProperty(spec, scales, propertyKey, datum, additionalInfo);
        default:
            // Mark type that is not supported yet
            return undefined;
    }
}

function rectProperty(spec, scales, propertyKey, datum, additionalInfo) {
    switch (propertyKey) {
        case 'width':
            const width =
                // (1) size
                visualPropertyByChannel(spec, scales, 'xe', datum)
                    ? visualPropertyByChannel(spec, scales, 'xe', datum) -
                      visualPropertyByChannel(spec, scales, 'x', datum)
                    : additionalInfo.markWidth; // (2) unit mark height
            return width === 0 ? 0.1 : width; // TODO: not sure if this is necessary for all cases. Perhaps, we can have an option.
        case 'height':
            return (
                // (1) size
                visualPropertyByChannel(spec, scales, 'size', datum) || additionalInfo.markHeight
                // (2) unit mark height
            );
        default:
            return undefined;
    }
}

export function barProperty(spec, scales, propertyKey, datum, additionalInfo) {
    const x = visualPropertyByChannel(spec, scales, 'x', datum);
    const xe = visualPropertyByChannel(spec, scales, 'xe', datum);
    const size = visualPropertyByChannel(spec, scales, 'size', datum);
    switch (propertyKey) {
        case 'width':
            return size || (xe ? xe - x : additionalInfo.tileUnitWidth);
        case 'x-start':
            if (!additionalInfo.markWidth) {
                // `markWidth` is required
                return undefined;
            }
            return xe ? (x + xe - additionalInfo.markWidth) / 2.0 : x - additionalInfo.markWidth / 2.0;
        default:
            return undefined;
    }
}

function getChannelDomainArray(spec, channelKey) {
    const c = spec[channelKey];
    return c && c.domain ? c.domain : undefined;
}

const rectProperties = (spec, data, trackWidth, trackHeight, tileSize, xDomain, xRange, tileX, tileWidth) => {
    /* track spec */
    // const spec = model.spec();

    /* data */
    // const data = model.data();

    /* track size */
    // const trackWidth = trackInfo.dimensions[0];
    // const trackHeight = trackInfo.dimensions[1];
    // const tileSize = trackInfo.tilesetInfo.tile_size;

    /* circular parameters */
    const circular = spec.layout === 'circular';

    if (spec.x) {
        spec.x.domain = xDomain;
        spec.x.range = xRange;
    }
    if (spec.xe) {
        spec.xe.domain = xDomain;
        spec.xe.range = xRange;
    }

    const scales = generateScales(spec);

    /* genomic scale */
    const xScale = scaleLinear().domain(xDomain).range(xRange);
    const tileUnitWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories = getChannelDomainArray(spec, 'row') || ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    // TODO: what if quantitative Y field is used?
    const yCategories = getChannelDomainArray(spec, 'y') || ['___SINGLE_Y_POSITION___'];
    const cellHeight = rowHeight / yCategories.length;

    const visualProperties = [];
    const positions = [];
    const ixs = [];
    const colorIdx = [];
    const colorRGBAs = []; // [[1, 0, 0, 1], ...]

    /* Properties */
    data.forEach(d => {
        const rowPosition = encodedPIXIProperty(spec, scales, 'row', d);
        const rowPadding = spec.row.padding || 0;
        const x = encodedPIXIProperty(spec, scales, 'x', d);
        const color = encodedPIXIProperty(spec, scales, 'color', d);
        const stroke = encodedPIXIProperty(spec, scales, 'stroke', d);
        const strokeWidth = encodedPIXIProperty(spec, scales, 'strokeWidth', d);
        const opacity = encodedPIXIProperty(spec, scales, 'opacity', d);
        const rectWidth = encodedPIXIProperty(spec, scales, 'width', d, { markWidth: tileUnitWidth });
        const rectHeight = encodedPIXIProperty(spec, scales, 'height', d, { markHeight: cellHeight });
        const y = encodedPIXIProperty(spec, scales, 'y', d) - rectHeight / 2.0; // It is top posiiton now

        const alphaTransition = 1;
        // model.markVisibility(d, {
        //     width: rectWidth,
        //     zoomLevel: xScale.invert(trackWidth) - xScale.invert(0)
        // });
        const actualOpacity = Math.min(alphaTransition, opacity);

        if (actualOpacity === 0 || rectHeight === 0 || rectWidth <= 0.0001) {
            // No need to draw invisible objects
            // return;
        }

        const xs = x;
        const xe = x + rectWidth;
        const ys = rowPosition + y + rowPadding;
        const ye = ys + rectHeight - rowPadding;
        // y = y + rectHeight / 2.0;

        if (circular) {
            // Do not support circular layouts yet
        } else {
            // Stroke
            if (strokeWidth !== 0) {
                const rgba = colorToRGBA(stroke, actualOpacity);
                let cidx = colorRGBAs.map(d => d.join()).indexOf(rgba.join());
                if (cidx === -1) {
                    colorRGBAs.push(rgba);
                    cidx = colorRGBAs.length - 1;
                }

                // LT
                positions.push(xs, ys);
                const LTI = positions.length / 2.0 - 1;

                // RT
                positions.push(xe, ys);
                const RTI = positions.length / 2.0 - 1;

                // LB
                positions.push(xs, ye);
                const LBI = positions.length / 2.0 - 1;

                // RB
                positions.push(xe, ye);
                const RBI = positions.length / 2.0 - 1;

                ixs.push(LTI, RTI, LBI, LBI, RBI, RTI);
                colorIdx.push(cidx, cidx, cidx, cidx);
            }

            const rgba = colorToRGBA(color, actualOpacity);
            let cidx = colorRGBAs.map(d => d.join()).indexOf(rgba.join());
            if (cidx === -1) {
                colorRGBAs.push(rgba);
                cidx = colorRGBAs.length - 1;
            }

            // LT
            positions.push(xs + strokeWidth, ys + strokeWidth);
            const LTI = positions.length / 2.0 - 1;

            // RT
            positions.push(xe - strokeWidth, ys + strokeWidth);
            const RTI = positions.length / 2.0 - 1;

            // LB
            positions.push(xs + strokeWidth, ye - strokeWidth);
            const LBI = positions.length / 2.0 - 1;

            // RB
            positions.push(xe - strokeWidth, ye - strokeWidth);
            const RBI = positions.length / 2.0 - 1;

            ixs.push(LTI, RTI, LBI, LBI, RBI, RTI);
            colorIdx.push(cidx, cidx, cidx, cidx);

            // visualProperties.push({ xs, xe, ys, ye, color, stroke, strokeWidth, opacity });
        }
    });
    // const buffer = Buffer.from(JSON.stringify(visualProperties)).buffer;
    // return Transfer(buffer, [buffer]);

    const buffer = Buffer.from(JSON.stringify({ positions, ixs, colorIdx, colorRGBAs })).buffer;
    return Transfer(buffer, [buffer]);
};

function getGenomicChannel(spec) {
    return getGenomicChannelFromTrack(spec);
}

function getGenomicChannelFromTrack(track) {
    // we do not support using two genomic coordinates yet
    let genomicChannel = undefined;
    ['x', 'y', 'xe', 'ye', 'x1', 'y1', 'x1e', 'y1e'].reverse().forEach(channelType => {
        const channel = track[channelType];
        if (IsChannelDeep(channel) && channel.type === 'genomic') {
            genomicChannel = channel;
        }
    });
    return genomicChannel;
}

function IsStackedMark(track) {
    return (
        (track.mark === 'bar' || track.mark === 'area' || track.mark === 'text') &&
        IsChannelDeep(track.color) &&
        track.color.type === 'nominal' &&
        (!track.row || IsChannelValue(track.row)) &&
        // TODO: determine whether to use stacked bar for nominal fields or not
        IsChannelDeep(track.y) &&
        track.y.type === 'quantitative'
    );
}

const barProperties = (spec, data, trackWidth, trackHeight, tileSize, xDomain, xRange, tileX, tileWidth) => {
    /* track spec */
    // const spec = model.spec();

    // if (!spec.width || !spec.height) {
    //     console.warn('Size of a track is not properly determined, so visual mark cannot be rendered');
    //     return;
    // }

    if (spec.x) {
        spec.x.domain = xDomain;
        spec.x.range = xRange;
    }
    if (spec.xe) {
        spec.xe.domain = xDomain;
        spec.xe.range = xRange;
    }
    const scales = generateScales(spec);
    /* data */
    // const data = model.data();

    /* track size */
    // const trackWidth = spec.width;
    // const trackHeight = spec.height;
    // const tileSize = trackInfo.tilesetInfo.tile_size;
    // const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(tile.gos.zoomLevel, tile.gos.tilePos, tileSize);
    const xScale = scaleLinear().domain(xDomain).range(xRange);
    const zoomLevel = xScale.invert(trackWidth) - xScale.invert(0);

    /* circular parameters */
    const circular = spec.layout === 'circular';
    const trackInnerRadius = spec.innerRadius || 220;
    const trackOuterRadius = spec.outerRadius || 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle || 0;
    const endAngle = spec.endAngle || 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    /* genomic scale */
    // const xScale = model.getChannelScale('x');
    const tileUnitWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories = getChannelDomainArray(spec, 'row') || ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* baseline */
    const baselineValue = IsChannelDeep(spec.y) ? spec.y.baseline : undefined;
    const baselineY = encodedValue(spec, scales, 'y', baselineValue) || 0;

    const visualProperties = [];
    const positions = [];
    const ixs = [];
    const colorIdx = [];
    const colorRGBAs = []; // [[1, 0, 0, 1], ...]

    /* render */
    const g = tile.graphics;
    if (IsStackedMark(spec)) {
        // TODO: many parts in this scope are identical to the below `else` statement, so encaptulate this?
        // const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics(); // only one row for stacked marks

        const genomicChannel = getGenomicChannel(spec);
        if (!genomicChannel || !genomicChannel.field) {
            console.warn('Genomic field is not provided in the specification');
            return;
        }
        const pivotedData = group(data, d => d[genomicChannel.field]);
        const xKeys = [...pivotedData.keys()];

        // TODO: users may want to align rows by values
        xKeys.forEach(k => {
            let prevYEnd = 0;
            pivotedData.get(k).forEach(d => {
                const color = encodedPIXIProperty(spec, scales, 'color', d);
                const stroke = encodedPIXIProperty(spec, scales, 'stroke', d);
                const strokeWidth = encodedPIXIProperty(spec, scales, 'strokeWidth', d);
                const opacity = encodedPIXIProperty(spec, scales, 'opacity', d);
                const y = encodedPIXIProperty(spec, scales, 'y', d);

                const barWidth = encodedPIXIProperty(spec, scales, 'width', d, { tileUnitWidth });
                const barStartX = encodedPIXIProperty(spec, scales, 'x-start', d, { markWidth: barWidth });

                const alphaTransition = 1; //model.markVisibility(d, { width: barWidth, zoomLevel });
                const actualOpacity = Math.min(alphaTransition, opacity);

                if (actualOpacity === 0 || barWidth <= 0 || y <= 0) {
                    // do not draw invisible marks
                    // return;
                }

                const xs = barStartX;
                const xe = barStartX + barWidth;
                const ys = rowHeight - y - prevYEnd;
                const ye = rowHeight - prevYEnd;
                // y = (ye + ys) / 2.0;

                // g.lineStyle(
                //     strokeWidth,
                //     colorToHex(stroke),
                //     actualOpacity,
                //     0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                // );

                if (circular) {
                    // do not support yet
                } else {
                    // g.beginFill(colorToHex(color), actualOpacity);
                    // g.drawRect(barStartX, rowHeight - y - prevYEnd, barWidth, y);

                    // Stroke
                    if (strokeWidth !== 0) {
                        const rgba = colorToRGBA(stroke, actualOpacity);
                        let cidx = colorRGBAs.map(d => d.join()).indexOf(rgba.join());
                        if (cidx === -1) {
                            colorRGBAs.push(rgba);
                            cidx = colorRGBAs.length - 1;
                        }

                        // LT
                        positions.push(xs, ys);
                        const LTI = positions.length / 2.0 - 1;

                        // RT
                        positions.push(xe, ys);
                        const RTI = positions.length / 2.0 - 1;

                        // LB
                        positions.push(xs, ye);
                        const LBI = positions.length / 2.0 - 1;

                        // RB
                        positions.push(xe, ye);
                        const RBI = positions.length / 2.0 - 1;

                        ixs.push(LTI, RTI, LBI, LBI, RBI, RTI);
                        colorIdx.push(cidx, cidx, cidx, cidx);
                    }

                    const rgba = colorToRGBA(color, actualOpacity);
                    let cidx = colorRGBAs.map(d => d.join()).indexOf(rgba.join());
                    if (cidx === -1) {
                        colorRGBAs.push(rgba);
                        cidx = colorRGBAs.length - 1;
                    }

                    // LT
                    positions.push(xs + strokeWidth, ys + strokeWidth);
                    const LTI = positions.length / 2.0 - 1;

                    // RT
                    positions.push(xe - strokeWidth, ys + strokeWidth);
                    const RTI = positions.length / 2.0 - 1;

                    // LB
                    positions.push(xs + strokeWidth, ye - strokeWidth);
                    const LBI = positions.length / 2.0 - 1;

                    // RB
                    positions.push(xe - strokeWidth, ye - strokeWidth);
                    const RBI = positions.length / 2.0 - 1;

                    ixs.push(LTI, RTI, LBI, LBI, RBI, RTI);
                    colorIdx.push(cidx, cidx, cidx, cidx);
                }

                prevYEnd += y;
            });
        });
    } else {
        data.forEach(d => {
            const rowPosition = encodedPIXIProperty(spec, scales, 'row');
            const color = encodedPIXIProperty(spec, scales, 'color', d);
            const stroke = encodedPIXIProperty(spec, scales, 'stroke', d);
            const strokeWidth = encodedPIXIProperty(spec, scales, 'strokeWidth', d);
            const opacity = encodedPIXIProperty(spec, scales, 'opacity');
            let y = encodedPIXIProperty(spec, scales, 'y', d); // TODO: we could even retrieve a actual y position of bars

            const barWidth = encodedPIXIProperty(spec, scales, 'width', d, { tileUnitWidth });
            const barStartX = encodedPIXIProperty(spec, scales, 'x-start', d, { markWidth: barWidth });
            const barHeight = y - baselineY;

            const alphaTransition = 1; //model.markVisibility(d, { width: barWidth, zoomLevel });
            const actualOpacity = Math.min(alphaTransition, opacity);

            if (actualOpacity === 0 || barWidth === 0 || y === 0) {
                // do not draw invisible marks
                // return;
            }

            const xs = barStartX;
            const xe = barStartX + barWidth;
            const ys = rowPosition + rowHeight - barHeight - baselineY;
            const ye = rowPosition + rowHeight - baselineY;
            y = (ye + ys) / 2.0;

            // g.lineStyle(
            //     strokeWidth,
            //     colorToHex(stroke),
            //     actualOpacity,
            //     0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            // );

            if (circular) {
                // do not support yet
            } else {
                // g.beginFill(colorToHex(color), actualOpacity);
                // g.drawRect(barStartX, rowPosition + rowHeight - barHeight - baselineY, barWidth, barHeight);

                // Stroke
                if (strokeWidth !== 0) {
                    const rgba = colorToRGBA(stroke, actualOpacity);
                    let cidx = colorRGBAs.map(d => d.join()).indexOf(rgba.join());
                    if (cidx === -1) {
                        colorRGBAs.push(rgba);
                        cidx = colorRGBAs.length - 1;
                    }

                    // LT
                    positions.push(xs, ys);
                    const LTI = positions.length / 2.0 - 1;

                    // RT
                    positions.push(xe, ys);
                    const RTI = positions.length / 2.0 - 1;

                    // LB
                    positions.push(xs, ye);
                    const LBI = positions.length / 2.0 - 1;

                    // RB
                    positions.push(xe, ye);
                    const RBI = positions.length / 2.0 - 1;

                    ixs.push(LTI, RTI, LBI, LBI, RBI, RTI);
                    colorIdx.push(cidx, cidx, cidx, cidx);
                }

                const rgba = colorToRGBA(color, actualOpacity);
                let cidx = colorRGBAs.map(d => d.join()).indexOf(rgba.join());
                if (cidx === -1) {
                    colorRGBAs.push(rgba);
                    cidx = colorRGBAs.length - 1;
                }

                // console.log(xs + strokeWidth);
                // LT
                positions.push(xs + strokeWidth, ys + strokeWidth);
                const LTI = positions.length / 2.0 - 1;

                // RT
                positions.push(xe - strokeWidth, ys + strokeWidth);
                const RTI = positions.length / 2.0 - 1;

                // LB
                positions.push(xs + strokeWidth, ye - strokeWidth);
                const LBI = positions.length / 2.0 - 1;

                // RB
                positions.push(xe - strokeWidth, ye - strokeWidth);
                const RBI = positions.length / 2.0 - 1;

                ixs.push(LTI, RTI, LBI, LBI, RBI, RTI);
                colorIdx.push(cidx, cidx, cidx, cidx);
            }
        });
    }
    // const buffer = Buffer.from(JSON.stringify(visualProperties)).buffer;
    // return Transfer(buffer, [buffer]);
    // console.log(positions, ixs, colorIdx, colorRGBAs);

    const buffer = Buffer.from(JSON.stringify({ positions, ixs, colorIdx, colorRGBAs })).buffer;
    return Transfer(buffer, [buffer]);
};

const visualProperties = (spec, data, trackWidth, trackHeight, tileSize, xDomain, xRange, tileX, tileWidth) => {
    Logging.recordTime('visualProperties');

    let result;
    if (spec.mark === 'rect') {
        result = rectProperties(spec, data, trackWidth, trackHeight, tileSize, xDomain, xRange, tileX, tileWidth);
    } else if (spec.mark === 'bar') {
        result = barProperties(spec, data, trackWidth, trackHeight, tileSize, xDomain, xRange, tileX, tileWidth);
    }

    Logging.printTime('visualProperties');
    return result;
};

const tileFunctions = {
    init,
    tilesetInfo,
    fetchTilesDebounced,
    tile,
    getTabularData,
    visualProperties
};

expose(tileFunctions);
