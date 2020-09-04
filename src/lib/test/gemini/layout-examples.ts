import { GeminiSpec } from '../../gemini.schema';

const MULTIVEC_FILE_CISTROME = 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ';
const MULTIVEC_FA = [
    'http://localhost:8001/api/v1/tileset_info/?d=XX4dPR0dSCGzD2n-xtlhbA',
    'https://resgen.io/api/v1/tileset_info/?d=WipsnEDMStahGPpRfH9adA'
][1];
const GENE_ANNOTATION_TILESET = 'https://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA';

export const SPEC_TO_SUPPORT: GeminiSpec = {
    tracks: [
        {
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ',
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            superpose: [
                {
                    mark: 'line',
                    color: { field: 'sample', type: 'nominal' }
                },
                {
                    mark: 'point',
                    size: { field: 'peak', type: 'quantitative', range: [0, 6] },
                    color: { field: 'peak', type: 'quantitative' }
                }
            ],
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            width: 1000,
            height: 180
        }
    ]
};

export const GEMINI_PLUGIN_TRACK_SUPERPOSE: GeminiSpec = {
    tracks: [
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/chr1_cytogenetic_band.glyph.csv',
                type: 'csv',
                quantitativeFields: ['Band', 'ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop', 'Density']
            },
            superpose: [
                // this slows down the rendering process
                // {
                //     mark: 'text',
                //     text: { field: 'Band', type: 'nominal' }
                // },
                {
                    mark: 'rect',
                    dataTransform: {
                        filter: [{ field: 'Band', oneOf: [11, 11.1], not: true }]
                    },
                    color: {
                        field: 'Density',
                        type: 'nominal',
                        domain: ['', '25', '50', '75', '100'],
                        range: ['white', '#D9D9D9', '#979797', '#636363', 'black']
                    }
                },
                {
                    mark: 'rect',
                    dataTransform: {
                        filter: [{ field: 'Stain', oneOf: ['gvar'], not: false }]
                    },
                    color: { value: '#A0A0F2' }
                },
                {
                    mark: 'triangle-l',
                    dataTransform: {
                        filter: [{ field: 'Band', oneOf: [11], not: false }]
                    },
                    color: { value: '#B40101' }
                },
                {
                    mark: 'triangle-r',
                    dataTransform: {
                        filter: [{ field: 'Band', oneOf: [11.1], not: false }]
                    },
                    color: { value: '#B40101' }
                }
            ],
            x: { field: 'Basepair_start', type: 'genomic', domain: { chromosome: '1' } },
            xe: { field: 'Basepair_stop', type: 'genomic' },
            x1: { axis: true },
            stroke: { value: 'black' },
            strokeWidth: { value: 0.1 },
            width: 1000,
            height: 60
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            superpose: [
                {
                    mark: 'line'
                },
                {
                    mark: 'point',
                    size: { field: 'peak', type: 'quantitative', range: [0, 6] }
                }
            ],
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            // background: {"value": "red"},
            width: 1000,
            height: 180
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            superpose: [
                {
                    mark: 'bar',
                    size: { value: 1 },
                    color: { value: 'black' }
                },
                {
                    mark: 'point',
                    size: { field: 'peak', type: 'quantitative', range: [0, 6] }
                }
            ],
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1250000, 1450000] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            // background: {"value": "red"},
            width: 1000,
            height: 180
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: [
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                    '6',
                    '7',
                    '8',
                    '9',
                    '10',
                    '11'
                    // '12','13','14','15','16','17','18','19','20'
                ]
            },
            superpose: [
                {
                    mark: 'bar',
                    color: { field: 'sample', type: 'nominal', range: ['lightgray'] }
                },
                {
                    mark: 'bar',
                    dataTransform: { filter: [{ field: 'sample', oneOf: ['11'], not: false }] },
                    color: { field: 'sample', type: 'nominal', range: ['steelblue'] }
                },
                {
                    mark: 'line',
                    color: { field: 'sample', type: 'nominal', range: ['salmon'] }
                }
            ],
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [2540000, 2620000] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            stroke: { value: 'white' },
            strokeWidth: { value: 0.5 },
            width: 1000,
            height: 180
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'area',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            superpose: [
                { y: { field: 'peak', type: 'quantitative', domain: [0, 1] } },
                { y: { field: 'peak', type: 'quantitative', domain: [1, 8] } },
                { y: { field: 'peak', type: 'quantitative', domain: [8, 15] } }
            ],
            color: { field: 'sample', type: 'nominal' },
            row: { field: 'sample', type: 'nominal' },
            opacity: { value: 0.4 },
            width: 1000,
            height: 180
        }
    ]
};

