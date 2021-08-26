/*
 * This code is based on the following repo:
 * https://github.com/higlass/higlass-pileup
 */
import { Assembly } from '../../core/gosling.schema';

const DEBOUNCE_TIME = 200;

class BAMDataFetcher {
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

    constructor(HGC: any, dataConfig: any, worker: any) {
        this.worker = worker;
        this.dataConfig = dataConfig;
        this.uid = HGC.libraries.slugid.nice();
        this.assembly = 'hg38';
        this.fetchTimeout = null;
        this.toFetch = new Set();

        this.initPromise = this.worker.then((tileFunctions: any) => {
            if (dataConfig.url && !dataConfig.bamUrl) {
                dataConfig['bamUrl'] = dataConfig.url;
            }

            if (!dataConfig.baiUrl) {
                dataConfig['baiUrl'] = dataConfig.indexUrl ?? `${dataConfig['bamUrl']}.bai`;
            }

            return tileFunctions
                .init(this.uid, dataConfig.bamUrl, dataConfig.baiUrl, dataConfig.chromSizesUrl)
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
        const { toFetch } = this;

        const thisZoomLevel = tileIds[0].split('.')[0]; // Example of tileIds: ["3.0", "3.1"]
        const toFetchZoomLevel = toFetch.size ? [...toFetch][0].split('.')[0] : null;

        if (thisZoomLevel !== toFetchZoomLevel) {
            for (const tileId of this.toFetch) {
                this.track.fetching.delete(tileId);
            }
            this.toFetch.clear();
        }

        tileIds.forEach((x: any) => this.toFetch.add(x));

        if (this.fetchTimeout) {
            clearTimeout(this.fetchTimeout);
        }

        this.fetchTimeout = setTimeout(() => {
            this.sendFetch(receivedTiles, [...this.toFetch]);
            this.toFetch.clear();
        }, DEBOUNCE_TIME);
    }

    sendFetch(receivedTiles: any, tileIds: any) {
        // this.track.updateLoadingText();

        this.worker.then((tileFunctions: any) => {
            tileFunctions.fetchTilesDebounced(this.uid, tileIds).then(receivedTiles);
        });
    }
}

export default BAMDataFetcher;
