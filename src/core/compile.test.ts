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

describe('gosling track.id => higlass view.uid', () => {
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
});

describe('Dummy track', () => {
    it('can be compiled', () => {
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
            ]
        };
        compile(
            spec,
            hgSpec => {
                expect(hgSpec.views[0].tracks).toMatchInlineSnapshot(`
                  {
                    "bottom": [],
                    "center": [],
                    "gallery": [],
                    "left": [],
                    "right": [],
                    "top": [
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
                    ],
                    "whole": [],
                  }
                `);
            },
            [],
            getTheme(),
            {}
        );
    });
});
