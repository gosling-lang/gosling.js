import { RawDataFetcher } from '../../src/higlass-raw-datafetcher';

describe('CSV data fetcher', () => {
    const f = new (RawDataFetcher as any)(
        {},
        {
            type: 'csv',
            values: [{ chr: 'chr1', start: 1, end: 778094, id: 'peak1', peak: 4.38368 }],
            chromosomeField: 'Chr.',
            genomicFields: ['ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop'],
            quantitativeFields: ['Band', 'Density']
        }
    );

    it('Tileset meatadata', done => {
        f.tilesetInfo((t: any) => {
            expect(t.tile_size).toEqual(1024);
            done();
        });
    });

    it('Tile', done => {
        f.fetchTilesDebounced(
            (t: any) => {
                expect(t['0.0']).not.toBeUndefined();
                done();
            },
            ['0.0']
        );
    });

    it('Two tiles', done => {
        f.fetchTilesDebounced(
            (t: any) => {
                expect(t['1.0']).not.toBeUndefined();
                expect(t['1.1']).not.toBeUndefined();
                done();
            },
            ['1.0', '1.1']
        );
    });
});
