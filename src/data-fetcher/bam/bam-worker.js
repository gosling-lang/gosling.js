import { text } from 'd3-request';
import { bisector, range } from 'd3-array';
import { tsvParseRows } from 'd3-dsv';
import { scaleLinear, scaleBand } from 'd3-scale';
import { expose, Transfer } from 'threads/worker';
import { BamFile } from '@gmod/bam';
import LRU from 'lru-cache';

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

const serverInfos = {};

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

const getCoverage = (segmentList, samplingDistance) => {
    const coverage = {};
    let maxCoverage = 0;

    for (let j = 0; j < segmentList.length; j++) {
        const from = segmentList[j].from;
        const to = segmentList[j].to;
        // Find the first position that is in the sampling set
        const firstFrom = from - (from % samplingDistance) + samplingDistance;

        for (let i = firstFrom; i < to; i = i + samplingDistance) {
            if (!coverage[i]) {
                coverage[i] = {
                    reads: 0,
                    matches: 0,
                    variants: {
                        A: 0,
                        C: 0,
                        G: 0,
                        T: 0,
                        N: 0
                    }
                };
            }
            coverage[i].reads++;
            coverage[i].matches++;
            maxCoverage = Math.max(maxCoverage, coverage[i].reads);
        }

        segmentList[j].substitutions.forEach(substitution => {
            if (substitution.variant) {
                const posSub = from + substitution.pos;
                if (!coverage[posSub]) {
                    return;
                }
                coverage[posSub].matches--;
                if (!coverage[posSub]['variants'][substitution.variant]) {
                    coverage[posSub]['variants'][substitution.variant] = 0;
                }
                coverage[posSub]['variants'][substitution.variant]++;
            }
        });
    }

    return {
        coverage: coverage,
        maxCoverage: maxCoverage
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

///////////////////////////////////////////////////
/// Render Functions
///////////////////////////////////////////////////

// See segmentsToRows concerning the role of occupiedSpaceInRows
function assignSegmentToRow(segment, occupiedSpaceInRows, padding) {
    const segmentFromWithPadding = segment.from - padding;
    const segmentToWithPadding = segment.to + padding;

    // no row has been assigned - find a suitable row and update the occupied space
    if (segment.row === null || segment.row === undefined) {
        // Go through each row and look if there is space for the segment
        for (let i = 0; i < occupiedSpaceInRows.length; i++) {
            if (!occupiedSpaceInRows[i]) {
                return;
            }
            const rowSpaceFrom = occupiedSpaceInRows[i].from;
            const rowSpaceTo = occupiedSpaceInRows[i].to;
            if (segmentToWithPadding < rowSpaceFrom) {
                segment.row = i;
                occupiedSpaceInRows[i] = {
                    from: segmentFromWithPadding,
                    to: rowSpaceTo
                };
                return;
            } else if (segmentFromWithPadding > rowSpaceTo) {
                segment.row = i;
                occupiedSpaceInRows[i] = {
                    from: rowSpaceFrom,
                    to: segmentToWithPadding
                };
                return;
            }
        }
        // There is no space in the existing rows, so add a new one.
        segment.row = occupiedSpaceInRows.length;
        occupiedSpaceInRows.push({
            from: segmentFromWithPadding,
            to: segmentToWithPadding
        });
    }
    // segment already has a row - just update the occupied space
    else {
        const assignedRow = segment.row;
        if (occupiedSpaceInRows[assignedRow]) {
            const rowSpaceFrom = occupiedSpaceInRows[assignedRow].from;
            const rowSpaceTo = occupiedSpaceInRows[assignedRow].to;
            occupiedSpaceInRows[assignedRow] = {
                from: Math.min(segmentFromWithPadding, rowSpaceFrom),
                to: Math.max(segmentToWithPadding, rowSpaceTo)
            };
        } else {
            occupiedSpaceInRows[assignedRow] = {
                from: segmentFromWithPadding,
                to: segmentToWithPadding
            };
        }
    }
}

function segmentsToRows(segments, optionsIn) {
    const { prevRows, padding } = Object.assign({ prevRows: [], padding: 5 }, optionsIn || {});

    // The following array contains elements fo the form
    // occupiedSpaceInRows[i] = {from: 100, to: 110}
    // This means that in row i, the space from 100 to 110 is occupied and reads cannot be placed there
    // This array is updated with every segment that is added to the scene
    const occupiedSpaceInRows = [];
    const segmentIds = new Set(segments.map(x => x.id));

    // We only need those previous segments, that are in the current segments list
    const prevSegments = prevRows.flat().filter(segment => segmentIds.has(segment.id));

    for (let i = 0; i < prevSegments.length; i++) {
        // prevSegments contains already assigned segments. The function below therefore just
        // builds the occupiedSpaceInRows array. For this, prevSegments does not need to be sorted
        assignSegmentToRow(prevSegments[i], occupiedSpaceInRows, padding);
    }

    const prevSegmentIds = new Set(prevSegments.map(x => x.id));

    let newSegments = [];
    // We need to assign rows only to those segments, that are not in the prevSegments list
    const filteredSegments = segments.filter(x => !prevSegmentIds.has(x.id));

    if (prevSegments.length === 0) {
        filteredSegments.sort((a, b) => a.from - b.from);
        filteredSegments.forEach(segment => {
            assignSegmentToRow(segment, occupiedSpaceInRows, padding);
        });
        newSegments = filteredSegments;
    } else {
        // We subdivide the segments into those that are left/right of the existing previous segments
        // Note that prevSegments is sorted
        const cutoff = (prevSegments[0].from + prevSegments[prevSegments.length - 1].to) / 2;
        const newSegmentsLeft = filteredSegments.filter(x => x.from <= cutoff);
        // The sort order for new segments that are appended left is reversed
        newSegmentsLeft.sort((a, b) => b.from - a.from);
        newSegmentsLeft.forEach(segment => {
            assignSegmentToRow(segment, occupiedSpaceInRows, padding);
        });

        const newSegmentsRight = filteredSegments.filter(x => x.from > cutoff);
        newSegmentsRight.sort((a, b) => a.from - b.from);
        newSegmentsRight.forEach(segment => {
            assignSegmentToRow(segment, occupiedSpaceInRows, padding);
        });

        newSegments = newSegmentsLeft.concat(prevSegments, newSegmentsRight);
    }

    const outputRows = [];
    for (let i = 0; i < occupiedSpaceInRows.length; i++) {
        outputRows[i] = newSegments.filter(x => x.row === i);
    }

    return outputRows;
}

const STARTING_POSITIONS_ARRAY_LENGTH = 2 ** 20;
const STARTING_COLORS_ARRAY_LENGTH = 2 ** 21;
const STARTING_INDEXES_LENGTH = 2 ** 21;

let allPositionsLength = STARTING_POSITIONS_ARRAY_LENGTH;
let allColorsLength = STARTING_COLORS_ARRAY_LENGTH;
let allIndexesLength = STARTING_INDEXES_LENGTH;

let allPositions = new Float32Array(allPositionsLength);
let allColors = new Float32Array(allColorsLength);
let allIndexes = new Int32Array(allIndexesLength);

function currTime() {
    const d = new Date();
    return d.getTime();
}

const getTabularData = (uid, tileIds) => {
    const allSegments = {};
    for (const tileId of tileIds) {
        const tileValue = tileValues.get(`${uid}.${tileId}`);

        if (tileValue.error) {
            throw new Error(tileValue.error);
        }

        for (const segment of tileValue) {
            allSegments[segment.id] = segment;
        }
    }

    const t1 = currTime();
    const segmentList = Object.values(allSegments);
    const buffer = Buffer.from(JSON.stringify(segmentList)).buffer;
    const t2 = currTime();
    // console.log('renderSegments time:', t2 - t1, 'ms');
    return Transfer(buffer, [buffer]);
};

const renderSegments = (uid, tileIds, domain, scaleRange, position, dimensions, prevRows, trackOptions) => {
    const t1 = currTime();
    const allSegments = {};
    let allReadCounts = {};
    let coverageSamplingDistance;

    for (const tileId of tileIds) {
        const tileValue = tileValues.get(`${uid}.${tileId}`);

        if (tileValue.error) {
            throw new Error(tileValue.error);
        }

        for (const segment of tileValue) {
            allSegments[segment.id] = segment;
        }
    }

    const segmentList = Object.values(allSegments);

    let [minPos, maxPos] = [Number.MAX_VALUE, -Number.MAX_VALUE];

    for (let i = 0; i < segmentList.length; i++) {
        if (segmentList[i].from < minPos) {
            minPos = segmentList[i].from;
        }

        if (segmentList[i].to > maxPos) {
            maxPos = segmentList[i].to;
        }
    }
    let grouped = null;

    // group by some attribute or don't, e.g., strand
    if (groupBy) {
        let groupByOption = trackOptions && trackOptions.groupBy;
        groupByOption = groupByOption ? groupByOption : null;
        grouped = groupBy(segmentList, groupByOption);
    } else {
        grouped = { null: segmentList };
    }

    // calculate the the rows of reads for each group
    for (const key of Object.keys(grouped)) {
        grouped[key].rows = segmentsToRows(grouped[key], {
            prevRows: (prevRows[key] && prevRows[key].rows) || []
        });
    }

    // calculate the height of each group
    const totalRows = Object.values(grouped)
        .map(x => x.rows.length)
        .reduce((a, b) => a + b, 0);
    let currStart = trackOptions.showCoverage ? trackOptions.coverageHeight : 0;

    // const d = range(0, rows.length);
    const yGlobalScale = scaleBand()
        .domain(range(0, totalRows + currStart))
        .range([0, dimensions[1]])
        .paddingInner(0.2);

    let currPosition = 0;
    let currColor = 0;
    let currIdx = 0;

    const addPosition = (x1, y1) => {
        if (currPosition > allPositionsLength - 2) {
            allPositionsLength *= 2;
            const prevAllPositions = allPositions;

            allPositions = new Float32Array(allPositionsLength);
            allPositions.set(prevAllPositions);
        }
        allPositions[currPosition++] = x1;
        allPositions[currPosition++] = y1;

        return currPosition / 2 - 1;
    };

    const addColor = (colorIdx, n) => {
        if (currColor >= allColorsLength - n) {
            allColorsLength *= 2;
            const prevAllColors = allColors;

            allColors = new Float32Array(allColorsLength);
            allColors.set(prevAllColors);
        }

        for (let k = 0; k < n; k++) {
            allColors[currColor++] = colorIdx;
        }
    };

    const addTriangleIxs = (ix1, ix2, ix3) => {
        if (currIdx >= allIndexesLength - 3) {
            allIndexesLength *= 2;
            const prevAllIndexes = allIndexes;

            allIndexes = new Int32Array(allIndexesLength);
            allIndexes.set(prevAllIndexes);
        }

        allIndexes[currIdx++] = ix1;
        allIndexes[currIdx++] = ix2;
        allIndexes[currIdx++] = ix3;
    };

    const addRect = (x, y, width, height, colorIdx) => {
        const xLeft = x;
        const xRight = xLeft + width;
        const yTop = y;
        const yBottom = y + height;

        const ulIx = addPosition(xLeft, yTop);
        const urIx = addPosition(xRight, yTop);
        const llIx = addPosition(xLeft, yBottom);
        const lrIx = addPosition(xRight, yBottom);
        addColor(colorIdx, 4);

        addTriangleIxs(ulIx, urIx, llIx);
        addTriangleIxs(llIx, lrIx, urIx);
    };

    const xScale = scaleLinear().domain(domain).range(scaleRange);

    let groupCounter = 0;
    const groupKeys = Object.keys(grouped).sort();

    for (const key of groupKeys) {
        grouped[key].start = yGlobalScale(currStart);
        currStart += grouped[key].rows.length;
        grouped[key].end = yGlobalScale(currStart - 1) + yGlobalScale.bandwidth();
        const lineHeight = yGlobalScale.step() - yGlobalScale.bandwidth();

        // addRect(0, grouped[key].end, dimensions[0], lineHeight, PILEUP_COLOR_IXS.BLACK);

        if (groupCounter % 2) {
            // addRect(
            //   0,
            //   grouped[key].start,
            //   xScale(maxPos) - xScale(minPos),
            //   grouped[key].end - grouped[key].start,
            //   PILEUP_COLOR_IXS.BLACK_05
            // );
        }

        groupCounter += 1;
    }

    if (trackOptions.showCoverage) {
        const maxCoverageSamples = 10000;
        coverageSamplingDistance = Math.max(Math.floor((maxPos - minPos) / maxCoverageSamples), 1);
        const result = getCoverage(segmentList, coverageSamplingDistance);

        allReadCounts = result.coverage;
        const maxReadCount = result.maxCoverage;

        const d = range(0, trackOptions.coverageHeight);
        const groupStart = yGlobalScale(0);
        const groupEnd = yGlobalScale(trackOptions.coverageHeight - 1) + yGlobalScale.bandwidth();
        const r = [groupStart, groupEnd];

        const yScale = scaleBand().domain(d).range(r).paddingInner(0.05);

        let xLeft, yTop, barHeight;
        let bgColor = PILEUP_COLOR_IXS.BG_MUTED;
        const width = (xScale(1) - xScale(0)) * coverageSamplingDistance;
        const groupHeight = yScale.bandwidth() * trackOptions.coverageHeight;
        const scalingFactor = groupHeight / maxReadCount;

        for (const pos of Object.keys(allReadCounts)) {
            xLeft = xScale(pos);
            yTop = groupHeight;

            // Draw rects for variants counts on top of each other
            for (const variant of Object.keys(allReadCounts[pos]['variants'])) {
                barHeight = allReadCounts[pos]['variants'][variant] * scalingFactor;
                yTop -= barHeight;
                // When the coverage is not exact, we don't color variants.
                const variantColor = coverageSamplingDistance === 1 ? PILEUP_COLOR_IXS[variant] : bgColor;
                addRect(xLeft, yTop, width, barHeight, variantColor);
            }

            barHeight = allReadCounts[pos]['matches'] * scalingFactor;
            yTop -= barHeight;
            if (coverageSamplingDistance === 1) {
                bgColor = pos % 2 === 0 ? PILEUP_COLOR_IXS.BG : PILEUP_COLOR_IXS.BG2;
            }

            addRect(xLeft, yTop, width, barHeight, bgColor);
        }
    }

    for (const group of Object.values(grouped)) {
        const { rows } = group;

        const d = range(0, rows.length);
        const r = [group.start, group.end];

        const yScale = scaleBand().domain(d).range(r).paddingInner(0.2);

        let xLeft;
        let xRight;
        let yTop;
        let yBottom;

        rows.map((row, i) => {
            yTop = yScale(i);
            const height = yScale.bandwidth();
            yBottom = yTop + height;

            row.map((segment, j) => {
                const from = xScale(segment.from);
                const to = xScale(segment.to);

                xLeft = from;
                xRight = to;

                // if (segment.strand === '+' && trackOptions.plusStrandColor) {
                //     addRect(xLeft, yTop, xRight - xLeft, height, PILEUP_COLOR_IXS.PLUS_STRAND);
                // } else if (segment.strand === '-' && trackOptions.minusStrandColor) {
                //     addRect(xLeft, yTop, xRight - xLeft, height, PILEUP_COLOR_IXS.MINUS_STRAND);
                // } else {
                addRect(xLeft, yTop, xRight - xLeft, height, PILEUP_COLOR_IXS.BG);
                // }

                for (const substitution of segment.substitutions) {
                    return;
                    xLeft = xScale(segment.from + substitution.pos);
                    const width = Math.max(1, xScale(substitution.length) - xScale(0));
                    const insertionWidth = Math.max(1, xScale(0.1) - xScale(0));
                    xRight = xLeft + width;

                    if (substitution.variant === 'A') {
                        addRect(xLeft, yTop, width, height, PILEUP_COLOR_IXS.A);
                    } else if (substitution.variant === 'C') {
                        addRect(xLeft, yTop, width, height, PILEUP_COLOR_IXS.C);
                    } else if (substitution.variant === 'G') {
                        addRect(xLeft, yTop, width, height, PILEUP_COLOR_IXS.G);
                    } else if (substitution.variant === 'T') {
                        addRect(xLeft, yTop, width, height, PILEUP_COLOR_IXS.T);
                    } else if (substitution.type === 'S') {
                        addRect(xLeft, yTop, width, height, PILEUP_COLOR_IXS.S);
                    } else if (substitution.type === 'H') {
                        addRect(xLeft, yTop, width, height, PILEUP_COLOR_IXS.H);
                    } else if (substitution.type === 'X') {
                        addRect(xLeft, yTop, width, height, PILEUP_COLOR_IXS.X);
                    } else if (substitution.type === 'I') {
                        addRect(xLeft, yTop, insertionWidth, height, PILEUP_COLOR_IXS.I);
                    } else if (substitution.type === 'D') {
                        addRect(xLeft, yTop, width, height, PILEUP_COLOR_IXS.D);

                        // add some stripes
                        const numStripes = 6;
                        const stripeWidth = 0.1;
                        for (let i = 0; i <= numStripes; i++) {
                            const xStripe = xLeft + (i * width) / numStripes;
                            addRect(xStripe, yTop, stripeWidth, height, PILEUP_COLOR_IXS.BLACK);
                        }
                    } else if (substitution.type === 'N') {
                        // deletions so we're going to draw a thinner line
                        // across
                        const xMiddle = (yTop + yBottom) / 2;
                        const delWidth = Math.min((yBottom - yTop) / 4.5, 1);

                        const yMidTop = xMiddle - delWidth / 2;
                        const yMidBottom = xMiddle + delWidth / 2;

                        addRect(xLeft, yTop, xRight - xLeft, yMidTop - yTop, PILEUP_COLOR_IXS.N);
                        addRect(xLeft, yMidBottom, width, yBottom - yMidBottom, PILEUP_COLOR_IXS.N);

                        let currPos = xLeft;
                        const DASH_LENGTH = 6;
                        const DASH_SPACE = 4;

                        // draw dashes
                        while (currPos <= xRight) {
                            // make sure the last dash doesn't overrun
                            const dashLength = Math.min(DASH_LENGTH, xRight - currPos);

                            addRect(currPos, yMidTop, dashLength, delWidth, PILEUP_COLOR_IXS.N);
                            currPos += DASH_LENGTH + DASH_SPACE;
                        }
                        // allready handled above
                    } else {
                        addRect(xLeft, yTop, width, height, PILEUP_COLOR_IXS.BLACK);
                    }
                }
            });
        });
    }

    const positionsBuffer = allPositions.slice(0, currPosition).buffer;
    console.log(allPositions);
    const colorsBuffer = allColors.slice(0, currColor).buffer;
    const ixBuffer = allIndexes.slice(0, currIdx).buffer;

    const objData = {
        rows: grouped,
        coverage: allReadCounts,
        coverageSamplingDistance,
        positionsBuffer,
        colorsBuffer,
        ixBuffer,
        xScaleDomain: domain,
        xScaleRange: scaleRange
    };

    //const t2 = currTime();
    //console.log('renderSegments time:', t2 - t1, 'ms');

    return Transfer(objData, [objData.positionsBuffer, colorsBuffer, ixBuffer]);
};

const tileFunctions = {
    init,
    tilesetInfo,
    fetchTilesDebounced,
    tile,
    getTabularData,
    renderSegments
};

expose(tileFunctions);
