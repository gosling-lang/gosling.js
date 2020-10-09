import { GeminiSpec } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_LOGO_LIKE: GeminiSpec = {
    tracks: [
        {
            title: 'based on dummy data',
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'base',
                column: 'position',
                value: 'count',
                categories: ['A', 'T', 'G', 'C'],
                start: 'start',
                end: 'end',
                bin: 16
            },
            superpose: [
                {
                    mark: 'bar',
                    y: { field: 'count', type: 'quantitative' }
                },
                {
                    mark: 'text',
                    y: { field: 'count', type: 'quantitative' },
                    color: {
                        field: 'base',
                        type: 'nominal',
                        domain: ['A', 'T', 'G', 'C'],
                        range: ['white', 'white', 'white', 'white']
                    },
                    style: {
                        textStrokeWidth: 0
                    },
                    stretch: true
                }
            ],
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: {
                field: 'base',
                type: 'nominal',
                domain: ['A', 'T', 'G', 'C']
            },
            text: {
                field: 'base',
                type: 'nominal'
            },
            width: 1000,
            height: 180
        },
        {
            title: 'based on dummy data',
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'base',
                column: 'position',
                value: 'count',
                categories: ['A', 'T', 'G', 'C'],
                start: 'start',
                end: 'end',
                bin: 16
            },
            superpose: [
                {
                    mark: 'text',
                    y: { field: 'count', type: 'quantitative' },
                    style: {
                        textStrokeWidth: 0
                    },
                    stretch: true
                }
            ],
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: {
                field: 'base',
                type: 'nominal',
                domain: ['A', 'T', 'G', 'C']
            },
            text: {
                field: 'base',
                type: 'nominal'
            },
            width: 1000,
            height: 180
        }
    ]
};
