/*
 * This document is heavily based on the following repo by @alexander-veit:
 * https://github.com/dbmi-bgm/higlass-sv/blob/main/src/sv-fetcher.js
 */
import { GET_CHROM_SIZES } from '../../core/utils/assembly';
import type { Assembly, VCFData } from '../../core/gosling.schema';

const DEBOUNCE_TIME = 200;

type VcfDataConfig = VCFData & { assembly: Assembly };

class GoslingVcfData {
    private dataPromise: Promise<any> | undefined;
    private chromSizes: any;
    private values: any;
    private assembly: Assembly;
    private initPromise: any;
    private dataConfig: VcfDataConfig;
    private worker: any;
    private uid: string;
    private fetchTimeout: any;
    private toFetch: Set<any>;
    private track: any;
    private prevRequestTime: number;
    private tbiIndexed: any;
    private tbiVCFParser: any;

    constructor(HGC: any, dataConfig: VcfDataConfig, worker: any) {
        this.dataConfig = dataConfig;
        this.uid = HGC.libraries.slugid.nice();
        this.worker = worker;
        this.prevRequestTime = 0;
        this.assembly = dataConfig.assembly;

        this.toFetch = new Set();
        this.fetchTimeout = null;

        this.tbiIndexed = null;
        this.tbiVCFParser = null;

        this.initPromise = this.worker.then((tileFunctions: any) => {
            return tileFunctions
                .init(
                    this.uid,
                    dataConfig.url,
                    dataConfig.indexUrl,
                    GET_CHROM_SIZES(this.assembly).path,
                    dataConfig.sampleLength ?? 1000
                )
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
