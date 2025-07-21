import { DataFetcher } from '@higlass/datafetcher';
import { fakePubSub } from '../../src/core/utils/fake-pub-sub';
import {
    BigWigDataFetcher,
    CsvDataFetcher,
    GffDataFetcher,
    JsonDataFetcher,
    BamDataFetcher,
    BedDataFetcher,
    VcfDataFetcher
} from '@data-fetchers';
import type { UrlToFetchOptions } from 'src/compiler/compile';
import type { BigWigDataConfig } from 'src/data-fetchers/bigwig/bigwig-data-fetcher';
import type { CsvDataConfig } from 'src/data-fetchers/csv/csv-data-fetcher';
import type { GFFDataConfig } from 'src/data-fetchers/gff/gff-data-fetcher';
import type { BedDataConfig } from 'src/data-fetchers/bed/bed-data-fetcher';
import type { VcfDataConfig } from 'src/data-fetchers/vcf/vcf-data-fetcher';
import type { OverlaidTrack, SingleTrack } from '@gosling-lang/gosling-schema';

export function getDataFetcher(spec: SingleTrack | OverlaidTrack, urlToFetchOptions?: UrlToFetchOptions) {
    const { data, assembly = 'hg38' } = spec;

    if (typeof data === 'undefined') {
        console.warn('No data in the track spec', spec);
        return;
    }

    const { type } = data;

    const urlFetchOptions = ('url' in data && urlToFetchOptions?.[data.url]) || {};
    const indexUrlFetchOptions = ('indexUrl' in data && urlToFetchOptions?.[data.indexUrl]) || {};

    if (type == 'multivec' || type == 'beddb' || type == 'matrix') {
        const url = data.url;
        const server = url.split('/').slice(0, -2).join('/');
        const tilesetUid = url.split('=').slice(-1)[0];
        return new DataFetcher({ server, tilesetUid }, fakePubSub);
    }
    if (type == 'bigwig') {
        return new BigWigDataFetcher({ ...data, assembly } as BigWigDataConfig);
    }
    if (type == 'csv') {
        const fields = getFields(spec);
        return new CsvDataFetcher({ ...data, ...fields, assembly, urlFetchOptions } as CsvDataConfig);
    }
    if (type == 'json') {
        const fields = getFields(spec);
        return new JsonDataFetcher({ ...data, ...fields, assembly });
    }
    if (type == 'gff') {
        return new GffDataFetcher({ ...data, assembly, urlFetchOptions, indexUrlFetchOptions } as GFFDataConfig);
    }
    if (type == 'bam') {
        return new BamDataFetcher({ ...data, assembly, urlFetchOptions, indexUrlFetchOptions });
    }
    if (type == 'bed') {
        return new BedDataFetcher({ ...data, assembly, urlFetchOptions, indexUrlFetchOptions } as BedDataConfig);
    }
    if (type == 'vcf') {
        return new VcfDataFetcher({ ...data, assembly, urlFetchOptions, indexUrlFetchOptions } as VcfDataConfig);
    }
}

/**
 * Some datafetchers need to know which encoding corresponds to which field
 */
function getFields(spec: SingleTrack | OverlaidTrack) {
    const fields: { x?: string; xe?: string; y?: string; ye?: string } = {};
    if ('x' in spec && spec.x && 'field' in spec.x) {
        fields.x = spec.x.field;
    }
    if ('xe' in spec && spec.xe && 'field' in spec.xe) {
        fields.xe = spec.xe.field;
    }
    if ('y' in spec && spec.y && 'field' in spec.y) {
        fields.y = spec.y.field;
    }
    if ('ye' in spec && spec.ye && 'field' in spec.ye) {
        fields.ye = spec.ye.field;
    }
    return fields;
}
