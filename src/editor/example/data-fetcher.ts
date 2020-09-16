import { GeminiSpec } from '../../core/gemini.schema';

export const EXAMPLE_DATA_FETCHER: GeminiSpec = {
    tracks: [
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/Homo_sapiens.GRCh38.92.small.csv',
                quantitativeFields: ['start', 'end'],
                urlAlt:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/chr1_cytogenetic_band.glyph.csv',
                quantitativeFieldsAlt: [
                    'Band',
                    'ISCN_start',
                    'ISCN_stop',
                    'Basepair_start',
                    'Basepair_stop',
                    'Density'
                ],
                type: 'csv'
            },
            semanticZoom: {
                type: 'alternative-encoding',
                spec: {
                    superpose: [
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
                    strokeWidth: { value: 0.5 },
                    dataTransform: { filter: [] }
                },
                trigger: {
                    type: 'less-than',
                    condition: { zoomLevel: 9 },
                    target: 'track'
                }
            },
            superpose: [
                {
                    dataTransform: {
                        filter: [
                            { field: 'feature', oneOf: ['gene'], not: false },
                            { field: 'strand', oneOf: ['+'], not: false }
                        ]
                    },
                    mark: 'triangle-r',
                    x: {
                        field: 'end',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [1, 300000] }
                    },
                    color: { value: '#999999' }
                },
                {
                    dataTransform: {
                        filter: [
                            { field: 'feature', oneOf: ['gene'], not: false },
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
                    dataTransform: { filter: [{ field: 'feature', oneOf: ['gene'], not: false }] },
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
                    dataTransform: { filter: [{ field: 'feature', oneOf: ['gene'], not: false }] },
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
                    dataTransform: { filter: [{ field: 'feature', oneOf: ['exon'], not: false }] },
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
            width: 1000,
            height: 60
        }
    ]
};
