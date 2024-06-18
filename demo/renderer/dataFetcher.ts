import { DataFetcher } from '@higlass/datafetcher';
import { fakePubSub } from '@higlass/utils';
import { BigWigDataFetcher, CsvDataFetcher } from '@data-fetchers';

export function getDataFetcher(spec: Track) {
    if (!('data' in spec)) {
        console.warn('No data in the track spec', spec);
    }
    if (spec.data.type == 'multivec' || spec.data.type == 'beddb') {
        const url = spec.data.url;
        const server = url.split('/').slice(0, -2).join('/');
        const tilesetUid = url.split('=').slice(-1)[0];
        return new DataFetcher({ server, tilesetUid }, fakePubSub);
    }
    if (spec.data.type == 'bigwig') {
        return new BigWigDataFetcher(spec.data);
    }
    if (spec.data.type == 'csv') {
        return new CsvDataFetcher(spec.data);
    }
}
