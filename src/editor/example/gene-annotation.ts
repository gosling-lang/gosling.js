import { GeminiSpec } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_GENE_ANNOTATION: GeminiSpec = {
    tracks: [
        {
            data: {
                url: EXAMPLE_DATASETS.geneAnnotation,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-bed',
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
            superpose: [
                {
                    dataTransform: {
                        filter: [{ field: 'type', oneOf: ['gene'], not: false }]
                    },
                    mark: 'text',
                    text: { field: 'name', type: 'nominal' },
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['+'], not: false }
                        ]
                    },
                    mark: 'triangle-r',
                    x: {
                        field: 'end',
                        type: 'genomic',
                        axis: 'top'
                    },
                    size: { value: 20 }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['-'], not: false }
                        ]
                    },
                    mark: 'triangle-l',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    size: { value: 20 },
                    style: { align: 'right' }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    size: { value: 20 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['+'], not: false }
                        ]
                    },
                    mark: 'rule',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    strokeWidth: { value: 3 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    style: {
                        // dashed: [3, 3],
                        linePattern: { type: 'triangle-r', size: 5 }
                    }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['-'], not: false }
                        ]
                    },
                    mark: 'rule',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    strokeWidth: { value: 3 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    style: {
                        // dashed: [3, 3],
                        linePattern: { type: 'triangle-l', size: 5 }
                    }
                }
            ],
            // y: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#7585FF', '#FF8A85'] },
            // background: {"value": "red"},
            opacity: { value: 0.5 },
            width: 1000,
            height: 120
        },
        {
            data: {
                url: EXAMPLE_DATASETS.geneAnnotation,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-bed',
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
            superpose: [
                {
                    dataTransform: {
                        filter: [{ field: 'type', oneOf: ['gene'], not: false }]
                    },
                    mark: 'text',
                    text: { field: 'name', type: 'nominal' },
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['gene'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    size: { value: 20 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['-'], not: false }
                        ]
                    },
                    mark: 'rule',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    strokeWidth: { value: 0 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    color: { value: 'white' },
                    opacity: { value: 0.6 },
                    style: {
                        linePattern: { type: 'triangle-l', size: 10 }
                    }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['+'], not: false }
                        ]
                    },
                    mark: 'rule',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    strokeWidth: { value: 0 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    color: { value: 'white' },
                    opacity: { value: 0.6 },
                    style: {
                        linePattern: { type: 'triangle-r', size: 10 }
                    }
                }
            ],
            // y: { field: 'strand', type: 'nominal' },
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { value: '#0900B1' },
            // background: {"value": "red"},
            width: 1000,
            height: 120
        },
        {
            data: {
                url: EXAMPLE_DATASETS.geneAnnotation,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-bed',
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
            superpose: [
                {
                    dataTransform: {
                        filter: [{ field: 'type', oneOf: ['gene'], not: false }]
                    },
                    mark: 'text',
                    text: { field: 'name', type: 'nominal' },
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    color: { value: 'black' }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['+'], not: false }
                        ]
                    },
                    mark: 'triangle-r',
                    x: {
                        field: 'end',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    color: { value: '#999999' }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['-'], not: false }
                        ]
                    },
                    mark: 'triangle-l',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    color: { value: '#999999' },
                    style: {
                        align: 'right'
                    }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['gene'], not: false }] },
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
                    color: { value: 'lightgray' }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['gene'], not: false }] },
                    mark: 'rule',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    strokeWidth: { value: 5 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    color: { value: 'gray' }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'], not: false }] },
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
                    color: { value: '#E2A6F5' },
                    stroke: { value: '#BB57C9' },
                    strokeWidth: { value: 1 }
                }
            ],
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            size: { value: 17 },
            width: 1000,
            height: 120
        },
        {
            data: {
                url: EXAMPLE_DATASETS.geneAnnotation,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-bed',
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
            superpose: [
                {
                    dataTransform: {
                        filter: [{ field: 'type', oneOf: ['gene'], not: false }]
                    },
                    mark: 'text',
                    text: { field: 'name', type: 'nominal' },
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['+'], not: false }
                        ]
                    },
                    mark: 'triangle-r',
                    x: {
                        field: 'end',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    size: { value: 20 }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'type', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['-'], not: false }
                        ]
                    },
                    mark: 'triangle-l',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    size: { value: 20 },
                    style: {
                        align: 'right'
                    }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    size: { value: 10 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['gene'], not: false }] },
                    mark: 'rule',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    strokeWidth: { value: 3 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                }
                // {
                //  // TODO: Gemini Datafetcher to support multiple data types
                //     data: [
                //         { position: 3700000, strand: '+' }
                //     ]
                // }
            ],
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['blue', 'red'] },
            width: 1000,
            height: 120
        },
        {
            data: {
                url: EXAMPLE_DATASETS.geneAnnotation,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-bed',
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
            superpose: [
                {
                    dataTransform: {
                        filter: [{ field: 'type', oneOf: ['gene'], not: false }]
                    },
                    mark: 'text',
                    text: { field: 'name', type: 'nominal' },
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    size: { value: 10 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['intron'], not: false }] },
                    mark: 'rule',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        axis: 'top'
                    },
                    strokeWidth: { value: 2 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    style: {
                        curve: 'top'
                    }
                }
            ],
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { value: '#B54F4A' },
            width: 1000,
            height: 120
        },
        {
            data: {
                url: EXAMPLE_DATASETS.geneAnnotation,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-bed',
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
            superpose: [
                {
                    dataTransform: {
                        filter: [{ field: 'type', oneOf: ['gene'], not: false }]
                    },
                    mark: 'text',
                    text: { field: 'name', type: 'nominal' },
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['gene'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    color: { value: '#666666' }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] },
                        axis: 'top'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    color: { value: '#FF6666' }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['intron'], not: false }] },
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
                    color: { value: '#99FEFF' }
                }
            ],
            size: { value: 30 },
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            stroke: { value: '#777777' },
            strokeWidth: { value: 1 },
            width: 1000,
            height: 120
        }
    ]
};
