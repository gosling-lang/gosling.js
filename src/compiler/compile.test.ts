import { EX_SPEC_VISUAL_ENCODING } from '../../editor/example/json-spec/visual-encoding';
import { compile } from './compile';
import { getTheme } from '../core/utils/theme';
import type { GoslingSpec } from '../index';

describe('compile', () => {
    it('compile should not touch the original spec of users', () => {
        const spec = JSON.parse(JSON.stringify(EX_SPEC_VISUAL_ENCODING));
        compile(spec, () => {}, [], getTheme(), {});
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
        compile(
            spec,
            h => {
                expect(h).not.toBeUndefined();
                expect(h.views).toHaveLength(1);
                expect(h.views[0].uid).toEqual('track-id');
            },
            [],
            getTheme(),
            {}
        );
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
        compile(
            spec,
            (h, s, g, t, table) => {
                expect(table).toMatchInlineSnapshot(`
                  {
                    "o1": "o1",
                    "o2": "o1",
                    "o3": "o1",
                    "s1": "s1",
                    "s2": "s2",
                    "s3": "s3",
                  }
                `);
            },
            [],
            getTheme(),
            {}
        );
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
        compile(
            spec,
            (h, s, g, t, table) => {
                expect(table).toMatchInlineSnapshot(`
                  {
                    "o-root": "o-root",
                    "s1": "s1",
                    "s2": "s2",
                    "s3": "s3",
                  }
                `);
            },
            [],
            getTheme(),
            {}
        );
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
        compile(
            nestedSpec,
            (h, s, g, t, table) => {
                expect(table).toMatchInlineSnapshot(`
                  {
                    "o1": "o1",
                    "o2": "o1",
                    "o3": "o1",
                    "o4": "o4",
                    "o5": "o4",
                    "o6": "o4",
                    "s1": "s1",
                    "s2": "s2",
                  }
                `);
            },
            [],
            getTheme(),
            {}
        );
    });
    it('Track IDs should not be lost in circular views', () => {
        compile(
            { ...nestedSpec, layout: 'circular' },
            (h, s, g, t, table) => {
                expect(table).toMatchInlineSnapshot(`
                  {
                    "o1": "o1",
                    "o2": "o1",
                    "o3": "o1",
                    "o4": "o4",
                    "o5": "o4",
                    "o6": "o4",
                    "s1": "s1",
                    "s2": "s2",
                  }
                `);
            },
            [],
            getTheme(),
            {}
        );
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
        compile(
            spec,
            hgSpec => {
                expect(hgSpec.views[0].tracks.top).toMatchInlineSnapshot(`
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
            },
            [],
            getTheme(),
            {}
        );
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
        compile(
            spec,
            hgSpec => {
                expect(hgSpec.views).toHaveLength(1);
                expect(hgSpec.views[0].tracks).not.toBeUndefined();
            },
            [],
            getTheme(),
            {}
        );
    });
});
