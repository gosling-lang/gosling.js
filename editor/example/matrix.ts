import type { GoslingSpec } from 'gosling.js';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const EX_SPEC_NATIVE_MATRIX: GoslingSpec = {
    linkingId: '-',
    spacing: 0,
    arrangement: 'horizontal',
    views: [
        {
            orientation: 'vertical',
            yOffset: 70,
            tracks: [
                {
                    alignment: 'overlay',
                    tracks: [
                        {
                            data: {
                                url: 'https://s3.amazonaws.com/gosling-lang.org/data/HFFC6_CTCF.mRp.clN.bigWig',
                                type: 'bigwig',
                                column: 'position',
                                value: 'peak',
                                binSize: 8
                            },
                            mark: 'bar',
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            y: {
                                field: 'peak',
                                type: 'quantitative',
                                axis: 'none'
                            },
                            color: { value: '#0072B2' }
                        },
                        {
                            style: { backgroundOpacity: 0 },
                            data: {
                                url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
                                type: 'beddb',
                                genomicFields: [
                                    { index: 1, name: 'start' },
                                    { index: 2, name: 'end' }
                                ],
                                valueFields: [
                                    { index: 5, name: 'strand', type: 'nominal' },
                                    { index: 3, name: 'name', type: 'nominal' }
                                ]
                            },
                            dataTransform: [{ type: 'filter', field: 'strand', oneOf: ['+'] }],
                            mark: 'triangleRight',
                            x: { field: 'start', type: 'genomic' },
                            size: { value: 13 },
                            stroke: { value: 'white' },
                            strokeWidth: { value: 1 },
                            row: {
                                field: 'strand',
                                type: 'nominal',
                                domain: ['+', '-']
                            },
                            color: { value: '#CB7AA7' }
                        },
                        {
                            style: { backgroundOpacity: 0 },
                            title: 'HFFC6_CTCF',
                            data: {
                                url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
                                type: 'beddb',
                                genomicFields: [
                                    { index: 1, name: 'start' },
                                    { index: 2, name: 'end' }
                                ],
                                valueFields: [
                                    { index: 5, name: 'strand', type: 'nominal' },
                                    { index: 3, name: 'name', type: 'nominal' }
                                ]
                            },
                            dataTransform: [{ type: 'filter', field: 'strand', oneOf: ['-'] }],
                            mark: 'triangleLeft',
                            x: { field: 'start', type: 'genomic' },
                            size: { value: 13 },
                            stroke: { value: 'white' },
                            strokeWidth: { value: 1 },
                            row: {
                                field: 'strand',
                                type: 'nominal',
                                domain: ['+', '-']
                            },
                            color: { value: '#029F73' }
                        }
                    ],
                    height: 630,
                    width: 40
                }
            ]
        },
        {
            arrangement: 'vertical',
            views: [
                {
                    tracks: [
                        {
                            alignment: 'overlay',
                            tracks: [
                                {
                                    data: {
                                        url: 'https://s3.amazonaws.com/gosling-lang.org/data/HFFC6_CTCF.mRp.clN.bigWig',
                                        type: 'bigwig',
                                        column: 'position',
                                        value: 'peak',
                                        binSize: 8
                                    },
                                    mark: 'bar',
                                    x: { field: 'start', type: 'genomic' },
                                    xe: { field: 'end', type: 'genomic' },
                                    y: {
                                        field: 'peak',
                                        type: 'quantitative',
                                        axis: 'none'
                                    },
                                    color: { value: '#0072B2' }
                                },
                                {
                                    style: { backgroundOpacity: 0 },
                                    data: {
                                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
                                        type: 'beddb',
                                        genomicFields: [
                                            { index: 1, name: 'start' },
                                            { index: 2, name: 'end' }
                                        ],
                                        valueFields: [
                                            { index: 5, name: 'strand', type: 'nominal' },
                                            { index: 3, name: 'name', type: 'nominal' }
                                        ]
                                    },
                                    dataTransform: [{ type: 'filter', field: 'strand', oneOf: ['+'] }],
                                    mark: 'triangleRight',
                                    x: { field: 'start', type: 'genomic' },
                                    size: { value: 13 },
                                    stroke: { value: 'white' },
                                    strokeWidth: { value: 1 },
                                    row: {
                                        field: 'strand',
                                        type: 'nominal',
                                        domain: ['+', '-']
                                    },
                                    color: { value: '#CB7AA7' }
                                },
                                {
                                    style: { backgroundOpacity: 0 },
                                    title: 'HFFC6_CTCF',
                                    data: {
                                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
                                        type: 'beddb',
                                        genomicFields: [
                                            { index: 1, name: 'start' },
                                            { index: 2, name: 'end' }
                                        ],
                                        valueFields: [
                                            { index: 5, name: 'strand', type: 'nominal' },
                                            { index: 3, name: 'name', type: 'nominal' }
                                        ]
                                    },
                                    dataTransform: [{ type: 'filter', field: 'strand', oneOf: ['-'] }],
                                    mark: 'triangleLeft',
                                    x: { field: 'start', type: 'genomic' },
                                    size: { value: 13 },
                                    stroke: { value: 'white' },
                                    strokeWidth: { value: 1 },
                                    row: {
                                        field: 'strand',
                                        type: 'nominal',
                                        domain: ['+', '-']
                                    },
                                    color: { value: '#029F73' }
                                }
                            ],
                            height: 40,
                            width: 600
                        }
                    ]
                },
                {
                    xDomain: { chromosome: '1' }, //, interval: [4900000, 5200000] },
                    tracks: [
                        {
                            data: {
                                url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=leung2015-hg38',
                                type: 'matrix'
                            },
                            alignment: 'overlay',
                            tracks: [
                                {
                                    mark: 'bar',
                                    x: { field: 'xs', type: 'genomic', axis: 'none' },
                                    xe: { field: 'xe', type: 'genomic' },
                                    y: { field: 'ys', type: 'genomic', axis: 'none' },
                                    ye: { field: 'ye', type: 'genomic' },
                                    color: {
                                        field: 'value',
                                        type: 'quantitative',
                                        legend: true
                                    }
                                },
                                {
                                    mark: 'betweenLink',
                                    x: { field: 'x', type: 'genomic' },
                                    y: { field: 'y', type: 'genomic' },
                                    stroke: { value: 'lightgray' },
                                    visibility: [
                                        {
                                            target: 'track',
                                            measure: 'zoomLevel',
                                            threshold: 500000,
                                            operation: 'lt'
                                        }
                                    ]
                                },
                                {
                                    mark: 'text',
                                    text: { field: 'value', type: 'quantitative' },
                                    x: { field: 'xs', type: 'genomic' },
                                    xe: { field: 'xe', type: 'genomic' },
                                    y: { field: 'y', type: 'genomic' },
                                    color: { value: 'black' },
                                    strokeWidth: { value: 2 },
                                    stroke: { value: 'white' },
                                    visibility: [
                                        {
                                            target: 'track',
                                            threshold: 100000,
                                            measure: 'zoomLevel',
                                            operation: 'LTET'
                                        },
                                        {
                                            target: 'mark',
                                            threshold: '|xe-x|',
                                            measure: 'width',
                                            transitionPadding: 10,
                                            operation: 'LTET'
                                        }
                                    ]
                                }
                            ],
                            width: 600,
                            height: 600
                        }
                    ]
                }
            ]
        }
    ]
};
export const EX_SPEC_1D_MATRIX: GoslingSpec = {
    views: [
        {
            spacing: 0.1,
            xDomain: { chromosome: '3' }, //"interval": [4900000, 5200000]},
            // xDomain: { chromosome: '3', "interval": [100000000, 200000000]},
            tracks: [
                {
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=leung2015-hg38',
                        type: 'matrix'
                    },
                    dataTransform: [
                        {
                            type: 'rotateMatrix',
                            startField1: 'xs',
                            endField1: 'xe',
                            startField2: 'ye',
                            endField2: 'ys'
                        }
                    ],
                    mark: 'diamond',
                    x: { field: 'xs', type: 'genomic', axis: 'top' },
                    xe: { field: 'xe', type: 'genomic', axis: 'none' },
                    y: { field: 'ys', type: 'quantitative', axis: 'none', range: [-15, 200], zeroBaseline: false },
                    ye: { field: 'ye', type: 'quantitative', axis: 'none', range: [-15, 200], zeroBaseline: false },
                    color: { field: 'value', type: 'quantitative', legend: true },
                    style: { background: '#F6F6F6', backgroundOpacity: 1 },
                    width: 700,
                    height: 200
                },
                {
                    alignment: 'overlay',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
                        type: 'beddb',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [
                            { index: 5, name: 'strand', type: 'nominal' },
                            { index: 3, name: 'name', type: 'nominal' }
                        ],
                        exonIntervalFields: [
                            { index: 12, name: 'start' },
                            { index: 13, name: 'end' }
                        ]
                    },
                    tracks: [
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'triangleRight',
                            x: { field: 'end', type: 'genomic' },
                            size: { value: 15 }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            style: { dy: -15, outline: 'black', outlineWidth: 0 }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'triangleLeft',
                            x: { field: 'start', type: 'genomic' },
                            size: { value: 15 },
                            style: {
                                align: 'right',
                                outline: 'black',
                                outlineWidth: 0
                            }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic' },
                            size: { value: 15 },
                            xe: { field: 'end', type: 'genomic' }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic' },
                            strokeWidth: { value: 2 },
                            xe: { field: 'end', type: 'genomic' },
                            style: {
                                linePattern: { type: 'triangleRight', size: 3.5 },
                                outline: 'black',
                                outlineWidth: 0
                            }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic' },
                            strokeWidth: { value: 2 },
                            xe: { field: 'end', type: 'genomic' },
                            style: {
                                linePattern: { type: 'triangleLeft', size: 3.5 },
                                outline: 'black',
                                outlineWidth: 0,
                                background: '#F6F6F6'
                            }
                        }
                    ],
                    row: {
                        field: 'strand',
                        type: 'nominal',
                        domain: ['+', '-']
                    },
                    color: {
                        field: 'strand',
                        type: 'nominal',
                        domain: ['+', '-'],
                        range: ['#97A8B2', '#D4C6BA']
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
                    width: 700,
                    height: 100
                },
                {
                    data: {
                        url: 'https://s3.amazonaws.com/gosling-lang.org/data/cancer/rearrangement.PD35930a.csv',
                        type: 'csv',
                        genomicFieldsToConvert: [
                            {
                                chromosomeField: 'chr1',
                                genomicFields: ['start1', 'end1']
                            },
                            {
                                chromosomeField: 'chr2',
                                genomicFields: ['start2', 'end2']
                            }
                        ]
                    },
                    dataTransform: [{ type: 'filter', field: 'svclass', oneOf: ['inversion'] }],
                    mark: 'withinLink',
                    x: { field: 'start1', type: 'genomic', axis: 'none' },
                    xe: { field: 'end2', type: 'genomic' },
                    color: {
                        field: 'svclass',
                        type: 'nominal',
                        domain: ['tandem-duplication', 'translocation', 'delection', 'inversion'],
                        range: ['#569C4D', '#4C75A2', '#DA5456', '#EA8A2A']
                    },
                    stroke: {
                        field: 'svclass',
                        type: 'nominal',
                        domain: ['tandem-duplication', 'translocation', 'delection', 'inversion'],
                        range: ['#569C4D', '#4C75A2', '#DA5456', '#EA8A2A']
                    },
                    strokeWidth: { value: 1 },
                    opacity: { value: 0.6 },
                    style: { bazierLink: true, outlineWidth: 0 },
                    width: 700,
                    height: 130
                }
            ]
        },
        {
            layout: 'circular',
            spacing: 0.1,
            xDomain: { chromosome: '3' }, //"interval": [4900000, 5200000]},
            // xDomain: { chromosome: '3', "interval": [100000000, 200000000]},
            tracks: [
                {
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=leung2015-hg38',
                        type: 'matrix'
                    },
                    dataTransform: [
                        {
                            type: 'rotateMatrix',
                            startField1: 'xs',
                            endField1: 'xe',
                            startField2: 'ye',
                            endField2: 'ys'
                        }
                    ],
                    mark: 'diamond',
                    x: { field: 'xs', type: 'genomic', axis: 'top' },
                    xe: { field: 'xe', type: 'genomic', axis: 'none' },
                    y: { field: 'ys', type: 'quantitative', axis: 'none', zeroBaseline: false },
                    ye: { field: 'ye', type: 'quantitative', axis: 'none', zeroBaseline: false },
                    color: { field: 'value', type: 'quantitative', legend: true },
                    style: { background: '#F6F6F6', backgroundOpacity: 1 },
                    width: 700,
                    height: 200
                },
                {
                    alignment: 'overlay',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
                        type: 'beddb',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [
                            { index: 5, name: 'strand', type: 'nominal' },
                            { index: 3, name: 'name', type: 'nominal' }
                        ],
                        exonIntervalFields: [
                            { index: 12, name: 'start' },
                            { index: 13, name: 'end' }
                        ]
                    },
                    tracks: [
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'triangleRight',
                            x: { field: 'end', type: 'genomic' },
                            size: { value: 15 }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            style: { dy: -15, outline: 'black', outlineWidth: 0 }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'triangleLeft',
                            x: { field: 'start', type: 'genomic' },
                            size: { value: 15 },
                            style: {
                                align: 'right',
                                outline: 'black',
                                outlineWidth: 0
                            }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic' },
                            size: { value: 15 },
                            xe: { field: 'end', type: 'genomic' }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic' },
                            strokeWidth: { value: 2 },
                            xe: { field: 'end', type: 'genomic' },
                            style: {
                                linePattern: { type: 'triangleRight', size: 3.5 },
                                outline: 'black',
                                outlineWidth: 0
                            }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic' },
                            strokeWidth: { value: 2 },
                            xe: { field: 'end', type: 'genomic' },
                            style: {
                                linePattern: { type: 'triangleLeft', size: 3.5 },
                                outline: 'black',
                                outlineWidth: 0,
                                background: '#F6F6F6'
                            }
                        }
                    ],
                    row: {
                        field: 'strand',
                        type: 'nominal',
                        domain: ['+', '-']
                    },
                    color: {
                        field: 'strand',
                        type: 'nominal',
                        domain: ['+', '-'],
                        range: ['#97A8B2', '#D4C6BA']
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
                    width: 700,
                    height: 100
                },
                {
                    data: {
                        url: 'https://s3.amazonaws.com/gosling-lang.org/data/cancer/rearrangement.PD35930a.csv',
                        type: 'csv',
                        genomicFieldsToConvert: [
                            {
                                chromosomeField: 'chr1',
                                genomicFields: ['start1', 'end1']
                            },
                            {
                                chromosomeField: 'chr2',
                                genomicFields: ['start2', 'end2']
                            }
                        ]
                    },
                    dataTransform: [{ type: 'filter', field: 'svclass', oneOf: ['inversion'] }],
                    mark: 'withinLink',
                    x: { field: 'start1', type: 'genomic', axis: 'none' },
                    xe: { field: 'end2', type: 'genomic' },
                    color: {
                        field: 'svclass',
                        type: 'nominal',
                        domain: ['tandem-duplication', 'translocation', 'delection', 'inversion'],
                        range: ['#569C4D', '#4C75A2', '#DA5456', '#EA8A2A']
                    },
                    stroke: {
                        field: 'svclass',
                        type: 'nominal',
                        domain: ['tandem-duplication', 'translocation', 'delection', 'inversion'],
                        range: ['#569C4D', '#4C75A2', '#DA5456', '#EA8A2A']
                    },
                    strokeWidth: { value: 1 },
                    opacity: { value: 0.6 },
                    style: { bazierLink: true, outlineWidth: 0 },
                    width: 700,
                    height: 130
                }
            ]
        }
    ]
};

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
                        url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
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
                            dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen'], not: true }],
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
                            ]
                        },
                        {
                            mark: 'rect',
                            dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen'], not: true }],
                            color: {
                                field: 'Stain',
                                type: 'nominal',
                                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                                range: ['white', '#D9D9D9', '#979797', '#636363', 'black', '#A0A0F2']
                            }
                        },
                        {
                            mark: 'triangleRight',
                            dataTransform: [
                                { type: 'filter', field: 'Stain', oneOf: ['acen'] },
                                { type: 'filter', field: 'Name', include: 'q' }
                            ],
                            color: { value: '#B40101' }
                        },
                        {
                            mark: 'triangleLeft',
                            dataTransform: [
                                { type: 'filter', field: 'Stain', oneOf: ['acen'] },
                                { type: 'filter', field: 'Name', include: 'p' }
                            ],
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
            xDomain: { chromosome: '5', interval: [0, 43000000] },
            linkingId: 'all',
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
                    alignment: 'overlay',
                    data: {
                        url: GOSLING_PUBLIC_DATA.geneAnnotation,
                        type: 'beddb',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [
                            { index: 5, name: 'strand', type: 'nominal' },
                            { index: 3, name: 'name', type: 'nominal' }
                        ],
                        exonIntervalFields: [
                            { index: 12, name: 'start' },
                            { index: 13, name: 'end' }
                        ]
                    },
                    tracks: [
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'triangleRight',
                            x: {
                                field: 'end',
                                type: 'genomic',
                                axis: 'none'
                            },
                            size: { value: 15 }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: {
                                field: 'start',
                                type: 'genomic'
                            },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            },
                            style: {
                                dy: -15
                            }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'triangleLeft',
                            x: {
                                field: 'start',
                                type: 'genomic'
                            },
                            size: { value: 15 },
                            style: { align: 'right' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: {
                                field: 'start',
                                type: 'genomic'
                            },
                            size: { value: 15 },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'rule',
                            x: {
                                field: 'start',
                                type: 'genomic'
                            },
                            strokeWidth: { value: 3 },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            },
                            style: {
                                linePattern: { type: 'triangleRight', size: 5 }
                            }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'rule',
                            x: {
                                field: 'start',
                                type: 'genomic'
                            },
                            strokeWidth: { value: 3 },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            },
                            style: {
                                linePattern: { type: 'triangleLeft', size: 5 }
                            }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#7585FF', '#FF8A85'] },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    opacity: { value: 0.8 },
                    width: 570,
                    height: 60
                },
                {
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.matrix,
                                type: 'matrix'
                            },
                            mark: 'rect',
                            x: { field: 'position1', type: 'genomic', axis: 'none' },
                            y: { field: 'position2', type: 'genomic', axis: 'right' },
                            color: { field: 'value', type: 'quantitative' },
                            width: 600,
                            height: 600
                        }
                    ]
                }
            ]
        }
    ]
};
