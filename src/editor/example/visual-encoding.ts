import { GoslingSpec } from '../../core/gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const EX_SPEC_VISUAL_ENCODING: GoslingSpec = {
    title: 'Visual Encoding',
    subtitle: 'Gosling provides diverse visual encoding methods',
    layout: 'linear',
    arrangement: 'vertical',
    centerRadius: 0.8,
    xDomain: { chromosome: '1', interval: [1, 3000500] },
    views: [
        {
            tracks: [
                {
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4'],
                        binSize: 4
                    },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    row: { field: 'sample', type: 'nominal', legend: true },
                    color: { field: 'peak', type: 'quantitative' },
                    width: 600,
                    height: 130
                }
            ]
        },
        {
            tracks: [
                {
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                    },
                    mark: 'bar',
                    x: {
                        field: 'position',
                        type: 'genomic',
                        axis: 'top'
                    },
                    y: { field: 'peak', type: 'quantitative' },
                    row: { field: 'sample', type: 'nominal' },
                    color: { field: 'sample', type: 'nominal', legend: true },
                    width: 600,
                    height: 130
                }
            ]
        },
        {
            tracks: [
                {
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                    },
                    mark: 'bar',
                    x: {
                        field: 'position',
                        type: 'genomic',
                        axis: 'top'
                    },
                    y: { field: 'peak', type: 'quantitative' },
                    color: { field: 'sample', type: 'nominal', legend: true },
                    width: 600,
                    height: 130
                }
            ]
        },
        {
            alignment: 'overlay',
            data: {
                url: GOSLING_PUBLIC_DATA.multivec,
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            x: {
                field: 'position',
                type: 'genomic',
                axis: 'top'
            },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal', legend: true },
            tracks: [{ mark: 'line' }, { mark: 'point', size: { field: 'peak', type: 'quantitative', range: [0, 2] } }],
            width: 600,
            height: 130
        },
        {
            tracks: [
                {
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                    },
                    mark: 'point',
                    x: {
                        field: 'position',
                        type: 'genomic',
                        axis: 'top'
                    },
                    y: { field: 'peak', type: 'quantitative' },
                    row: { field: 'sample', type: 'nominal' },
                    size: { field: 'peak', type: 'quantitative' },
                    color: { field: 'sample', type: 'nominal', legend: true },
                    opacity: { value: 0.5 },
                    width: 600,
                    height: 130
                }
            ]
        },
        {
            tracks: [
                {
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                    },
                    mark: 'point',
                    x: {
                        field: 'position',
                        type: 'genomic',
                        axis: 'top'
                    },
                    y: { field: 'peak', type: 'quantitative' },
                    size: { field: 'peak', type: 'quantitative' },
                    color: { field: 'sample', type: 'nominal', legend: true },
                    opacity: { value: 0.5 },
                    width: 600,
                    height: 130
                }
            ]
        },
        {
            tracks: [
                {
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                    },
                    mark: 'area',
                    x: {
                        field: 'position',
                        type: 'genomic',
                        axis: 'top'
                    },
                    y: { field: 'peak', type: 'quantitative' },
                    row: { field: 'sample', type: 'nominal' },
                    color: { field: 'sample', type: 'nominal', legend: true },
                    stroke: { value: 'white' },
                    strokeWidth: { value: 0.5 },
                    width: 600,
                    height: 130
                }
            ]
        },
        {
            tracks: [
                {
                    data: {
                        url:
                            'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                        type: 'csv',
                        chromosomeField: 'c2',
                        genomicFields: ['s1', 'e1', 's2', 'e2']
                    },
                    mark: 'link',
                    x: {
                        field: 's1',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [103900000, 104100000] }
                    },
                    xe: {
                        field: 'e1',
                        type: 'genomic'
                    },
                    x1: {
                        field: 's2',
                        type: 'genomic',
                        domain: { chromosome: '1' }
                    },
                    x1e: {
                        field: 'e2',
                        type: 'genomic'
                    },
                    color: { value: '#0072B2' }, //field: 's1', type: 'nominal' },
                    stroke: { value: 'black' },
                    strokeWidth: { value: 0.5 },
                    opacity: { value: 0.2 },
                    width: 600,
                    height: 130
                }
            ]
        }
    ]
};

