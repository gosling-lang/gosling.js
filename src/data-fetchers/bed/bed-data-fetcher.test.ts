import { BedDataFetcherClass, type BedDataConfig, type TilesetInfo } from './bed-data-fetcher';
import fetch from 'cross-fetch';

if (!globalThis.fetch) globalThis.fetch = fetch;

describe('BED fetcher', () => {
    const dataConfig: BedDataConfig = {
        type: 'bed',
        url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/275_peaks.bed',
        assembly: 'hg38',
        sampleLength: 1000
    };

    const fetcher = new BedDataFetcherClass(dataConfig);

    it('has tile metadata', () =>
        new Promise<void>(resolve => {
            fetcher.tilesetInfo((info: TilesetInfo) => {
                expect(info).toMatchInlineSnapshot(`
                  {
                    "max_pos": [
                      3088269832,
                      3088269832,
                    ],
                    "max_width": 3088269832,
                    "max_zoom": 22,
                    "min_pos": [
                      0,
                      0,
                    ],
                    "tile_size": 1024,
                  }
                `);
                resolve();
            });
        }));
    it('has expected column names', () =>
        new Promise<void>(resolve => {
            fetcher.fetchTilesDebounced(
                loadedTile => {
                    expect(Object.keys(loadedTile['0.0'].tabularData[0])).toMatchInlineSnapshot(`
                      [
                        "chrom",
                        "chromStart",
                        "chromEnd",
                        "name",
                        "score",
                      ]
                    `);
                    expect(loadedTile['0.0'].tabularData.length).toEqual(1000);
                    resolve();
                },
                ['0.0']
            );
        }));

    it('assigns data to two tiles', () =>
        new Promise<void>(resolve => {
            fetcher.fetchTilesDebounced(
                (t: any) => {
                    expect(t['1.0']).not.toBeUndefined();
                    expect(t['1.1']).not.toBeUndefined();
                    expect(t['1.0'].tabularData.length).toBeGreaterThan(0);
                    expect(t['1.1'].tabularData.length).toBeGreaterThan(0);
                    resolve();
                },
                ['1.0', '1.1']
            );
        }));
});

describe('BED fetcher with too many custom fields', () => {
    const dataConfig: BedDataConfig = {
        type: 'bed',
        url: 'https://s3.amazonaws.com/gosling-lang.org/data/COVID/sars-cov-2_Sprot_annot_sorted.bed',
        customFields: ['col3', 'col4'],
        assembly: [['NC_045512.2', 29903]],
        sampleLength: 1000
    };
    const fetcher = new BedDataFetcherClass(dataConfig);

    it('throws an error', () =>
        new Promise<void>(resolve => {
            expect(() => fetcher.fetchTilesDebounced(() => {}, [])).toThrowError();
            resolve();
        }));
});

describe('BED fetcher with a custom field', () => {
    const dataConfig: BedDataConfig = {
        type: 'bed',
        url: 'https://s3.amazonaws.com/gosling-lang.org/data/COVID/sars-cov-2_Sprot_annot_sorted.bed',
        customFields: ['my_custom_field'],
        assembly: [['NC_045512.2', 29903]],
        sampleLength: 1000
    };
    const fetcher = new BedDataFetcherClass(dataConfig);

    it('has tile metadata', () =>
        new Promise<void>(resolve => {
            fetcher.tilesetInfo((info: TilesetInfo) => {
                expect(info).toMatchInlineSnapshot(`
                  {
                    "max_pos": [
                      29903,
                      29903,
                    ],
                    "max_width": 29903,
                    "max_zoom": 5,
                    "min_pos": [
                      0,
                      0,
                    ],
                    "tile_size": 1024,
                  }
                `);
                resolve();
            });
        }));

    it('expects a custom column', () =>
        new Promise<void>(resolve => {
            fetcher.fetchTilesDebounced(
                loadedTile => {
                    expect(Object.keys(loadedTile['0.0'].tabularData[0])).toMatchInlineSnapshot(`
                      [
                        "chrom",
                        "chromStart",
                        "chromEnd",
                        "my_custom_field",
                      ]
                    `);
                },
                ['0.0']
            );
            resolve();
        }));
});
