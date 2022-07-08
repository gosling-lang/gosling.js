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
