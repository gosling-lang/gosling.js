/*
 * This document is heavily based on the following repo by @alexander-veit:
 * https://github.com/dbmi-bgm/higlass-sv/blob/main/src/sv-fetcher.js
 */
import { spawn } from 'threads';
import Worker from './vcf-worker.ts?worker&inline';

import { computeChromSizes } from '../../core/utils/assembly';

import type { ModuleThread } from 'threads';
import type { Assembly, VcfData } from '@gosling-lang/gosling-schema';
import type { WorkerApi, TilesetInfo } from './vcf-worker';
import type { TabularDataFetcher } from '../utils';
import { getSubstitutionType, getMutationType } from './utils';

const DEBOUNCE_TIME = 200;

// const MAX_TILES = 20;
// https://github.com/GMOD/vcf-js/blob/c4a9cbad3ba5a3f0d1c817d685213f111bf9de9b/src/parse.ts#L284-L291
export type VcfRecord = {
    CHROM: string;
    POS: number;
    ID: null | string[];
    REF: string;
    ALT: null | string[];
    QUAL: null | number;
    FILTER: null | string;
    INFO: Record<string, true | (number | null)[] | string[]>;
};

export type VcfTile = Omit<VcfRecord, 'ALT' | 'INFO'> & {
    ALT: string | undefined;
    MUTTYPE: ReturnType<typeof getMutationType>;
    SUBTYPE: ReturnType<typeof getSubstitutionType>;
    INFO: string;
    ORIGINALPOS: number;
    POS: number;
    POSEND: number;
    DISTPREV: number | null;
    DISTPREVLOGE: number | null;
} & { [infoKey: string]: any };

class VcfDataFetcher implements TabularDataFetcher<VcfTile> {
    static config = { type: 'vcf' };
    dataConfig = {}; // required for higlass
    uid: string;
    prevRequestTime: number;
    track?: any;

    private toFetch: Set<string>;
    private fetchTimeout?: ReturnType<typeof setTimeout>;
    private worker: Promise<ModuleThread<WorkerApi>>;

    constructor(HGC: import('@higlass/types').HGC, config: VcfData & { assembly: Assembly }) {
        this.uid = HGC.libraries.slugid.nice();
        this.prevRequestTime = 0;
        this.toFetch = new Set();
        const { url, indexUrl, assembly, ...options } = config;
        this.worker = spawn<WorkerApi>(new Worker()).then(async worker => {
            const chromSizes = Object.entries(computeChromSizes(assembly).size);
            await worker.init(this.uid, { url, indexUrl }, chromSizes, options);
            return worker;
        });
    }

    /*
     * Collect Tileset Information, such as tile size and genomic positions
     */
    async tilesetInfo(callback: (info: TilesetInfo) => void) {
        (await this.worker).tilesetInfo(this.uid).then(callback);
    }

    fetchTilesDebounced(receivedTiles: (tiles: Record<string, VcfTile>) => void, tileIds: string[]) {
        this.track.drawLoadingCue();

        tileIds.forEach(tileId => this.toFetch.add(tileId));

        if (this.fetchTimeout) {
            clearTimeout(this.fetchTimeout);
        }

        this.fetchTimeout = setTimeout(() => {
            this.sendFetch(receivedTiles, [...this.toFetch]);
            this.toFetch.clear();
        }, DEBOUNCE_TIME);
    }

    async sendFetch(receivedTiles: (tiles: Record<string, VcfTile>) => void, tileIds: string[]) {
        (await this.worker).fetchTilesDebounced(this.uid, tileIds).then(receivedTiles);
    }

    async getTabularData(tileIds: string[]): Promise<VcfTile[]> {
        const buf = await (await this.worker).getTabularData(this.uid, tileIds);
        return JSON.parse(new TextDecoder().decode(buf));
    }
}

export default VcfDataFetcher;
