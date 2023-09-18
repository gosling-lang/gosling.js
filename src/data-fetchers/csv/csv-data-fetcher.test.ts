import { vi, describe, expect } from 'vitest';
import type { TilesetInfo } from '@higlass/types';
import CsvDataFetcher, { type LoadedTiles, CsvDataFetcherClass } from './csv-data-fetcher';
import { RemoteFile } from 'generic-filehandle';

/**
 * This mocks RemoteFile. It returns the contents of a csv file when the readFile method is called
 */
vi.mock('generic-filehandle', () => {
    const str = 'c1,s1,e1,c2,s2,e2\n1,486,76975,15,100263879,100338121\n1,342608,393885,15,100218755,100268630';
    const RemoteFile = vi.fn();
    RemoteFile.prototype.readFile = vi.fn().mockResolvedValue(str);
    RemoteFile.prototype.fetch = vi.fn();
    return {
        RemoteFile
    };
});

describe('CSV data fetcher', () => {
    const fetcher = new CsvDataFetcherClass({
        url: '',
        type: 'csv',
        chromosomeField: 'c1',
        genomicFields: ['s1', 'e1'],
        assembly: 'hg16'
    });

    it('creates tileset metadata', () =>
        new Promise<void>(resolve => {
            fetcher.tilesetInfo((tile: TilesetInfo) => {
                expect(tile).toMatchInlineSnapshot(`
                  {
                    "max_pos": [
                      3070144630,
                      3070144630,
                    ],
                    "max_width": 3070144630,
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
                    expect(loadedTile['0.0'].tabularData).toMatchInlineSnapshot(`
                      [
                        {
                          "c1": "1",
                          "c2": "15",
                          "e1": "76975",
                          "e2": "100338121",
                          "s1": "486",
                          "s2": "100263879",
                        },
                        {
                          "c1": "1",
                          "c2": "15",
                          "e1": "393885",
                          "e2": "100268630",
                          "s1": "342608",
                          "s2": "100218755",
                        },
                      ]
                    `);
                    resolve();
                },
                ['0.0']
            );
        }));
});

test('CSV data fetcher can take fetch options', () => {
    const overrides = {
        headers: {
            Authorization: 'Bearer 1234'
        }
    };
    new (CsvDataFetcher as any)(
        {},
        {
            url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/cytogenetic_band.csv',
            type: 'csv',
            chromosomeField: 'Chr.',
            genomicFields: ['ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop'],
            urlFetchOptions: overrides
        },
        {}
    ) as CsvDataFetcherClass;

    expect(RemoteFile).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/cytogenetic_band.csv',
        { overrides: overrides }
    );
});
