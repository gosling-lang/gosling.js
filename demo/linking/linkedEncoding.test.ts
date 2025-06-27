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
    it('same linkingId across multiple views', () => {
        const linkingTest = {
            views: [
                {
                    linkingId: 'link',
                    tracks: [
                        {
                            id: 'track-1',
                            mark: 'line',
                            x: { field: 'position', type: 'genomic', axis: 'bottom' },
                            y: { field: 'peak', type: 'quantitative', axis: 'right' }
                        }
                    ]
                },
                {
                    linkingId: 'link',
                    tracks: [
                        {
                            id: 'track-2',
                            mark: 'line',
                            x: { field: 'position', type: 'genomic', axis: 'bottom' },
                            y: { field: 'peak', type: 'quantitative', axis: 'right' }
                        }
                    ]
                },
                {
                    linkingId: 'link',
                    tracks: [
                        {
                            id: 'track-3',
                            mark: 'line',
                            x: { field: 'position', type: 'genomic', axis: 'bottom' },
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
            "linkingId": "link",
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
              {
                "encoding": "x",
                "id": "track-3",
              },
            ],
          },
        ]
      `);
    });

    it('domain in x encoding', () => {
        // When there is a domain in the x encoding we expect it to be used as the signal
        const spec = {
            tracks: [
                {
                    id: 'track-9',
                    mark: 'withinLink',
                    x: {
                        field: 's1',
                        type: 'genomic',
                        domain: { chromosome: 'chr1', interval: [103900000, 104100000] }
                    }
                }
            ]
        };
        const result = getLinkedEncodings(spec);
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "linkingId": undefined,
              "signal": [
                103900000,
                104100000,
              ],
              "tracks": [
                {
                  "encoding": "x",
                  "id": "track-9",
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
                    ye: { field: 'ye', type: 'genomic', axis: 'none' }
                }
            ]
        };

        const result = getLinkedEncodings(matrix);

        expect(result).toMatchInlineSnapshot(`
          [
            {
              "linkingId": undefined,
              "signal": [
                1309704303,
                1313004303,
              ],
              "tracks": [
                {
                  "encoding": "x",
                  "id": "matrix-1",
                },
              ],
            },
            {
              "linkingId": undefined,
              "signal": [
                1309704303,
                1313004303,
              ],
              "tracks": [
                {
                  "encoding": "y",
                  "id": "matrix-1",
                },
              ],
            },
          ]
        `);
    });
    it('multiple y linking', () => {
        const matrix = {
            xDomain: { chromosome: 'chr7', interval: [77700000, 81000000] },
            tracks: [
                {
                    id: 'matrix-1',
                    mark: 'bar',
                    x: { field: 'xs', type: 'genomic', axis: 'none' },
                    xe: { field: 'xe', type: 'genomic', axis: 'none' },
                    y: { field: 'ys', type: 'genomic', axis: 'none' },
                    ye: { field: 'ye', type: 'genomic', axis: 'none' }
                },
                {
                    id: 'matrix-2',
                    mark: 'bar',
                    x: { field: 'xs', type: 'genomic', axis: 'none' },
                    y: { field: 'ys', type: 'genomic', axis: 'none' }
                }
            ]
        };

        const result = getLinkedEncodings(matrix);

        expect(result).toMatchInlineSnapshot(`
        [
          {
            "linkingId": undefined,
            "signal": [
              1309704303,
              1313004303,
            ],
            "tracks": [
              {
                "encoding": "x",
                "id": "matrix-1",
              },
              {
                "encoding": "x",
                "id": "matrix-2",
              },
            ],
          },
          {
            "linkingId": undefined,
            "signal": [
              1309704303,
              1313004303,
            ],
            "tracks": [
              {
                "encoding": "y",
                "id": "matrix-1",
              },
              {
                "encoding": "y",
                "id": "matrix-2",
              },
            ],
          },
        ]
      `);
    });
});
