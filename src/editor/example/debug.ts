import { GoslingSpec } from '../../core/gosling.schema';

export const EX_SPEC_DEBUG: GoslingSpec = {
    title: 'Between-Connectivity In 2D Tracks',
    subtitle: 'Between-link examples with three types, i.e., straight, corner, and curve',
    xDomain: { interval: [0, 1000000000] },
    views: [
        {
            arrangement: 'horizontal',
            views: [
                {
                    tracks: [
                        {
                            title: 'Straight Connection',
                            alignment: 'overlay',
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                                type: 'csv',
                                chromosomeField: 'c2',
                                genomicFields: ['s1', 'e1', 's2', 'e2']
                            },
                            style: { linkConnectionType: 'straight' },
                            tracks: [
                                {
                                    mark: 'betweenLink',
                                    x: {
                                        field: 's1',
                                        type: 'genomic',
                                        axis: 'top'
                                    },
                                    y: {
                                        field: 's2',
                                        type: 'genomic',
                                        axis: 'left'
                                    }
                                },
                                {
                                    mark: 'betweenLink',
                                    y: {
                                        field: 's1',
                                        type: 'genomic',
                                        axis: 'top'
                                    },
                                    x: {
                                        field: 's2',
                                        type: 'genomic',
                                        axis: 'left'
                                    }
                                }
                            ],
                            color: { value: '#3275B4' },
                            size: { value: 2 },
                            stroke: { value: '#3275B4' },
                            opacity: { value: 0.2 },
                            width: 500,
                            height: 500
                        }
                    ]
                },
                {
                    tracks: [
                        {
                            title: 'Cornered Connection',
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
                                    x: {
                                        field: 's1',
                                        type: 'genomic',
                                        axis: 'top'
                                    },
                                    y: {
                                        field: 's2',
                                        type: 'genomic',
                                        axis: 'left'
                                    }
                                },
                                {
                                    mark: 'betweenLink',
                                    y: {
                                        field: 's1',
                                        type: 'genomic',
                                        axis: 'top'
                                    },
                                    x: {
                                        field: 's2',
                                        type: 'genomic',
                                        axis: 'left'
                                    }
                                },
                                {
                                    mark: 'point',
                                    x: {
                                        field: 's1',
                                        type: 'genomic',
                                        axis: 'top'
                                    },
                                    y: {
                                        field: 's2',
                                        type: 'genomic',
                                        axis: 'left'
                                    },
                                    opacity: { value: 1 }
                                },
                                {
                                    mark: 'point',
                                    y: {
                                        field: 's1',
                                        type: 'genomic',
                                        axis: 'top'
                                    },
                                    x: {
                                        field: 's2',
                                        type: 'genomic',
                                        axis: 'left'
                                    },
                                    opacity: { value: 1 }
                                }
                            ],
                            color: { value: 'black' },
                            size: { value: 1 },
                            stroke: { value: '#3275B4' },
                            opacity: { value: 0.2 },
                            width: 500,
                            height: 500
                        }
                    ]
                }
            ]
        },
        {
            tracks: [
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
                    style: { linkConnectionType: 'curve' },
                    tracks: [
                        {
                            mark: 'betweenLink',
                            x: {
                                field: 's1',
                                type: 'genomic',
                                axis: 'top'
                            },
                            y: {
                                field: 's2',
                                type: 'genomic',
                                axis: 'left'
                            }
                        },
                        {
                            mark: 'betweenLink',
                            y: {
                                field: 's1',
                                type: 'genomic',
                                axis: 'top'
                            },
                            x: {
                                field: 's2',
                                type: 'genomic',
                                axis: 'left'
                            }
                        }
                    ],
                    color: { value: 'black' },
                    size: { value: 1 },
                    stroke: { value: '#3275B4' },
                    opacity: { value: 0.2 },
                    width: 500,
                    height: 500
                }
            ]
        }
        // {
        //     tracks: [
        //         {
        //             data: {
        //                 url: 'https://raw.githubusercontent.com/vigsterkr/circos/master/data/5/segdup.txt',
        //                 type: 'csv',
        //                 headerNames: ['id', 'chr', 'p1', 'p2'],
        //                 chromosomePrefix: 'hs',
        //                 chromosomeField: 'chr',
        //                 genomicFields: ['p1', 'p2'],
        //                 separator: ' ',
        //                 longToWideId: 'id',
        //                 sampleLength: 1000
        //             },
        //             mark: 'point',
        //             y: { field: 'p1', type: 'genomic', axis: 'left' },
        //             x: { field: 'p2', type: 'genomic', axis: 'top' },
        //             size: { value: 6 },
        //             opacity: { value: 0.4 },
        //             width: 500,
        //             height: 500
        //         }
        //     ]
        // },
    ]
};
