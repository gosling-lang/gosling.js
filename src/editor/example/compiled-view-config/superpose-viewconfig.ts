import { View } from '../../../core/higlass.schema';

export const SUPERPOSE_VIEWCONFIG: View = {
    genomePositionSearchBoxVisible: false,
    layout: { x: 0, y: 0, w: 6, h: 12 },
    tracks: {
        top: [],
        left: [],
        center: [
            {
                type: 'combined',
                width: 210,
                height: 210,
                contents: [
                    // {
                    //     "type": "gemini-track",
                    //     "width": 110,
                    //     "height": 110,
                    //     "options": {
                    //       "spec": {
                    //         "superpose": [
                    //           {
                    //             "mark": "link",
                    //             "x": {
                    //               "field": "s1",
                    //               "type": "genomic",
                    //               "domain": {
                    //                 "chromosome": "1",
                    //                 "interval": [103900000, 104100000]
                    //               },
                    //               "linker": "link-3"
                    //             },
                    //             "xe": {"field": "e1", "type": "genomic"},
                    //             "x1": {
                    //               "field": "s2",
                    //               "type": "genomic",
                    //               "domain": {"chromosome": "1"}
                    //             },
                    //             "x1e": {"field": "e2", "type": "genomic"}
                    //           }
                    //         ],
                    //         "color": {"field": "s1", "type": "nominal"},
                    //         "stroke": {"value": "steelblue"},
                    //         "opacity": {"value": 0.4},
                    //         "style": {"circularLink": true},
                    //         "outerRadius": 100,
                    //         "innerRadius": 80,
                    //         "circularLayout": false,
                    //         "width": 210,
                    //         "height": 210
                    //       }
                    //     },
                    //     "data": {
                    //       "url": "https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt",
                    //       "type": "csv",
                    //       "chromosomeField": "c2",
                    //       "genomicFields": ["s1", "e1", "s2", "e2"]
                    //     }
                    // },
                    {
                        type: 'gemini-track',
                        server: 'https://resgen.io/api/v1/',
                        tilesetUid: 'UvVPeLHuRDiYA3qwFlm7xQ',
                        width: 210,
                        height: 210,
                        options: {
                            backgroundColor: 'transparent',
                            spec: {
                                metadata: {
                                    type: 'higlass-multivec',
                                    row: 'sample',
                                    column: 'position',
                                    value: 'peak',
                                    bin: 4,
                                    categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                                },
                                mark: 'rect',
                                x: {
                                    field: 'start',
                                    type: 'genomic',
                                    domain: { chromosome: '6' },
                                    linker: 'link-1'
                                },
                                xe: { field: 'end', type: 'genomic' },
                                row: { field: 'sample', type: 'nominal' },
                                color: {
                                    field: 'peak',
                                    type: 'quantitative',
                                    range: 'spectral'
                                },
                                outerRadius: 100,
                                innerRadius: 50,
                                zoomable: false,
                                circularLayout: true,
                                width: 210,
                                height: 210
                            }
                        }
                    },
                    {
                        type: 'gemini-track',
                        server: 'https://resgen.io/api/v1/',
                        tilesetUid: 'UvVPeLHuRDiYA3qwFlm7xQ',
                        width: 210,
                        height: 210,
                        options: {
                            backgroundColor: 'transparent',
                            spec: {
                                metadata: {
                                    type: 'higlass-multivec',
                                    row: 'sample',
                                    column: 'position',
                                    value: 'peak',
                                    bin: 4,
                                    categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                                },
                                mark: 'point',
                                x: {
                                    field: 'start',
                                    type: 'genomic',
                                    domain: { chromosome: '6' },
                                    linker: 'link-1'
                                },
                                xe: { field: 'end', type: 'genomic' },
                                row: { field: 'sample', type: 'nominal' },
                                y: {
                                    field: 'peak',
                                    type: 'quantitative'
                                },
                                outerRadius: 170,
                                innerRadius: 100,
                                zoomable: false,
                                circularLayout: true,
                                width: 210,
                                height: 110
                            }
                        }
                    }
                ]
            }
        ],
        right: [],
        bottom: [],
        gallery: [],
        whole: []
    },
    initialXDomain: [1062541960, 1233657027],
    initialYDomain: [0, 3095693983],
    zoomFixed: false,
    zoomLimits: [1, null]
};
