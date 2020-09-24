import { GeminiSpec } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';
import { EXAMPLE_IDEOGRAM_TRACK } from './ideogram';

export const EXAMPLE_OVERVIEW_DEATIL: GeminiSpec = {
    layout: { type: 'linear', direction: 'horizontal', wrap: 2 },
    tracks: [
        EXAMPLE_IDEOGRAM_TRACK,
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
                        domain: { chromosome: '1', interval: [17600000, 20400000] },
                        axis: 'top'
                    },
                    x1: { field: 'end1', type: 'genomic' },
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
                        domain: { chromosome: '1', interval: [3550000, 3700000] },
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
                        domain: { chromosome: '2', interval: [10000000, 10400000] },
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
