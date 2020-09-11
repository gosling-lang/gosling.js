import { GeminiSpec } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_OVERVIEW_DEATIL: GeminiSpec = {
    layout: { type: 'linear', direction: 'horizontal', wrap: 2 },
    tracks: [
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/chr1_cytogenetic_band.glyph.csv',
                type: 'csv',
                quantitativeFields: ['Band', 'ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop', 'Density']
            },
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
            width: 1000,
            height: 60
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 0,
            height: 60
        },
        {
            data: {
                url: EXAMPLE_DATASETS.interaction,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-bed',
                genomicFields: [
                    { name: 'start1', index: 9 },
                    { name: 'end1', index: 10 },
                    { name: 'start2', index: 14 },
                    { name: 'end2', index: 15 }
                ]
            },
            superpose: [
                {
                    mark: 'link',
                    x: {
                        field: 'start1',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [17600000, 20400000] }
                    },
                    x1: { field: 'end1', type: 'genomic', axis: true },
                    xe: {
                        field: 'start2',
                        type: 'genomic'
                    },
                    x1e: { field: 'end2', type: 'genomic' }
                }
            ],
            color: { value: 'lightgray' },
            stroke: { value: 'gray' },
            opacity: { value: 0.2 },
            width: 1000,
            height: 120
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 0,
            height: 120
        },
        {
            data: {
                url: EXAMPLE_DATASETS.multivec,
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
                domain: { chromosome: '1' }
            },
            row: { field: 'sample', type: 'nominal' },
            // row: { field: 'sample', type: 'nominal' },
            color: { field: 'peak', type: 'quantitative' },
            // stroke: {value: 'white'},
            // strokeWidth: {value: 1},
            width: 1000,
            height: 180
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 0,
            height: 180
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 0,
            height: 50
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 0,
            height: 50
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
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [3550000, 3700000] }
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
            width: 500,
            height: 120,
            style: {
                stroke: 'blue'
            }
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
                    dataTransform: { filter: [{ field: 'type', oneOf: ['exon'], not: false }] },
                    mark: 'rect',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '2', interval: [10000000, 10400000] }
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
            width: 500,
            height: 120,
            style: {
                stroke: 'red'
            }
        },
        {
            data: {
                url: EXAMPLE_DATASETS.multivec,
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
                domain: { chromosome: '1', interval: [3550000, 3700000] }
            },
            row: { field: 'sample', type: 'nominal' },
            // row: { field: 'sample', type: 'nominal' },
            color: { field: 'peak', type: 'quantitative' },
            // stroke: {value: 'white'},
            // strokeWidth: {value: 1},
            width: 500,
            height: 180,
            style: {
                stroke: 'blue'
            }
        },
        {
            data: {
                url: EXAMPLE_DATASETS.multivec,
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
                domain: { chromosome: '2', interval: [10000000, 10400000] }
            },
            row: { field: 'sample', type: 'nominal' },
            // row: { field: 'sample', type: 'nominal' },
            color: { field: 'peak', type: 'quantitative' },
            // stroke: {value: 'white'},
            // strokeWidth: {value: 1},
            width: 500,
            height: 180,
            style: {
                stroke: 'red'
            }
        }
    ]
};
