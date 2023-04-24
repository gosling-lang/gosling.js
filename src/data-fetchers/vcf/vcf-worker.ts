/*
 * This document is heavily based on the following repo by @alexander-veit:
 * https://github.com/dbmi-bgm/higlass-sv/blob/main/src/sv-fetcher-worker.js
 */
import VCF from '@gmod/vcf';
import { TabixIndexedFile } from '@gmod/tabix';
import { expose, Transfer } from 'threads/worker';
import { sampleSize } from 'lodash-es';

import { DataSource, RemoteFile } from '../utils';

import type { TilesetInfo } from '@higlass/types';
import type { ChromSizes } from '@gosling.schema';
import { recordToTile } from './utils';
import type { VcfRecord, VcfTile } from './vcf-data-fetcher';

// promises indexed by urls
const vcfFiles: Map<string, VcfFile> = new Map();

type VcfFileOptions = {
    sampleLength: number;
};

class VcfFile {
    private parser?: VCF;

    constructor(public tbi: TabixIndexedFile) {}

    async getParser() {
        if (!this.parser) {
            const header = await this.tbi.getHeader();
            this.parser = new VCF({ header });
        }
        return this.parser;
    }

    static fromUrl(url: string, indexUrl: string) {
        const tbi = new TabixIndexedFile({
            filehandle: new RemoteFile(url),
            tbiFilehandle: new RemoteFile(indexUrl)
        });
        return new VcfFile(tbi);
    }
}

// promises indexed by url
const tileValues: Record<string, VcfTile[]> = {}; // new LRU({ max: MAX_TILES });

// const vcfData = [];
const dataSources: Map<string, DataSource<VcfFile, VcfFileOptions>> = new Map();

function init(
    uid: string,
    vcf: { url: string; indexUrl: string },
    chromSizes: ChromSizes,
    options: Partial<VcfFileOptions> = {}
) {
    let vcfFile = vcfFiles.get(vcf.url);
    if (!vcfFile) {
        vcfFile = VcfFile.fromUrl(vcf.url, vcf.indexUrl);
    }
    const dataSource = new DataSource(vcfFile, chromSizes, {
        sampleLength: 1000,
        ...options
    });
    dataSources.set(uid, dataSource);
}

const tilesetInfo = (uid: string) => {
    return dataSources.get(uid)!.tilesetInfo;
};

// We return an empty tile. We get the data from SvTrack
const tile = async (uid: string, z: number, x: number): Promise<void[]> => {
    const source = dataSources.get(uid)!;
    const parser = await source.file.getParser();

    const CACHE_KEY = `${uid}.${z}.${x}`;

    // TODO: Caching is needed
    // if (!tileValues[CACHE_KEY]) {
    tileValues[CACHE_KEY] = [];
    // }

    const recordPromises: Promise<void>[] = [];
    const tileWidth = +source.tilesetInfo.max_width / 2 ** +z;

    // get bounds of this tile
    const minX = source.tilesetInfo.min_pos[0] + x * tileWidth;
    const maxX = source.tilesetInfo.min_pos[0] + (x + 1) * tileWidth;

    let curMinX = minX;

    const { chromLengths, cumPositions } = source.chromInfo;

    cumPositions.forEach(cumPos => {
        const chromName = cumPos.chr;
        const chromStart = cumPos.pos;
        const chromEnd = cumPos.pos + chromLengths[chromName];

        const parseLineStoreData = (line: string, prevPos?: number) => {
            const vcfRecord: VcfRecord = parser.parseLine(line);
            const data = recordToTile(vcfRecord, cumPos.pos, prevPos);

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
                    source.file.tbi
                        .getLines(chromName, startPos, endPos, line => {
                            prevPOS = parseLineStoreData(line, prevPOS);
                        })
                        .then(() => {})
                );
            } else {
                startPos = Math.floor(curMinX - chromStart);
                endPos = Math.ceil(maxX - chromStart);
                recordPromises.push(
                    source.file.tbi
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
    const tiles: Record<string, VcfTile> = {};
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
            tiles[validTileId].tilePositionId = validTileId;
        }
        return tiles;
    });
};

const getTabularData = (uid: string, tileIds: string[]) => {
    const data: VcfTile[][] = [];

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

    const sampleLength = dataSources.get(uid)!.options.sampleLength;
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
