import { GeminidSpec } from '../../core/geminid.schema';
import bed from './bed.json';

export const EXAMPLE_OF_EXPERIMENT: GeminidSpec = {
    tracks: [
        {
            data: {
                type: 'json',
                values: bed,
                chromosomeField: 'chr',
                genomicFields: ['start', 'end'],
                quantitativeFields: ['peak']
            },
            mark: 'point',
            color: { value: 'blue' },
            x: { field: 'start', type: 'genomic', axis: 'bottom', domain: { chromosome: '1' } },
            y: { field: 'peak', type: 'quantitative' },
            strokeWidth: { value: 0 },
            opacity: { value: 0.1 }
        }
    ]
};
