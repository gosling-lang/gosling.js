import { GoslingSpec } from '../../../core/gosling.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_LOGO: GoslingSpec = {
    layout: 'linear',
    arrangement: {
        direction: 'vertical',
        rowSizes: 180,
        columnSizes: 180
    },
    tracks: [
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
            mark: 'triangle-d',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [3000500, 4000500] }
            },
            y: { field: 'peak', type: 'quantitative', range: [120, -200] },
            size: { value: 3 },
            color: { value: 'white' },
            opacity: { value: 0.2 },
            style: {
                background: '#082333',
                outline: 'lightgray',
                outlineWidth: 3
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
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4', 'sample 5', 'sample 6'],
                bin: 8
            },
            dataTransform: {
                filter: [{ field: 'sample', oneOf: ['sample 6'], not: false }]
            },
            mark: 'point',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [3000500, 4000500] }
            },
            y: { field: 'peak', type: 'quantitative', range: [60, 180] },
            size: { value: 5 },
            color: { value: 'white' },
            opacity: { value: 0.5 },
            style: {
                outline: 'lightgray',
                outlineWidth: 3
            },
            superposeOnPreviousTrack: true
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
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4', 'sample 5'],
                bin: 8
            },
            dataTransform: {
                filter: [{ field: 'sample', oneOf: ['sample 5'], not: false }]
            },
            mark: 'area',
            x: {
                field: 'position',
                type: 'genomic'
            },
            y: { field: 'peak', type: 'quantitative', range: [35, 65] },
            size: { field: 'peak', type: 'quantitative' },
            stroke: { value: '#002F4E' },
            strokeWidth: { value: 4 },
            color: { value: '#040715' },
            opacity: { value: 1 },
            style: {
                outline: 'lightgray',
                outlineWidth: 3
            },
            superposeOnPreviousTrack: true
        }
    ]
};
