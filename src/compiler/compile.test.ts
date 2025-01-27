import { EX_SPEC_VISUAL_ENCODING } from '../../editor/example/json-spec/visual-encoding';
import { compile } from './compile';
import { getTheme } from '../core/utils/theme';
import type { GoslingSpec } from '../index';
import { convertToFlatTracks } from './spec-preprocess';
import type { SingleView } from '@gosling-lang/gosling-schema';
import { spreadTracksByData } from '../core/utils/overlay';

describe('compile', () => {
    it('compile should not touch the original spec of users', () => {
        const spec = JSON.parse(JSON.stringify(EX_SPEC_VISUAL_ENCODING));
        compile(spec, [], getTheme(), {});
        expect(JSON.stringify(spec)).toEqual(JSON.stringify(EX_SPEC_VISUAL_ENCODING));
    });
});

describe('Create correct mapping table between Gosling track IDs and HiGlass view IDs', () => {
    it('track.id === view.uid', () => {
        const spec: GoslingSpec = {
            tracks: [
                {
                    id: 'track-id',
                    data: {
                        type: 'csv',
                        url: ''
                    },
                    mark: 'rect',
                    width: 100,
                    height: 100
                }
            ]
        };
        const { hg } = compile(spec, [], getTheme(), {});
        expect(hg).not.toBeUndefined();
        expect(hg.views).toHaveLength(1);
        expect(hg.views[0].uid).toEqual('track-id');
    });
    it('Track IDs should not be lost in overlaid tracks', () => {
        const spec: GoslingSpec = {
            views: [
                {
                    tracks: [{ id: 's1' }, { id: 's2' }, { id: 's3' }]
                },
                {
                    id: 'o-root',
                    alignment: 'overlay',
                    tracks: [{ id: 'o1' }, { id: 'o2' }, { id: 'o3' }]
                }
            ]
        };
        const { idTable } = compile(spec, [], getTheme(), {});
        expect(idTable).toMatchInlineSnapshot(`
          {
            "overlay-0060b963": "overlay-0060b963",
            "overlay-01333c96": "overlay-0060b963",
            "overlay-c09472ed": "overlay-0060b963",
            "s1": "s1",
            "s2": "s2",
            "s3": "s3",
          }
        `);
    });
    it('Used the root level ID in overlaid tracks when IDs are missing in children', () => {
        const spec: GoslingSpec = {
            views: [
                {
                    tracks: [{ id: 's1' }, { id: 's2' }, { id: 's3' }]
                },
                {
                    id: 'o-root',
                    alignment: 'overlay',
                    tracks: [{}, {}, {}]
                }
            ]
        };
        const { idTable } = compile(spec, [], getTheme(), {});
        expect(idTable).toMatchInlineSnapshot(`
          {
            "overlay-00f09e56": "overlay-05a20c4b",
            "overlay-05a20c4b": "overlay-05a20c4b",
            "overlay-24213255": "overlay-05a20c4b",
            "s1": "s1",
            "s2": "s2",
            "s3": "s3",
          }
        `);
    });
    const nestedSpec: GoslingSpec = {
        views: [
            {
                tracks: [
                    { id: 's1' },
                    { id: 's2' },
                    {
                        alignment: 'overlay',
                        tracks: [{ id: 'o1' }, { id: 'o2' }, { id: 'o3' }]
                    }
                ]
            },
            {
                alignment: 'overlay',
                tracks: [{ id: 'o4' }, { id: 'o5' }, { id: 'o6' }]
            }
        ]
    };
    it('Track IDs should not be lost in nested tracks', () => {
        const { idTable } = compile(nestedSpec, [], getTheme(), {});
        expect(idTable).toMatchInlineSnapshot(`
          {
            "overlay-21bdbf2c": "overlay-c2e233f4",
            "overlay-2dc0acc6": "overlay-f22dcbdb",
            "overlay-4a9c9909": "overlay-c2e233f4",
            "overlay-52434a1a": "overlay-f22dcbdb",
            "overlay-c2e233f4": "overlay-c2e233f4",
            "overlay-f22dcbdb": "overlay-f22dcbdb",
            "s1": "s1",
            "s2": "s2",
          }
        `);
    });
    it('Track IDs should not be lost in circular views', () => {
        const { idTable } = compile({ ...nestedSpec, layout: 'circular' }, [], getTheme(), {});
        expect(idTable).toMatchInlineSnapshot(`
          {
            "overlay-1d9d3e7a": "overlay-627b7a59",
            "overlay-627b7a59": "overlay-627b7a59",
            "overlay-8830f812": "overlay-8830f812",
            "overlay-c86ef1f9": "overlay-8830f812",
            "overlay-c921c934": "overlay-8830f812",
            "overlay-d5930d20": "overlay-627b7a59",
            "s1": "s1",
            "s2": "s2",
          }
        `);
    });
});

