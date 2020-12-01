import { CSVDataFetcher } from '../../src/higlass-csv-datafetcher';

describe('CSV data fetcher', () => {
    const f = new (CSVDataFetcher as any)(
        {},
        {
            url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/cytogenetic_band.csv',
            type: 'csv',
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
                expect(t['0.0'].tabularData.length).toBeGreaterThan(0);
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
                expect(t['1.0'].tabularData.length).toBeGreaterThan(0);
                expect(t['1.1'].tabularData.length).toBeGreaterThan(0);
                done();
            },
            ['1.0', '1.1']
        );
    });
});