export const EX_SPEC_VISUAL_ENCODING_CIRCULAR: GoslingSpec = {
    title: 'Visual Encoding in Circular Layouts',
    subtitle: 'Gosling provides diverse visual encoding methods in circular layouts',
    layout: 'circular',
    arrangement: 'vertical',
    centerRadius: 0.5,
    static: true,
    xDomain: { chromosome: '1', interval: [1, 3000500] },
    views: [
        {
            arrangement: 'horizontal',
            views: [
                {
                    spacing: 2,
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.multivec,
                                type: 'multivec',
                                row: 'sample',
                                column: 'position',
                                value: 'peak',
                                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4'],
                                binSize: 4
                            },
                            mark: 'rect',
                            x: {
                                field: 'start',
                                type: 'genomic',
                                axis: 'top'
                            },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            },
                            row: { field: 'sample', type: 'nominal', legend: true },
                            color: { field: 'peak', type: 'quantitative' },
                            width: 350,
                            height: 130
                        }
                    ]
                },
                {
                    spacing: 2,
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.multivec,
                                type: 'multivec',
                                row: 'sample',
                                column: 'position',
                                value: 'peak',
                                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                            },
                            mark: 'bar',
                            x: {
                                field: 'position',
                                type: 'genomic',
                                axis: 'top'
                            },
                            y: { field: 'peak', type: 'quantitative' },
                            row: { field: 'sample', type: 'nominal' },
                            color: { field: 'sample', type: 'nominal', legend: true },
                            width: 350,
                            height: 130
                        }
                    ]
                }
            ]
        },
        {
            arrangement: 'horizontal',
            views: [
                {
                    spacing: 2,
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.multivec,
                                type: 'multivec',
                                row: 'sample',
                                column: 'position',
                                value: 'peak',
                                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                            },
                            mark: 'bar',
                            x: {
                                field: 'position',
                                type: 'genomic',
                                axis: 'top'
                            },
                            y: { field: 'peak', type: 'quantitative' },
                            color: { field: 'sample', type: 'nominal', legend: true },
                            width: 350,
                            height: 130
                        }
                    ]
                },
                {
                    spacing: 2,
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.multivec,
                                type: 'multivec',
                                row: 'sample',
                                column: 'position',
                                value: 'peak',
                                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                            },
                            overlay: [
                                { mark: 'line' },
                                { mark: 'point', size: { field: 'peak', type: 'quantitative', range: [0, 2] } }
                            ],
                            x: {
                                field: 'position',
                                type: 'genomic',
                                axis: 'top'
                            },
                            y: { field: 'peak', type: 'quantitative' },
                            row: { field: 'sample', type: 'nominal' },
                            color: { field: 'sample', type: 'nominal', legend: true },
                            width: 350,
                            height: 130
                        }
                    ]
                }
            ]
        },
        {
            arrangement: 'horizontal',
            views: [
                {
                    spacing: 2,
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.multivec,
                                type: 'multivec',
                                row: 'sample',
                                column: 'position',
                                value: 'peak',
                                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                            },
                            mark: 'point',
                            x: {
                                field: 'position',
                                type: 'genomic',
                                axis: 'top'
                            },
                            y: { field: 'peak', type: 'quantitative' },
                            row: { field: 'sample', type: 'nominal' },
                            size: { field: 'peak', type: 'quantitative' },
                            color: { field: 'sample', type: 'nominal', legend: true },
                            opacity: { value: 0.5 },
                            width: 350,
                            height: 130
                        }
                    ]
                },
                {
                    spacing: 2,
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.multivec,
                                type: 'multivec',
                                row: 'sample',
                                column: 'position',
                                value: 'peak',
                                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                            },
                            mark: 'point',
                            x: {
                                field: 'position',
                                type: 'genomic',
                                axis: 'top'
                            },
                            y: { field: 'peak', type: 'quantitative' },
                            size: { field: 'peak', type: 'quantitative' },
                            color: { field: 'sample', type: 'nominal', legend: true },
                            opacity: { value: 0.5 },
                            width: 350,
                            height: 130
                        }
                    ]
                }
            ]
        },
        {
            arrangement: 'horizontal',
            views: [
                {
                    spacing: 2,
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.multivec,
                                type: 'multivec',
                                row: 'sample',
                                column: 'position',
                                value: 'peak',
                                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                            },
                            mark: 'area',
                            x: {
                                field: 'position',
                                type: 'genomic',
                                axis: 'top'
                            },
                            y: { field: 'peak', type: 'quantitative' },
                            row: { field: 'sample', type: 'nominal' },
                            color: { field: 'sample', type: 'nominal', legend: true },
                            stroke: { value: 'white' },
                            strokeWidth: { value: 0.5 },
                            width: 350,
                            height: 130
                        }
                    ]
                },
                {
                    spacing: 2,
                    tracks: [
                        {
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                                type: 'csv',
                                chromosomeField: 'c2',
                                genomicFields: ['s1', 'e1', 's2', 'e2']
                            },
                            mark: 'link',
                            x: {
                                field: 's1',
                                type: 'genomic',
                                domain: { chromosome: '1', interval: [103900000, 104100000] }
                            },
                            xe: {
                                field: 'e1',
                                type: 'genomic'
                            },
                            x1: {
                                field: 's2',
                                type: 'genomic',
                                domain: { chromosome: '1' }
                            },
                            x1e: {
                                field: 'e2',
                                type: 'genomic'
                            },
                            color: { field: 's1', type: 'nominal' },
                            stroke: { value: 'black' },
                            strokeWidth: { value: 0.5 },
                            opacity: { value: 0.4 },
                            width: 350,
                            height: 130
                        }
                    ]
                }
            ]
        }
    ]
};
