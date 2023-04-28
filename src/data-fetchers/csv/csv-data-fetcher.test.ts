import type { TilesetInfo } from '@higlass/types';
import CsvDataFetcher, { type LoadedTiles, CsvDataFetcherClass } from './csv-data-fetcher';
import fetch from 'cross-fetch';

if (!globalThis.fetch) globalThis.fetch = fetch;

describe('CSV data fetcher', () => {
    const fetcher = new (CsvDataFetcher as any)(
        {},
        {
            url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/cytogenetic_band.csv',
            type: 'csv',
            chromosomeField: 'Chr.',
            genomicFields: ['ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop']
        },
        {}
    ) as CsvDataFetcherClass;

    it('creates tileset metadata', () =>
        new Promise<void>(resolve => {
            fetcher.tilesetInfo((tile: TilesetInfo) => {
                expect(tile).toMatchInlineSnapshot(`
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

    it('parses and associates data with tiles', () =>
        new Promise<void>(resolve => {
            fetcher.fetchTilesDebounced(
                (loadedTile: LoadedTiles) => {
                    expect(Object.keys(loadedTile['0.0'].tabularData[0])).toMatchInlineSnapshot(`
                      [
                        "Chr.",
                        "Arm",
                        "Band",
                        "ISCN_start",
                        "ISCN_stop",
                        "Basepair_start",
                        "Basepair_stop",
                        "Stain",
                        "Density",
                      ]
                    `);
                    resolve();
                },
                ['0.0']
            );
        }));

    it('puts data into multiple tiles', () =>
        new Promise<void>(resolve => {
            fetcher.fetchTilesDebounced(
                (loadedTile: LoadedTiles) => {
                    expect(loadedTile['1.0']).not.toBeUndefined();
                    expect(loadedTile['1.1']).not.toBeUndefined();
                    expect(loadedTile['1.0'].tabularData.length).toBeGreaterThan(0);
                    expect(loadedTile['1.1'].tabularData.length).toBeGreaterThan(0);
                    resolve();
                },
                ['1.0', '1.1']
            );
        }));
});
