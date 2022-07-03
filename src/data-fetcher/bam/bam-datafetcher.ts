/*
 * This code is based on the following repo:
 * https://github.com/higlass/higlass-pileup
 */
import { spawn } from 'threads';
import Worker from './bam-worker.ts?worker&inline';

import type { Assembly } from '../../core/gosling.schema';
import type { ModuleThread } from 'threads';
import type { WorkerApi, TilesetInfo, Tiles, DataConfig as WorkerDataConfig } from './bam-worker';

const DEBOUNCE_TIME = 200;

type DataConfig = Partial<WorkerDataConfig> & { url: string; indexUrl?: string };

class BAMDataFetcher {
    dataConfig: DataConfig;
    assembly: Assembly;

    uid: string;
    fetchTimeout?: ReturnType<typeof setTimeout>;
    toFetch: Set<string>;

    private worker: Promise<ModuleThread<WorkerApi>>;

    // This is set by us but is accessed in `fetchTilesDebounced`
    track?: {
        fetching: { delete(id: string): void };
    };

    constructor(HGC: import('@higlass/types').HGC, dataConfig: DataConfig) {
        this.dataConfig = dataConfig;
        this.uid = HGC.libraries.slugid.nice();
        this.assembly = 'hg38';
        this.toFetch = new Set();

        this.worker = spawn<WorkerApi>(new Worker()).then(async worker => {
            const bamUrl = dataConfig.bamUrl ?? dataConfig.url;
            const workerDataConfig: WorkerDataConfig = {
                ...dataConfig,
                bamUrl,
                baiUrl: dataConfig.baiUrl ?? dataConfig.indexUrl ?? `${bamUrl}.bai`
            };
            await worker.init(this.uid, workerDataConfig);
            return worker;
        });
    }

    /*
     * Collect Tileset Information, such as tile size and genomic positions
     */
    async tilesetInfo(callback: (info: TilesetInfo) => void) {
        (await this.worker).tilesetInfo(this.uid).then(callback);
    }

    fetchTilesDebounced(receivedTiles: (tiles: Tiles) => void, tileIds: string[]) {
        const { toFetch } = this;

        const thisZoomLevel = tileIds[0].split('.')[0]; // Example of tileIds: ["3.0", "3.1"]
        const toFetchZoomLevel = toFetch.size ? [...toFetch][0].split('.')[0] : null;

        if (thisZoomLevel !== toFetchZoomLevel) {
            for (const tileId of this.toFetch) {
                this.track?.fetching.delete(tileId);
            }
            this.toFetch.clear();
        }

        tileIds.forEach(x => this.toFetch.add(x));

        if (this.fetchTimeout) {
            clearTimeout(this.fetchTimeout);
        }

        this.fetchTimeout = setTimeout(() => {
            this.sendFetch(receivedTiles, [...this.toFetch]);
            this.toFetch.clear();
        }, DEBOUNCE_TIME);
    }

    async sendFetch(receivedTiles: (tiles: Tiles) => void, tileIds: string[]) {
        // this.track.updateLoadingText();
        (await this.worker).fetchTilesDebounced(this.uid, tileIds).then(receivedTiles);
    }

    async getTabularData(uid: string, tileIds: string[]): Promise<any[]> {
        const buf = await (await this.worker).getTabularData(uid, tileIds);
        return JSON.parse(new TextDecoder().decode(buf));
    }
}

export default BAMDataFetcher;
