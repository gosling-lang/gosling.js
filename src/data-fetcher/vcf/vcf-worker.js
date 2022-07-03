/*
 * This document is heavily based on the following repo by @alexander-veit:
 * https://github.com/dbmi-bgm/higlass-sv/blob/main/src/sv-fetcher-worker.js
 */
import VCF from '@gmod/vcf';
import { TabixIndexedFile } from '@gmod/tabix';
import { expose, Transfer } from 'threads/worker';
import { text } from 'd3-request';
import { tsvParseRows } from 'd3-dsv';
import { RemoteFile } from 'generic-filehandle';
import { sampleSize } from 'lodash-es';

/**
 * Construct size of chromosomes from data.
 */
export function parseChrSizes(rows) {
    const cumPositions = [];
    const chromLengths = {};
    const chrPositions = {};

    let totalLength = 0;

    rows.forEach((d, i) => {
        const chr = d[0];
        const length = Number(d[1]);
        const chrPosition = { id: i, chr, pos: totalLength };

        chrPositions[chr] = chrPosition;
        chromLengths[chr] = length;
        cumPositions.push(chrPosition);

        totalLength += length;
    });

    return { cumPositions, chrPositions, totalLength, chromLengths };
}

function ChromosomeInfo(filepath, success) {
    const info = {};

    // TODO: why is this used?
    info.absToChr = () => null;
    info.chrToAbs = () => null;

    return text(filepath, (error, chrInfoText) => {
        if (error) {
            // console.warn('Chromosome info not found at:', filepath);
            if (success) success(null);
        } else {
            const rows = tsvParseRows(chrInfoText);
            const chromInfo = parseChrSizes(rows);

            Object.keys(chromInfo).forEach(key => {
                info[key] = chromInfo[key];
            });
            if (success) success(info);
        }
    });
}

// promises indexed by urls
const vcfFiles = {};
const vcfHeaders = {};
const tbiVCFParsers = {};

// const MAX_TILES = 20;

// promises indexed by url
const chromSizes = {};
const chromInfos = {};
const tileValues = {}; // new LRU({ max: MAX_TILES });
const tilesetInfos = {};

// const vcfData = [];

// indexed by uuid
const dataConfs = {};

const init = (uid, vcfUrl, tbiUrl, chromSizesUrl, sampleLength) => {
    if (!vcfFiles[vcfUrl]) {
        vcfFiles[vcfUrl] = new TabixIndexedFile({
            filehandle: new RemoteFile(vcfUrl),
            tbiFilehandle: new RemoteFile(tbiUrl)
        });

        vcfHeaders[vcfUrl] = vcfFiles[vcfUrl].getHeader();
    }

    if (chromSizesUrl) {
        chromSizes[chromSizesUrl] =
            chromSizes[chromSizesUrl] ??
            new Promise(resolve => {
                ChromosomeInfo(chromSizesUrl, resolve);
            });
    }

    dataConfs[uid] = { vcfUrl, chromSizesUrl, sampleLength };
};

const tilesetInfo = uid => {
    const { chromSizesUrl, vcfUrl } = dataConfs[uid];
    const promises = [vcfHeaders[vcfUrl], chromSizes[chromSizesUrl]];

    return Promise.all(promises).then(values => {
        if (!tbiVCFParsers[vcfUrl]) {
            tbiVCFParsers[vcfUrl] = new VCF({ header: values[0] });
        }

        const TILE_SIZE = 1024;
        const chromInfo = values[1];
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

// We return an empty tile. We get the data from SvTrack
const tile = async (uid, z, x) => {
    const { chromSizesUrl, vcfUrl } = dataConfs[uid];

    if (!vcfHeaders[vcfUrl]) return;

    const CACHE_KEY = `${uid}.${z}.${x}`;

    // TODO: Caching is needed
    // if (!tileValues[CACHE_KEY]) {
    tileValues[CACHE_KEY] = [];
    // }

    return tilesetInfo(uid).then(tsInfo => {
        const recordPromises = [];

        const tileWidth = +tsInfo.max_width / 2 ** +z;

        // get bounds of this tile
        const minX = tsInfo.min_pos[0] + x * tileWidth;
        const maxX = tsInfo.min_pos[0] + (x + 1) * tileWidth;

        let curMinX = minX;

        const { chromLengths, cumPositions } = chromInfos[chromSizesUrl];
        const tbiVCFParser = tbiVCFParsers[vcfUrl];

        const getMutationType = (ref, alt) => {
            if (ref.length === alt.length) return 'substitution';
            else if (ref.length > alt.length) return 'deletion';
            else if (ref.length < alt.length) return 'insertion';
            else return 'unknown';
        };

        const getSubstitutionType = (ref, alt) => {
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

        cumPositions.forEach(cumPos => {
            const chromName = cumPos.chr;
            const chromStart = cumPos.pos;
            const chromEnd = cumPos.pos + chromLengths[chromName];

            const parseLineStoreData = (line, prevPos) => {
                const vcfRecord = tbiVCFParser.parseLine(line);
                const POS = cumPos.pos + vcfRecord.POS + 1;

                // We consider only the first ALT and REF if they are arrays
                if (Array.isArray(vcfRecord.ALT) && vcfRecord.ALT.length !== 0) {
                    vcfRecord.ALT = vcfRecord.ALT[0];
                }
                if (Array.isArray(vcfRecord.REF) && vcfRecord.REF.length !== 0) {
                    vcfRecord.REF = vcfRecord.REF[0];
                }

                // Additionally inferred values
                const DISTPREV = !prevPos ? null : vcfRecord.POS - prevPos;
                const DISTPREVLOGE = !prevPos ? null : Math.log(vcfRecord.POS - prevPos);
                const MUTTYPE = getMutationType(vcfRecord.REF, vcfRecord.ALT);
                const SUBTYPE = getSubstitutionType(vcfRecord.REF, vcfRecord.ALT);
                const POSEND = POS + vcfRecord.REF.length;

                // Create key values
                const data = {
                    ...vcfRecord,
                    MUTTYPE,
                    SUBTYPE,
                    INFO: JSON.stringify(vcfRecord.INFO),
                    ORIGINALPOS: vcfRecord.POS,
                    POS,
                    POSEND,
                    DISTPREV,
                    DISTPREVLOGE
                };

                // Parse INFO fields
                Object.keys(vcfRecord.INFO).forEach(key => {
                    data[key] = vcfRecord.INFO[key][0];
                });

                // Store this column
                tileValues[CACHE_KEY] = tileValues[CACHE_KEY].concat([data]);

                // Return current POS
                return vcfRecord.POS;
            };

            let startPos, endPos;
            if (chromStart <= curMinX && curMinX < chromEnd) {
                // start of the visible region is within this chromosome
                let prevPOS;
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
        for (let i = 0; i < values.length; i++) {
            const validTileId = validTileIds[i];
            tiles[validTileId] = values[i];
            tiles[validTileId].tilePositionId = validTileId;
        }
        return tiles;
    });
};

const getTabularData = (uid, tileIds) => {
    const data = [];

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
        const highPriority = output.sort((a, b) => -a.DISTPREV + b.DISTPREV).slice(0, sampleLength / 2.0);
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

expose(tileFunctions);