export const GEMINI_PLUGIN_TRACK_GENE_ANNOTATION: GeminiSpec = {
    tracks: [
        {
            data: {
                url: GENE_ANNOTATION_TILESET,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-gene-annotation',
                chromosome: 0,
                geneName: 3,
                geneStart: 1,
                geneEnd: 2,
                strand: 5,
                exonName: 6,
                exonStarts: 12,
                exonEnds: 13
            },
            superpose: [
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
                        domain: { chromosome: '1', interval: [3400100, 3800100] }
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
                    xe: {
                        field: 'start',
                        type: 'genomic'
                    },
                    size: { value: 20 }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic'
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
                        type: 'genomic'
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
                        type: 'genomic'
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
            x1: { axis: true },
            // y: { field: 'strand', type: 'nominal' },
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#7585FF', '#FF8A85'] },
            // background: {"value": "red"},
            opacity: { value: 0.5 },
            width: 1000,
            height: 120
        },
        {
            data: {
                url: GENE_ANNOTATION_TILESET,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-gene-annotation',
                chromosome: 0,
                geneName: 3,
                geneStart: 1,
                geneEnd: 2,
                strand: 5,
                exonName: 6,
                exonStarts: 12,
                exonEnds: 13
            },
            superpose: [
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['gene'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3400100, 3800100] }
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
                        type: 'genomic'
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
                        type: 'genomic'
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
            x1: { axis: true },
            // y: { field: 'strand', type: 'nominal' },
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { value: '#0900B1' },
            // background: {"value": "red"},
            width: 1000,
            height: 120
        },
        {
            data: {
                url: GENE_ANNOTATION_TILESET,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-gene-annotation',
                chromosome: 0,
                geneName: 3,
                geneStart: 1,
                geneEnd: 2,
                strand: 5,
                exonName: 6,
                exonStarts: 12,
                exonEnds: 13
            },
            superpose: [
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
                        domain: { chromosome: '1', interval: [3540100, 3555100] }
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
                    xe: {
                        field: 'start',
                        type: 'genomic'
                    },
                    color: { value: '#999999' }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['gene'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic'
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
                        type: 'genomic'
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
                        type: 'genomic'
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
            x1: { axis: true },
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            size: { value: 17 },
            width: 1000,
            height: 120
        },
        {
            data: {
                url: GENE_ANNOTATION_TILESET,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-gene-annotation',
                chromosome: 0,
                geneName: 3,
                geneStart: 1,
                geneEnd: 2,
                strand: 5,
                exonName: 6,
                exonStarts: 12,
                exonEnds: 13
            },
            superpose: [
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
                        domain: { chromosome: '1', interval: [3540100, 3555100] }
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
                    xe: {
                        field: 'start',
                        type: 'genomic'
                    },
                    size: { value: 20 }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic'
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
                        type: 'genomic'
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
            x1: { axis: true },
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['blue', 'red'] },
            width: 1000,
            height: 120
        },
        {
            data: {
                url: GENE_ANNOTATION_TILESET,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-gene-annotation',
                chromosome: 0,
                geneName: 3,
                geneStart: 1,
                geneEnd: 2,
                strand: 5,
                exonName: 6,
                exonStarts: 12,
                exonEnds: 13
            },
            superpose: [
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] }
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
                        type: 'genomic'
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
            x1: { axis: true },
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { value: '#B54F4A' },
            width: 1000,
            height: 120
        },
        {
            data: {
                url: GENE_ANNOTATION_TILESET,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-gene-annotation',
                chromosome: 0,
                geneName: 3,
                geneStart: 1,
                geneEnd: 2,
                strand: 5,
                exonName: 6,
                exonStarts: 12,
                exonEnds: 13
            },
            superpose: [
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['gene'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3540100, 3555100] }
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
                        domain: { chromosome: '1', interval: [3540100, 3555100] }
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
                        type: 'genomic'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    color: { value: '#99FEFF' }
                }
            ],
            x1: { axis: true },
            size: { value: 30 },
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            stroke: { value: '#777777' },
            strokeWidth: { value: 1 },
            width: 1000,
            height: 120
        }
    ]
};