describe('Dummy track', () => {
    it('compiles when layout linear', () => {
        const spec: GoslingSpec = {
            tracks: [
                {
                    type: 'dummy-track',
                    id: 'my-dummy-track',
                    title: 'Placeholder',
                    style: {
                        background: '#000',
                        textFontSize: 10,
                        textStroke: 'normal',
                        textStrokeWidth: 0.2
                    }
                }
            ],
            layout: 'linear'
        };
        const { hg } = compile(spec, [], getTheme(), {});
        expect(hg.views[0].tracks.top).toMatchInlineSnapshot(`
          [
            {
              "height": 130,
              "options": {
                "background": "#000",
                "height": 130,
                "textFontSize": 10,
                "textStroke": "normal",
                "textStrokeWidth": 0.2,
                "title": "Placeholder",
                "width": 600,
              },
              "type": "dummy-track",
              "width": 600,
            },
          ]
        `);
    });
    it('gets filtered out when layout circular', () => {
        const spec: GoslingSpec = {
            tracks: [
                {
                    type: 'dummy-track',
                    id: 'dummy-1'
                },
                {
                    id: 'track-id',
                    data: {
                        type: 'csv',
                        url: ''
                    },
                    mark: 'rect',
                    width: 100,
                    height: 100
                }
            ],
            layout: 'circular'
        };
        const { hg } = compile(spec, [], getTheme(), {});
        expect(hg.views).toHaveLength(1);
        expect(hg.views[0].tracks).not.toBeUndefined();
    });
});

describe('Compiler with UrlToFetchOptions', () => {
    it('passes UrlToFetchOptions to the data fetcher', () => {
        const urlToFetchOptions = { 'https://my-csv-url.com': { headers: { Authentication: 'Bearer 1234' } } };
        const spec: GoslingSpec = {
            tracks: [
                {
                    id: 'track-id',
                    data: {
                        type: 'csv',
                        url: 'https://my-csv-url.com'
                    },
                    mark: 'rect',
                    width: 100,
                    height: 100
                }
            ]
        };
        const { hg } = compile(spec, [], getTheme(), {}, urlToFetchOptions);
        expect(hg.views[0].tracks.center[0].contents[0].data).toMatchInlineSnapshot(`
                  {
                    "assembly": "hg38",
                    "indexUrlFetchOptions": {},
                    "type": "csv",
                    "url": "https://my-csv-url.com",
                    "urlFetchOptions": {
                      "headers": {
                        "Authentication": "Bearer 1234",
                      },
                    },
                    "x": undefined,
                    "x1": undefined,
                    "x1e": undefined,
                    "xe": undefined,
                  }
                `);
    });

    it('passes UrlToFetchOptions and IndexUrlFetchOptions to the data fetcher', () => {
        const urlToFetchOptions = {
            'https://file.gff': { headers: { Authentication: 'Bearer 1234' } },
            'https://file.gff.tbi': { headers: { Authentication: 'Bearer 4321' } }
        };
        const spec: GoslingSpec = {
            tracks: [
                {
                    id: 'track-id',
                    data: {
                        type: 'gff',
                        url: 'https://file.gff',
                        indexUrl: 'https://file.gff.tbi'
                    },
                    mark: 'rect',
                    width: 100,
                    height: 100
                }
            ]
        };
        const { hg } = compile(spec, [], getTheme(), {}, urlToFetchOptions);
        expect(hg.views[0].tracks.center[0].contents[0].data).toMatchInlineSnapshot(`
                  {
                    "assembly": "hg38",
                    "indexUrl": "https://file.gff.tbi",
                    "indexUrlFetchOptions": {
                      "headers": {
                        "Authentication": "Bearer 4321",
                      },
                    },
                    "type": "gff",
                    "url": "https://file.gff",
                    "urlFetchOptions": {
                      "headers": {
                        "Authentication": "Bearer 1234",
                      },
                    },
                    "x": undefined,
                    "x1": undefined,
                    "x1e": undefined,
                    "xe": undefined,
                  }
                `);
    });
});

describe('Maintain IDs', () => {
    it('Overlaid tracks', () => {
        const twoTracksWithDiffData: SingleView = {
            alignment: 'overlay',
            tracks: [
                {
                    id: 'first',
                    data: { type: 'csv', url: 'http://abc' }
                },
                {
                    id: 'second',
                    data: { type: 'csv', url: 'http://def' }
                }
            ]
        };
        const flattened = convertToFlatTracks(twoTracksWithDiffData);
        const spread = spreadTracksByData(flattened);
        expect(spread.map(d => d.id)).toEqual(['first', 'second']);
    });
});
