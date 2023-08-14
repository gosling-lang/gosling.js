/*
 * The GFF data fetcher is based heavily on the BED and VCF data fetchers
 */
import { spawn } from 'threads';
import Worker from './gff-worker.ts?worker&inline';

import { computeChromSizes } from '../../core/utils/assembly';

import type { ModuleThread } from 'threads';
import type { Assembly, GffData } from '@gosling-lang/gosling-schema';
import type { WorkerApi, TilesetInfo, GffTile, EmptyTile } from './gff-worker';
import type { TabularDataFetcher } from '../utils';

const DEBOUNCE_TIME = 200;

export type GFFDataConfig = GffData & { assembly: Assembly };

class GffDataFetcher implements TabularDataFetcher<GffTile> {
    static config = { type: 'gff' };
    dataConfig = {}; // required for higlass
    uid: string;
    prevRequestTime: number;
    track?: any;

    private toFetch: Set<string>;
    private fetchTimeout?: ReturnType<typeof setTimeout>;
    private worker: Promise<ModuleThread<WorkerApi>>;

    constructor(HGC: import('@higlass/types').HGC, config: GFFDataConfig) {
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

    fetchTilesDebounced(receivedTiles: (tiles: Record<string, EmptyTile>) => void, tileIds: string[]) {
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

    async sendFetch(receivedTiles: (tiles: Record<string, EmptyTile>) => void, tileIds: string[]) {
        (await this.worker).fetchTilesDebounced(this.uid, tileIds).then(receivedTiles);
    }

    async getTabularData(tileIds: string[]): Promise<GffTile[]> {
        const buf = await (await this.worker).getTabularData(this.uid, tileIds);
        const parsed = JSON.parse(new TextDecoder().decode(buf));
        return parsed;
    }
}

export default GffDataFetcher;
