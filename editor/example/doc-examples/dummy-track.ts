import type { GoslingSpec } from 'gosling.js';

export const DUMMY_TRACK: GoslingSpec = {
    title: 'Dummy track example',
    subtitle: 'This example demonstrates a dummy track alongside other tracks',
    layout: 'linear',
    xDomain: { chromosome: 'chr3', interval: [52168000, 52890000] },
    arrangement: 'horizontal',
    views: [
        {
            arrangement: 'vertical',
            views: [
                {
                    alignment: 'overlay',
                    title: 'HiGlass',
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
                            x: { field: 'end', type: 'genomic', axis: 'top' },
                            size: { value: 15 }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            style: { dy: -15 }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'triangleLeft',
                            x: { field: 'start', type: 'genomic' },
                            size: { value: 15 },
                            style: { align: 'right' }
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
                            strokeWidth: { value: 3 },
                            xe: { field: 'end', type: 'genomic' },
                            style: { linePattern: { type: 'triangleRight', size: 5 } }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic' },
                            strokeWidth: { value: 3 },
                            xe: { field: 'end', type: 'genomic' },
                            style: { linePattern: { type: 'triangleLeft', size: 5 } }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    color: {
                        field: 'strand',
                        type: 'nominal',
                        domain: ['+', '-'],
                        range: ['#7585FF', '#FF8A85']
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
                    opacity: { value: 0.8 },
                    width: 350,
                    height: 100
                },
                {
                    tracks: [
                        {
                            type: 'dummy-track',
                            title: 'Placeholder',
                            style: { background: '#e6e6e6' }
                        }
                    ],
                    width: 350,
                    height: 130
                },
                {
                    alignment: 'overlay',
                    title: 'IGV',
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
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' }
                        },
                        {
                            type: 'dummy-track',
                            title: 'Placeholder track',
                            style: { background: '#e6e6e6' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            size: { value: 15 },
                            xe: { field: 'end', type: 'genomic' }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            strokeWidth: { value: 0 },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: 'white' },
                            opacity: { value: 0.6 },
                            style: { linePattern: { type: 'triangleLeft', size: 10 } }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            strokeWidth: { value: 0 },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: 'white' },
                            opacity: { value: 0.6 },
                            style: { linePattern: { type: 'triangleRight', size: 10 } }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    color: { value: '#0900B1' },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    width: 350,
                    height: 100
                }
            ]
        },
        {
            arrangement: 'vertical',
            views: [
                {
                    alignment: 'overlay',
                    title: 'Cyverse-QUBES',
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
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: 'black' }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'triangleRight',
                            x: { field: 'end', type: 'genomic', axis: 'top' },
                            color: { value: '#999999' }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'triangleLeft',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            color: { value: '#999999' },
                            style: { align: 'right' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: 'lightgray' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            strokeWidth: { value: 5 },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: 'gray' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#E2A6F5' },
                            stroke: { value: '#BB57C9' },
                            strokeWidth: { value: 1 }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    size: { value: 15 },
                    width: 350,
                    height: 100
                },
                {
                    alignment: 'overlay',
                    title: 'GmGDV',
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
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            style: { dy: -14 }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'triangleRight',
                            x: { field: 'end', type: 'genomic', axis: 'top' },
                            size: { value: 15 }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'triangleLeft',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            size: { value: 15 },
                            style: { align: 'right' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            size: { value: 10 },
                            xe: { field: 'end', type: 'genomic' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            strokeWidth: { value: 3 },
                            xe: { field: 'end', type: 'genomic' }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    color: {
                        field: 'strand',
                        type: 'nominal',
                        domain: ['+', '-'],
                        range: ['blue', 'red']
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
                    width: 350,
                    height: 100
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
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            color: { value: 'black' },
                            xe: { field: 'end', type: 'genomic' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#666666' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#FF6666' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['intron'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#99FEFF' }
                        }
                    ],
                    size: { value: 30 },
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    stroke: { value: '#777777' },
                    strokeWidth: { value: 1 },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    width: 350,
                    height: 100
                }
            ]
        }
    ]
};
