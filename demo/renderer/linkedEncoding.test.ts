import { describe, it, expect } from 'vitest';
import { getLinkedEncodings } from './linkedEncoding';

describe('Link tracks', () => {
    it('one track, one view', () => {
        const spec = {
            tracks: [{ id: 'track-1', x: { field: 'a', type: 'genomic' }, y: { field: 'b', type: 'quantitative' } }]
        };
        const result = getLinkedEncodings(spec);
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "linkingId": undefined,
              "signal": [
                0,
                3088269832,
              ],
              "tracks": [
                {
                  "encoding": "x",
                  "id": "track-1",
                },
              ],
            },
          ]
        `);
    });

    it('two tracks, one view', () => {
        const spec = {
            tracks: [
                { id: 'track-1', x: { field: 'a', type: 'genomic' }, y: { field: 'b', type: 'quantitative' } },
                { id: 'track-2', x: { field: 'a', type: 'genomic' }, y: { field: 'b', type: 'quantitative' } }
            ]
        };
        const result = getLinkedEncodings(spec);
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "linkingId": undefined,
              "signal": [
                0,
                3088269832,
              ],
              "tracks": [
                {
                  "encoding": "x",
                  "id": "track-1",
                },
                {
                  "encoding": "x",
                  "id": "track-2",
                },
              ],
            },
          ]
        `);
    });
    it('two view with one track each', () => {
        const spec = {
            views: [
                {
                    tracks: [
                        { id: 'track-1', x: { field: 'a', type: 'genomic' }, y: { field: 'b', type: 'quantitative' } }
                    ]
                },
                {
                    tracks: [
                        { id: 'track-2', x: { field: 'a', type: 'genomic' }, y: { field: 'b', type: 'quantitative' } }
                    ]
                }
            ]
        };
        const result = getLinkedEncodings(spec);
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "linkingId": undefined,
              "signal": [
                0,
                3088269832,
              ],
              "tracks": [
                {
                  "encoding": "x",
                  "id": "track-1",
                },
              ],
            },
            {
              "linkingId": undefined,
              "signal": [
                0,
                3088269832,
              ],
              "tracks": [
                {
                  "encoding": "x",
                  "id": "track-2",
                },
              ],
            },
          ]
        `);
    });
    it('linkingId', () => {
        const linkingTest = {
            title: 'Basic Marks: line',
            subtitle: 'Tutorial Examples',
            views: [
                {
                    tracks: [
                        {
                            layout: 'linear',
                            id: 'track-1',
                            mark: 'line',
                            x: { field: 'position', type: 'genomic', axis: 'bottom', linkingId: 'test' },
                            y: { field: 'peak', type: 'quantitative', axis: 'right' }
                        }
                    ]
                },
                {
                    linkingId: 'test',
                    tracks: [
                        {
                            layout: 'linear',
                            id: 'track-2',
                            mark: 'line',
                            x: { field: 'position', type: 'genomic', axis: 'bottom' },
                            y: { field: 'peak', type: 'quantitative', axis: 'right' }
                        }
                    ]
                },
                {
                    tracks: [
                        {
                            layout: 'linear',
                            id: 'track-3',
                            mark: 'line',
                            x: { field: 'position', type: 'genomic', axis: 'bottom' },
                            y: { field: 'peak', type: 'quantitative', axis: 'right' }
                        },
                        {
                            layout: 'linear',
                            id: 'overlay-1',
                            mark: 'line',
                            x: { field: 'position', type: 'genomic', axis: 'bottom', linkingId: 'test' },
                            y: { field: 'peak', type: 'quantitative', axis: 'right' }
                        }
                    ]
                }
            ]
        };
        // Test case 1
        const result1 = getLinkedEncodings(linkingTest);
        expect(result1).toMatchInlineSnapshot(`
          [
            {
              "linkingId": "test",
              "signal": [
                0,
                3088269832,
              ],
              "tracks": [
                {
                  "encoding": "x",
                  "id": "track-1",
                },
                {
                  "encoding": "x",
                  "id": "overlay-1",
                },
                {
                  "encoding": "x",
                  "id": "track-2",
                },
              ],
            },
            {
              "linkingId": undefined,
              "signal": [
                0,
                3088269832,
              ],
              "tracks": [
                {
                  "encoding": "x",
                  "id": "track-3",
                },
              ],
            },
          ]
        `);
    });
});

describe('Link brushes', () => {
    it('single unlinked brush ', () => {
        const spec = {
            tracks: [
                {
                    mark: 'brush',
                    id: 'brush-1',
                    x: { field: 'a', type: 'genomic' },
                    y: { field: 'b', type: 'quantitative' }
                }
            ]
        };
        const result = getLinkedEncodings(spec);
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "linkingId": undefined,
              "signal": [
                0,
                3088269832,
              ],
              "tracks": [
                {
                  "encoding": "x",
                  "id": "brush-1",
                },
              ],
            },
          ]
        `);
    });
    it('single linked brush ', () => {
        const spec = {
            views: [
                {
                    tracks: [
                        {
                            id: 'track-1',
                            x: { field: 'a', type: 'genomic' },
                            y: {
                                field: 'b',
                                type: 'quantitative'
                            },
                            _overlay: [
                                {
                                    mark: 'brush',
                                    id: 'brush-1',
                                    x: { field: 'a', type: 'genomic', linkingId: 'link1' },
                                    y: { field: 'b', type: 'quantitative' }
                                }
                            ]
                        }
                    ]
                },
                {
                    linkingId: 'link1',
                    tracks: [
                        { id: 'track-2', x: { field: 'a', type: 'genomic' }, y: { field: 'b', type: 'quantitative' } }
                    ]
                }
            ]
        };
        const result = getLinkedEncodings(spec);
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "linkingId": undefined,
              "signal": [
                0,
                3088269832,
              ],
              "tracks": [
                {
                  "encoding": "x",
                  "id": "brush-1",
                },
                {
                  "encoding": "x",
                  "id": "track-1",
                },
              ],
            },
            {
              "linkingId": "link1",
              "signal": [
                0,
                3088269832,
              ],
              "tracks": [
                {
                  "encoding": "brush",
                  "id": "brush-1",
                },
                {
                  "encoding": "x",
                  "id": "track-2",
                },
              ],
            },
          ]
        `);
    });
});

describe('Heatmap', () => {
    it('one track, one view', () => {
        const matrix = {
            xDomain: { chromosome: 'chr7', interval: [77700000, 81000000] },
            tracks: [
                {
                    id: 'matrix-1',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=hffc6-microc-hg38',
                        type: 'matrix'
                    },
                    mark: 'bar',
                    x: { field: 'xs', type: 'genomic', axis: 'none' },
                    xe: { field: 'xe', type: 'genomic', axis: 'none' },
                    y: { field: 'ys', type: 'genomic', axis: 'none' },
                    ye: { field: 'ye', type: 'genomic', axis: 'none' },
                    color: { field: 'value', type: 'quantitative', range: 'warm' },
                    width: 600,
                    height: 600
                }
            ]
        };

        const result = getLinkedEncodings(matrix);

        expect(result).toMatchInlineSnapshot(`
          [
            {
              "linkingId": undefined,
              "signal": [
                0,
                3088269832,
              ],
              "tracks": [
                {
                  "encoding": "x",
                  "id": "matrix-1",
                },
              ],
            },
            {
              linkingId: undefined,
              signal: [
                0,
                3088269832
              ],
              tracks: [
                {
                  encoding: "y",
                  id: "matrix-1"
                }
              ]
            }
          ]
        `);
    });
});
