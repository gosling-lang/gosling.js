import { BedDataFetcherClass, type BedDataConfig, type TilesetInfo } from './bed-data-fetcher';
import fetch from 'cross-fetch';

if (!globalThis.fetch) globalThis.fetch = fetch;

describe('BED fetcher', () => {
    const dataConfig: BedDataConfig = {
        type: 'bed',
        url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/275_peaks.bed',
        assembly: 'hg38'
    };

    const fetcher = new BedDataFetcherClass(dataConfig);

    it('Tileset meatadata', () =>
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

    it('Tile', () =>
        new Promise<void>(resolve => {
            fetcher.fetchTilesDebounced(
                (t: any) => {
                    expect(t['0.0']).not.toBeUndefined();
                    expect(t['0.0'].tabularData.length).toBeGreaterThan(0);
                    resolve();
                },
                ['0.0']
            );
        }));

    it('Two tiles', () =>
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
