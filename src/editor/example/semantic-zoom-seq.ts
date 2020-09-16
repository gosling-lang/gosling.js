import { GeminiSpec } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_SEMANTIC_ZOOMING_SEQ: GeminiSpec = {
    tracks: [
        {
            data: {
                url: EXAMPLE_DATASETS.fasta,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'base',
                column: 'position',
                value: 'count',
                categories: ['A', 'T', 'G', 'C']
            },
            semanticZoom: { type: 'auto' },
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
        },
        {
            data: {
                url: EXAMPLE_DATASETS.fasta,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'base',
                column: 'position',
                value: 'count',
                categories: ['A', 'T', 'G', 'C']
            },
            semanticZoom: {
                type: 'alternative-encoding',
                spec: {
                    row: { field: 'base', type: 'nominal' }
                },
                trigger: {
                    type: 'less-than',
                    condition: { zoomLevel: 15 },
                    target: 'track'
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
        },
        {
            data: {
                url: EXAMPLE_DATASETS.fasta,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'base',
                column: 'position',
                value: 'count',
                categories: ['A', 'T', 'G', 'C']
            },
            semanticZoom: {
                type: 'alternative-encoding',
                spec: {
                    mark: 'line',
                    row: { field: 'base', type: 'nominal' }
                },
                trigger: {
                    type: 'less-than',
                    condition: { zoomLevel: 15 },
                    target: 'track'
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
