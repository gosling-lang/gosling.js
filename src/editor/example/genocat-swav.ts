import { GoslingSpec } from '../../core/gosling.schema';
import { EXAMPLE_DATASETS } from './basic/datasets';

export const GENOCAT_SWAV: GoslingSpec = {
    title: 'SWAV',
    subtitle: 'Reimplementation of GenoCAT examples',
    arrangement: {
        rowSizes: [110, 170],
        rowGaps: 0,
        columnSizes: 800
    },
    tracks: [
        {
            title: 'Gene Model',
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
                        domain: { chromosome: '1', interval: [11335, 118169] },
                        axis: 'top',
                        linkingID: '_'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    },
                    color: { value: 'red' },
                    style: {
                        dy: 14
                    }
                },
                {
                    dataTransform: { filter: [{ field: 'type', oneOf: ['gene'], not: false }] },
                    mark: 'rect',
                    x: { field: 'start', type: 'genomic' },
                    size: { value: 14 },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
                }
            ],
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { value: '#008001' },
            visibility: {
                operation: 'less-than',
                condition: { width: '|xe-x|', transitionPadding: 10 },
                target: 'mark'
            },
            style: { outline: 'white' }
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
                categories: ['sample 1', 'sample 2'],
                bin: 4
            },
            superpose: [{ mark: 'line' }, { mark: 'point' }],
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [11335, 118169] },
                linkingID: '_'
            },
            y: { field: 'peak', type: 'quantitative', range: [10, 160] },
            color: { field: 'sample', type: 'nominal', range: ['red', 'purple'], legend: true },
            style: { outline: 'white' }
        }
    ]
};
