/*
 * This document is heavily based on the following repo by @alexander-veit:
 * https://github.com/dbmi-bgm/higlass-sv/blob/main/src/sv-fetcher.js
 */
import { spawn } from 'threads';
import Worker from './vcf-worker.ts?worker&inline';

import { computeChromSizes } from '../../core/utils/assembly';

import type { ModuleThread } from 'threads';
import type { Assembly, VcfData } from '../../core/gosling.schema';
import type { WorkerApi, TilesetInfo } from './vcf-worker';
import type { TabularDataFetcher } from '../utils';

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

const getMutationType = (ref: string, alt?: string) => {
    if (!alt) return 'unknown';
    if (ref.length === alt.length) return 'substitution';
    if (ref.length > alt.length) return 'deletion';
    if (ref.length < alt.length) return 'insertion';
    return 'unknown';
};

const getSubstitutionType = (ref: string, alt?: string) => {
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

/**
 * Convert a VCF record to a tile data
 * @param vcfRecord A row of a VCF files loaded
 * @param chrPos Cumulative start position of a chromosome
 * @param prevPos Previous position of a point mutation for calculating 'distance to previous'
 */
export function recordToTile(vcfRecord: VcfRecord, chrPos: number, prevPos?: number) {
    const POS = chrPos + vcfRecord.POS + 1;

    let ALT: string | undefined;
    if (Array.isArray(vcfRecord.ALT) && vcfRecord.ALT.length > 0) {
        ALT = vcfRecord.ALT[0];
    }

    // Additionally inferred values
    const DISTPREV = !prevPos ? null : vcfRecord.POS - prevPos;
    const DISTPREVLOGE = !prevPos ? null : Math.log(vcfRecord.POS - prevPos);
    const MUTTYPE = getMutationType(vcfRecord.REF, ALT);
    const SUBTYPE = getSubstitutionType(vcfRecord.REF, ALT);
    const POSEND = POS + vcfRecord.REF.length;

    // Create key values
    const data: VcfTile = {
        ...vcfRecord,
        ALT,
        MUTTYPE,
        SUBTYPE,
        INFO: JSON.stringify(vcfRecord.INFO),
        ORIGINALPOS: vcfRecord.POS,
        POS,
        POSEND,
        DISTPREV,
        DISTPREVLOGE
    };

    // Add optional INFO columns
    Object.keys(vcfRecord.INFO).forEach(key => {
        const val = vcfRecord.INFO[key];
        if (Array.isArray(val)) {
            data[key] = val.join(', ');
        } else {
            data[key] = val;
        }
    });
    return data;
}

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

    async sendFetch(receivedTiles: (tiles: Record<string, VcfTile>) => void, tileIds: string[]) {
        (await this.worker).fetchTilesDebounced(this.uid, tileIds).then(receivedTiles);
    }

    async getTabularData(tileIds: string[]): Promise<VcfTile[]> {
        const buf = await (await this.worker).getTabularData(this.uid, tileIds);
        return JSON.parse(new TextDecoder().decode(buf));
    }
}

export default VcfDataFetcher;
