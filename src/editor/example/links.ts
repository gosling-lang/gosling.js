import { GeminiSpec } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_LINKS: GeminiSpec = {
    tracks: [
        {
            data: {
                url: EXAMPLE_DATASETS.region2,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-bed',
                genomicFields: [
                    { name: 'start', index: 1 },
                    { name: 'end', index: 2 }
                ]
            },
            superpose: [
                {
                    mark: 'link',
                    x: {
                        field: 'start',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [19590000, 19630000] },
                        axis: 'top'
                    },
                    xe: {
                        field: 'end',
                        type: 'genomic'
                    }
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
