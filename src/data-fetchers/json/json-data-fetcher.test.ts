import JsonDataFetcher from './json-data-fetcher';

describe('JSON data fetcher', () => {
    const f = new (JsonDataFetcher as any)(
        {},
        {
            type: 'json',
            values: [{ chr: 'chr1', start: 1, end: 778094, id: 'peak1', peak: 4.38368 }],
            chromosomeField: 'Chr.',
            genomicFields: ['ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop']
        }
    );

    it('Tileset meatadata', () =>
        new Promise<void>(resolve => {
            f.tilesetInfo((t: any) => {
                expect(t.tile_size).toEqual(1024);
                resolve();
            });
        }));

    it('Tile', () =>
        new Promise<void>(resolve => {
            f.fetchTilesDebounced(
                (t: any) => {
                    expect(t['0.0']).not.toBeUndefined();
                    resolve();
                },
                ['0.0']
            );
        }));

    it('Two tiles', () =>
        new Promise<void>(resolve => {
            f.fetchTilesDebounced(
                (t: any) => {
                    expect(t['1.0']).not.toBeUndefined();
                    expect(t['1.1']).not.toBeUndefined();
                    resolve();
                },
                ['1.0', '1.1']
            );
        }));
});

describe('JSON data fetcher', () => {
    const fetcher = new (JsonDataFetcher as any)(
        {},
        {
            type: 'json',
            genomicFieldsToConvert: [
                {
                    chromosomeField: 'chr1',
                    genomicFields: ['start1', 'end1']
                },
                {
                    chromosomeField: 'chr2',
                    genomicFields: ['start2', 'end2']
                }
            ],
            values: [
                {
                    chr1: 'chr1',
                    start1: 1221574,
                    end1: 1221575,
                    chr2: 'chr13',
                    start2: 36001515,
                    end2: 36001516
                },
                {
                    chr1: 'chr10',
                    start1: 9257519,
                    end1: 9257520,
                    chr2: 'chr18',
                    start2: 82441834,
                    end2: 82441835
                }
            ]
        }
    );

    it('converts genomic fields correctly', () =>
        new Promise<void>(resolve => {
            fetcher.fetchTilesDebounced(
                (loadedTile: any) => {
                    expect(loadedTile['0.0'].tabularData).toMatchInlineSnapshot(`
                      [
                        {
                          "chr1": "chr1",
                          "chr2": "chr13",
                          "end1": "1221575",
                          "end2": "2113044498",
                          "start1": "1221574",
                          "start2": "2113044497",
                        },
                        {
                          "chr1": "chr10",
                          "chr2": "chr18",
                          "end1": "1684141149",
                          "end2": "2656479838",
                          "start1": "1684141148",
                          "start2": "2656479837",
                        },
                      ]
                    `);
                    resolve();
                },
                ['0.0']
            );
        }));
});
