/*
 * This document is heavily based on the following repo by @alexander-veit:
 * https://github.com/dbmi-bgm/higlass-sv/blob/main/src/sv-fetcher.js
 */
import { spawn } from 'threads';
import Worker from './vcf-worker.ts?worker&inline';

import { GET_CHROM_SIZES } from '../../core/utils/assembly';

import type { ModuleThread } from 'threads';
import type { VcfData } from '../../core/gosling.schema';
import type { WorkerApi, TilesetInfo, Tile } from './vcf-worker';
import type { CommonDataConfig } from '../utils';

const DEBOUNCE_TIME = 200;

type VcfDataConfig = VcfData & CommonDataConfig;

class VcfDataFetcher {
    uid: string;
    prevRequestTime: number;
    track?: any;

    private toFetch: Set<string>;
    private fetchTimeout?: ReturnType<typeof setTimeout>;
    private worker: Promise<ModuleThread<WorkerApi>>;

    constructor(HGC: import('@higlass/types').HGC, public dataConfig: VcfDataConfig) {
        this.uid = HGC.libraries.slugid.nice();
        this.prevRequestTime = 0;
        this.toFetch = new Set();
        this.worker = spawn<WorkerApi>(new Worker()).then(async worker => {
            await worker.init(this.uid, {
                vcfUrl: dataConfig.url,
                tbiUrl: dataConfig.indexUrl,
                chromSizes: Object.entries(GET_CHROM_SIZES(dataConfig.assembly).size),
                sampleLength: dataConfig.sampleLength ?? 1000
            });
            return worker;
        });
    }

    /*
     * Collect Tileset Information, such as tile size and genomic positions
     */
    async tilesetInfo(callback: (info: TilesetInfo) => void) {
        (await this.worker).tilesetInfo(this.uid).then(callback);
    }

    fetchTilesDebounced(receivedTiles: (tiles: Record<string, Tile>) => void, tileIds: string[]) {
        // const { toFetch } = this;

        // const thisZoomLevel = tileIds[0].split('.')[0]; // Example of tileIds: ["3.0", "3.1"]
        // const toFetchZoomLevel = toFetch.size ? [...toFetch][0].split('.')[0] : null;

        // if (thisZoomLevel !== toFetchZoomLevel) {
        //     for (const tileId of this.toFetch) {
        //         this.track.fetching.delete(tileId);
        //     }
        //     this.toFetch.clear();
        // }

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

    async sendFetch(receivedTiles: (tiles: Record<string, Tile>) => void, tileIds: string[]) {
        (await this.worker).fetchTilesDebounced(this.uid, tileIds).then(receivedTiles);
    }

    async getTabularData(uid: string, tileIds: string[]): Promise<Tile[]> {
        const buf = await (await this.worker).getTabularData(uid, tileIds);
        return JSON.parse(new TextDecoder().decode(buf));
    }
}

export default VcfDataFetcher;
