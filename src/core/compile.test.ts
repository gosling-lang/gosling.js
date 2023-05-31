import { EX_SPEC_VISUAL_ENCODING } from '../../editor/example/json-spec/visual-encoding';
import { compile } from './compile';
import { getTheme } from './utils/theme';
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
    it('Track IDs should not be lost in nested tracks', () => {
        const spec: GoslingSpec = {
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
        compile(
            spec,
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
