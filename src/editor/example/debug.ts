import { GoslingSpec } from '../../core/gosling.schema';

export const EX_SPEC_DEBUG: GoslingSpec = {
    title: 'Between-Connectivity In 2D Tracks',
    subtitle: 'Between-link examples with three types, i.e., straight, corner, and curve',
    xDomain: { interval: [0, 1000000000] },
    views: [
        {
            linkingId: '-',
            spacing: 0,
            arrangement: 'horizontal',
            views: [
                {
                    yOffset: 130,
                    spacing: 0,
                    orientation: 'vertical',
                    tracks: [
                        {
                            alignment: 'overlay',
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                                type: 'csv',
                                chromosomeField: 'c2',
                                genomicFields: ['s1', 'e1', 's2', 'e2']
                            },
                            style: { linkConnectionType: 'corner', outlineWidth: 0.5 },
                            tracks: [
                                {
                                    mark: 'withinLink',
                                    x: { field: 's1', type: 'genomic', axis: 'none' },
                                    xe: { field: 's2', type: 'genomic' }
                                }
                            ],
                            flipY: false,
                            color: { value: '#3275B4' },
                            size: { value: 2 },
                            stroke: { value: '#3275B4' },
                            opacity: { value: 0.2 },
                            width: 100,
                            height: 500
                        }
                    ]
                },
                {
                    tracks: [
                        {
                            alignment: 'overlay',
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                                type: 'csv',
                                chromosomeField: 'c2',
                                genomicFields: ['s1', 'e1', 's2', 'e2']
                            },
                            style: { linkConnectionType: 'corner', outlineWidth: 0.5 },
                            tracks: [
                                {
                                    mark: 'withinLink',
                                    x: { field: 's1', type: 'genomic', axis: 'top' },
                                    xe: { field: 's2', type: 'genomic' }
                                }
                            ],
                            flipY: false,
                            color: { value: '#3275B4' },
                            size: { value: 2 },
                            stroke: { value: '#3275B4' },
                            opacity: { value: 0.2 },
                            width: 500,
                            height: 100
                        },
                        {
                            title: 'Curved Connection',
                            alignment: 'overlay',
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                                type: 'csv',
                                chromosomeField: 'c2',
                                genomicFields: ['s1', 'e1', 's2', 'e2']
                            },
                            style: { linkConnectionType: 'corner' },
                            tracks: [
                                {
                                    mark: 'betweenLink',
                                    x: { field: 's1', type: 'genomic', axis: 'none' },
                                    y: { field: 's2', type: 'genomic', axis: 'none' }
                                },
                                {
                                    mark: 'betweenLink',
                                    y: { field: 's1', type: 'genomic', axis: 'none' },
                                    x: { field: 's2', type: 'genomic', axis: 'none' }
                                },
                                {
                                    mark: 'point',
                                    x: { field: 's1', type: 'genomic', axis: 'none' },
                                    y: { field: 's2', type: 'genomic', axis: 'none' },
                                    opacity: { value: 1 }
                                },
                                {
                                    mark: 'point',
                                    y: { field: 's1', type: 'genomic', axis: 'none' },
                                    x: { field: 's2', type: 'genomic', axis: 'none' },
                                    opacity: { value: 1 }
                                }
                            ],
                            color: { value: '#3275B4' },
                            size: { value: 1 },
                            stroke: { value: '#3275B4' },
                            opacity: { value: 0.2 },
                            width: 500,
                            height: 500
                        }
                    ]
                }
            ]
        }
        // {
        //   "arrangement": "horizontal",
        //   "views": [
        //     {
        //       "tracks": [
        //         {
        //           "title": "Straight Connection",
        //           "alignment": "overlay",
        //           "data": {
        //             "url": "https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt",
        //             "type": "csv",
        //             "chromosomeField": "c2",
        //             "genomicFields": ["s1", "e1", "s2", "e2"]
        //           },
        //           "style": {"linkConnectionType": "straight"},
        //           "tracks": [
        //             {
        //               "mark": "betweenLink",
        //               "x": {"field": "s1", "type": "genomic", "axis": "top"},
        //               "y": {"field": "s2", "type": "genomic", "axis": "left"}
        //             },
        //             {
        //               "mark": "betweenLink",
        //               "y": {"field": "s1", "type": "genomic", "axis": "top"},
        //               "x": {"field": "s2", "type": "genomic", "axis": "left"}
        //             }
        //           ],
        //           "color": {"value": "#3275B4"},
        //           "size": {"value": 2},
        //           "stroke": {"value": "#3275B4"},
        //           "opacity": {"value": 0.2},
        //           "width": 500,
        //           "height": 500
        //         }
        //       ]
        //     },
        //     {
        //       "tracks": [
        //         {
        //           "title": "Cornered Connection",
        //           "alignment": "overlay",
        //           "data": {
        //             "url": "https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt",
        //             "type": "csv",
        //             "chromosomeField": "c2",
        //             "genomicFields": ["s1", "e1", "s2", "e2"]
        //           },
        //           "style": {"linkConnectionType": "corner"},
        //           "tracks": [
        //             {
        //               "mark": "betweenLink",
        //               "x": {"field": "s1", "type": "genomic", "axis": "top"},
        //               "y": {"field": "s2", "type": "genomic", "axis": "left"}
        //             },
        //             {
        //               "mark": "betweenLink",
        //               "y": {"field": "s1", "type": "genomic", "axis": "top"},
        //               "x": {"field": "s2", "type": "genomic", "axis": "left"}
        //             },
        //             {
        //               "mark": "point",
        //               "x": {"field": "s1", "type": "genomic", "axis": "top"},
        //               "y": {"field": "s2", "type": "genomic", "axis": "left"},
        //               "opacity": {"value": 1}
        //             },
        //             {
        //               "mark": "point",
        //               "y": {"field": "s1", "type": "genomic", "axis": "top"},
        //               "x": {"field": "s2", "type": "genomic", "axis": "left"},
        //               "opacity": {"value": 1}
        //             }
        //           ],
        //           "color": {"value": "black"},
        //           "size": {"value": 1},
        //           "stroke": {"value": "#3275B4"},
        //           "opacity": {"value": 0.2},
        //           "width": 500,
        //           "height": 500
        //         }
        //       ]
        //     }
        //   ]
        // },
        // {
        //   "tracks": [
        //     {
        //       "title": "Curved Connection",
        //       "alignment": "overlay",
        //       "data": {
        //         "url": "https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt",
        //         "type": "csv",
        //         "chromosomeField": "c2",
        //         "genomicFields": ["s1", "e1", "s2", "e2"]
        //       },
        //       "style": {"linkConnectionType": "curve"},
        //       "tracks": [
        //         {
        //           "mark": "betweenLink",
        //           "x": {"field": "s1", "type": "genomic", "axis": "top"},
        //           "y": {"field": "s2", "type": "genomic", "axis": "left"}
        //         },
        //         {
        //           "mark": "betweenLink",
        //           "y": {"field": "s1", "type": "genomic", "axis": "top"},
        //           "x": {"field": "s2", "type": "genomic", "axis": "left"}
        //         }
        //       ],
        //       "color": {"value": "black"},
        //       "size": {"value": 1},
        //       "stroke": {"value": "#3275B4"},
        //       "opacity": {"value": 0.2},
        //       "width": 500,
        //       "height": 500
        //     }
        //   ]
        // }
    ]
};
