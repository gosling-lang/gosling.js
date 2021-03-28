import { GoslingSpec } from '../../core/gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const EX_SPEC_MATRIX: GoslingSpec = {
    title: 'Matrix Visualization',
    subtitle: 'Matrix Heatmap for Hi-C Data',
    views: [
        {
            static: true,
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
                    alignment: 'overlay',
                    tracks: [
                        {
                            mark: 'bar'
                        },
                        {
                            mark: 'brush',
                            x: { linkingId: 'all' },
                            color: { value: 'blue' }
                        }
                    ],
                    x: {
                        field: 'position',
                        type: 'genomic',
                        axis: 'top'
                    },
                    y: { field: 'peak', type: 'quantitative' },
                    color: { field: 'sample', type: 'nominal' },
                    width: 570,
                    height: 30
                },
                {
                    alignment: 'overlay',
                    data: {
                        url:
                            'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                        type: 'csv',
                        chromosomeField: 'Chromosome',
                        genomicFields: ['chromStart', 'chromEnd']
                    },
                    tracks: [
                        {
                            mark: 'rect',
                            color: {
                                field: 'Chromosome',
                                type: 'nominal',
                                domain: [
                                    'chr1',
                                    'chr2',
                                    'chr3',
                                    'chr4',
                                    'chr5',
                                    'chr6',
                                    'chr7',
                                    'chr8',
                                    'chr9',
                                    'chr10',
                                    'chr11',
                                    'chr12',
                                    'chr13',
                                    'chr14',
                                    'chr15',
                                    'chr16',
                                    'chr17',
                                    'chr18',
                                    'chr19',
                                    'chr20',
                                    'chr21',
                                    'chr22',
                                    'chrX',
                                    'chrY'
                                ],
                                range: ['#F6F6F6', 'gray']
                            },
                            x: {
                                field: 'chromStart',
                                type: 'genomic',
                                aggregate: 'min',
                                domain: { chromosome: '5' }
                            },
                            xe: {
                                field: 'chromEnd',
                                aggregate: 'max',
                                type: 'genomic'
                            },
                            strokeWidth: { value: 2 },
                            stroke: { value: 'gray' },
                            visibility: [
                                {
                                    operation: 'greater-than',
                                    measure: 'zoomLevel',
                                    threshold: 1000000000,
                                    target: 'mark',
                                    transitionPadding: 1000000000
                                }
                            ]
                        },
                        {
                            mark: 'text',
                            dataTransform: {
                                filter: [{ field: 'Stain', oneOf: ['acen'], not: true }]
                            },
                            text: { field: 'Name', type: 'nominal' },
                            color: {
                                field: 'Stain',
                                type: 'nominal',
                                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                                range: ['black', 'black', 'black', 'black', 'white', 'black']
                            },
                            visibility: [
                                {
                                    operation: 'less-than',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    transitionPadding: 10,
                                    target: 'mark'
                                }
                            ],
                            style: {
                                textStrokeWidth: 0
                            }
                        },
                        {
                            mark: 'rect',
                            dataTransform: {
                                filter: [{ field: 'Stain', oneOf: ['acen'], not: true }]
                            },
                            color: {
                                field: 'Stain',
                                type: 'nominal',
                                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                                range: ['white', '#D9D9D9', '#979797', '#636363', 'black', '#A0A0F2']
                            }
                        },
                        {
                            mark: 'triangleRight',
                            dataTransform: {
                                filter: [
                                    { field: 'Stain', oneOf: ['acen'] },
                                    { field: 'Name', include: 'q' }
                                ]
                            },
                            color: { value: '#B40101' }
                        },
                        {
                            mark: 'triangleLeft',
                            dataTransform: {
                                filter: [
                                    { field: 'Stain', oneOf: ['acen'] },
                                    { field: 'Name', include: 'p' }
                                ]
                            },
                            color: { value: '#B40101' }
                        },
                        {
                            mark: 'brush',
                            x: { linkingId: 'all' },
                            color: { value: 'blue' }
                        }
                    ],
                    x: { field: 'chromStart', type: 'genomic' },
                    xe: { field: 'chromEnd', type: 'genomic' },
                    size: { value: 20 },
                    stroke: { value: 'gray' },
                    strokeWidth: { value: 0.5 },
                    visibility: [
                        {
                            operation: 'greater-than',
                            measure: 'width',
                            threshold: 3,
                            transitionPadding: 5,
                            target: 'mark'
                        }
                    ],
                    style: {
                        outline: 'white'
                    },
                    width: 570,
                    height: 25
                }
            ]
        },
        {
            xDomain: { chromosome: '5', interval: [1000000, 30000000] },
            xLinkingId: 'all',
            spacing: 0,
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
                                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                            },
                            mark: 'bar',
                            x: {
                                field: 'position',
                                type: 'genomic',
                                axis: 'top'
                            },
                            y: { field: 'peak', type: 'quantitative' },
                            color: { field: 'sample', type: 'nominal' },
                            width: 570,
                            height: 50
                        }
                    ]
                },
                {
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.matrix2,
                                type: 'matrix'
                            },
                            mark: 'rect',
                            x: { field: 'position1', type: 'genomic', axis: 'none' },
                            y: { field: 'position2', type: 'genomic', axis: 'right' },
                            color: { field: 'value', type: 'quantitative', legend: true },
                            width: 600,
                            height: 600
                        }
                    ]
                }
            ]
        }
    ]
};