export const GEMINI_PLUGIN_TRACK_BASIC_MARKS: GeminiSpec = {
    tracks: [
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'rect',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            row: { field: 'sample', type: 'nominal' },
            // row: { field: 'sample', type: 'nominal' },
            color: { field: 'peak', type: 'quantitative' },
            // stroke: {value: 'white'},
            // strokeWidth: {value: 1},
            width: 1000,
            height: 180
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'area',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            stroke: { value: 'white' },
            strokeWidth: { value: 0.5 },
            width: 1000,
            height: 180
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'bar',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            stroke: { value: 'white' },
            strokeWidth: { value: 0.5 },
            width: 1000,
            height: 180
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'line',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            width: 1000,
            height: 180
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'point',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            size: { field: 'peak', type: 'quantitative' },
            color: { field: 'sample', type: 'nominal' },
            stroke: { value: 'white' },
            strokeWidth: { value: 1 },
            width: 1000,
            height: 180
        }
    ]
};

export const GEMINI_TRACK_EXAMPLE: GeminiSpec = {
    tracks: [
        {
            data: {
                url: MULTIVEC_FA,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'base',
                column: 'position',
                value: 'count',
                categories: ['A', 'T', 'G', 'C']
            },
            zoomAction: { type: 'auto' },
            mark: 'bar',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [3000000, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'count', type: 'quantitative' },
            color: {
                field: 'base',
                type: 'nominal',
                domain: ['A', 'T', 'G', 'C', 'N', 'other'],
                range: ['#007FFF', '#e8e500', '#008000', '#FF0038', '#800080', '#DCDCDC']
            },
            width: 1000,
            height: 180
        }
    ]
};

export const GEMINI_TRACK_EXAMPLE2: GeminiSpec = {
    tracks: [
        {
            data: {
                url: MULTIVEC_FA,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'base',
                column: 'position',
                value: 'count',
                categories: ['A', 'T', 'G', 'C']
            },
            zoomAction: {
                type: 'alternative-encoding',
                spec: {
                    row: { field: 'base', type: 'nominal' }
                }
            },
            mark: 'bar',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [3000000, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'count', type: 'quantitative' },
            color: {
                field: 'base',
                type: 'nominal',
                domain: ['A', 'T', 'G', 'C', 'N', 'other'],
                range: ['#007FFF', '#e8e500', '#008000', '#FF0038', '#800080', '#DCDCDC']
            },
            width: 1000,
            height: 180
        }
    ]
};

export const GEMINI_TRACK_EXAMPLE3: GeminiSpec = {
    tracks: [
        {
            data: {
                url: MULTIVEC_FA,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'base',
                column: 'position',
                value: 'count',
                categories: ['A', 'T', 'G', 'C']
            },
            zoomAction: {
                type: 'alternative-encoding',
                spec: {
                    mark: 'line',
                    row: { field: 'base', type: 'nominal' }
                }
            },
            mark: 'bar',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [3000000, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'count', type: 'quantitative' },
            color: {
                field: 'base',
                type: 'nominal',
                domain: ['A', 'T', 'G', 'C', 'N', 'other'],
                range: ['#007FFF', '#e8e500', '#008000', '#FF0038', '#800080', '#DCDCDC']
            },
            width: 1000,
            height: 180
        }
    ]
};

