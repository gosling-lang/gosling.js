import { GeminidSpec } from '../../../core/geminid.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXMAPLE_BASIC_MATRIX: GeminidSpec = {
    arrangement: {
        columnSizes: 401,
        rowSizes: 401
    },
    tracks: [
        {
            data: {
                url: EXAMPLE_DATASETS.matrix,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-matrix',
                row: 'y',
                column: 'x',
                value: 'v'
            },
            mark: 'rect',
            x: {
                field: 'startX',
                type: 'genomic',
                axis: 'top'
            },
            xe: {
                field: 'endX',
                type: 'genomic',
                axis: 'top'
            },
            y: {
                field: 'startY',
                type: 'genomic',
                axis: 'left'
            },
            ye: {
                field: 'endY',
                type: 'genomic',
                axis: 'left'
            },
            color: { field: 'v', type: 'quantitative' }
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
                domain: { chromosome: '1', interval: [1, 3000500] },
                axis: 'top'
            },
            row: { field: 'sample', type: 'nominal', legend: true },
            color: { field: 'peak', type: 'quantitative' }
        }
    ].slice(0, 1) as any
};
