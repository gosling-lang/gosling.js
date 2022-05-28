/*
 * This document is heavily based on the following repo by @alexander-veit:
 * https://github.com/dbmi-bgm/higlass-sv/blob/main/src/sv-fetcher.js
 */
import type { Assembly } from '@gosling/schema';
import Worker from './vcf-worker.js?worker&inline';
import { spawn } from 'threads';

const DEBOUNCE_TIME = 200;

class GoslingVcfData {
    private dataPromise: Promise<any> | undefined;
    private chromSizes: any;
    private values: any;
    private assembly: Assembly;
    private initPromise: any;
    private dataConfig: any;
    private worker: any;
    private uid: string;
    private fetchTimeout: any;
    private toFetch: Set<any>;
    private track: any;
    private prevRequestTime: number;
    private tbiIndexed: any;
    private tbiVCFParser: any;

    constructor(HGC: any, dataConfig: any) {
        this.dataConfig = dataConfig;
        this.uid = HGC.libraries.slugid.nice();
        this.worker = spawn(new Worker());
        this.prevRequestTime = 0;
        this.assembly = 'hg38';

        this.toFetch = new Set();
        this.fetchTimeout = null;

        this.tbiIndexed = null;
        this.tbiVCFParser = null;

        this.initPromise = this.worker.then((tileFunctions: any) => {
            dataConfig['vcfUrl'] = dataConfig.url;
            dataConfig['tbiUrl'] = dataConfig.indexUrl ?? `${dataConfig['vcfUrl']}.tbi`;
            dataConfig['chromSizesUrl'] = 'https://s3.amazonaws.com/gosling-lang.org/data/hg19.chrom.sizes';
            dataConfig['sampleLength'] = dataConfig.sampleLength ?? 1000;

            return tileFunctions
                .init(this.uid, dataConfig.vcfUrl, dataConfig.tbiUrl, dataConfig.chromSizesUrl, dataConfig.sampleLength)
                .then(() => this.worker);
        });
    }

    /*
     * Collect Tileset Information, such as tile size and genomic positions
     */
    tilesetInfo(callback?: any) {
        this.worker.then((tileFunctions: any) => {
            tileFunctions.tilesetInfo(this.uid).then(callback);
        });
    }

    fetchTilesDebounced(receivedTiles: any, tileIds: any) {
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

        tileIds.forEach((tileId: any) => this.toFetch.add(tileId));

        if (this.fetchTimeout) {
            clearTimeout(this.fetchTimeout);
        }

        this.fetchTimeout = setTimeout(() => {
            this.sendFetch(receivedTiles, [...this.toFetch]);
            this.toFetch.clear();
        }, DEBOUNCE_TIME);
    }

    sendFetch(receivedTiles: any, tileIds: any) {
        this.worker.then((tileFunctions: any) => {
            tileFunctions.fetchTilesDebounced(this.uid, tileIds).then(receivedTiles);
        });
    }
}

export default GoslingVcfData;