export const LAYOUT_EXAMPLE_LINK: GeminiSpec = {
    tracks: [
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x: { field: 'from', type: 'nominal' },
            y: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x1: { field: 'from', type: 'nominal' },
            y: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x1: { field: 'from', type: 'nominal' },
            y1: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x: { field: 'from', type: 'nominal' },
            y1: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x: { field: 'from', type: 'nominal' },
            x1: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            y: { field: 'from', type: 'nominal' },
            y1: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        }
    ]
};

export const LAYOUT_EXAMPLE_COMBO: GeminiSpec = {
    references: [
        'http://genocat.tools/tools/combo.html',
        'http://genocat.tools/tools/gbrowse_syn.html',
        'http://genocat.tools/tools/ggbio.html',
        'http://genocat.tools/tools/give.html',
        'http://genocat.tools/tools/variant_view.html'
    ],
    tracks: [
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 800,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x1: { field: 'from', type: 'nominal' },
            x: { field: 'to', type: 'nominal' },
            width: 800,
            height: 50
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 800,
            height: 50
        }
    ]
};

export const LAYOUT_EXAMPLE_COMBO_HORIZONTAL: GeminiSpec = {
    layout: { type: 'linear', direction: 'horizontal' },
    tracks: [
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 60,
            height: 500
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            y: { field: 'from', type: 'nominal' },
            y1: { field: 'to', type: 'nominal' },
            width: 60,
            height: 500
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 60,
            height: 500
        }
    ]
};

export const LAYOUT_EXAMPLE_COMBO_BAND: GeminiSpec = {
    references: [
        'http://genocat.tools/tools/combo.html',
        'http://genocat.tools/tools/gbrowse_syn.html',
        'http://genocat.tools/tools/ggbio.html',
        'http://genocat.tools/tools/give.html',
        'http://genocat.tools/tools/variant_view.html'
    ],
    tracks: [
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'rect',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'sample', type: 'nominal' },
            color: { field: 'peak', type: 'quantitative' },
            width: 800,
            height: 90
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'line',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            width: 800,
            height: 90
        },
        // {
        //     data: {
        //         url: 'https://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA',
        //         type: 'tileset'
        //     },
        //     mark: {
        //         type: 'gene-annotation-higlass',
        //         server: 'gemini-v1'
        //     },
        //     x: { type: 'genomic', axis: true, domain: { chromosome: '2' } },
        //     width: 800,
        //     height: 140
        // },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/range-to-range-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x1: { field: 'from' },
            x1e: { field: 'from1' },
            x: { field: 'to' },
            xe: { field: 'to1' },
            width: 800,
            height: 260,
            stroke: { value: 'none' }
        },
        // {
        //     data: {
        //         url: 'https://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA',
        //         type: 'tileset'
        //     },
        //     mark: {
        //         type: 'gene-annotation-higlass',
        //         server: 'gemini-v1'
        //     },
        //     x: { type: 'genomic', domain: { chromosome: '3' } },
        //     x1: { axis: true },
        //     width: 800,
        //     height: 140
        // },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'bar',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            width: 800,
            height: 90
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'point',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            width: 800,
            height: 90
        }
    ]
};

export const LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS: GeminiSpec = {
    layout: { type: 'linear', direction: 'horizontal', wrap: 2 },
    tracks: [
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30
        }
    ]
};

export const LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS_CIRCULAR: GeminiSpec = {
    layout: { type: 'circular', direction: 'horizontal', wrap: 2 },
    tracks: [
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30
        }
    ]
};
