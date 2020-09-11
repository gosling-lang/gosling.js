import { GeminiSpec } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_LINKS: GeminiSpec = {
    tracks: [
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
                        domain: { chromosome: '1', interval: [19300000, 22000000] }
                    },
                    x1: { field: 'end1', type: 'genomic', axis: true },
                    xe: {
                        field: 'start2',
                        type: 'genomic'
                    },
                    x1e: { field: 'end2', type: 'genomic' }
                }
            ],
            color: { value: '#399AB6' },
            stroke: { value: '#399AB6' },
            opacity: { value: 0.5 },
            width: 1000,
            height: 120
        }
    ]
};
