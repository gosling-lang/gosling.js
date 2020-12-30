import { GeminidSpec } from '../../../core/geminid.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_CIRCOS_3: GeminidSpec = {
    layout: 'circular',
    arrangement: { direction: 'horizontal' },
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
                categories: [
                    'sample 1',
                    'sample 2',
                    'sample 3',
                    'sample 4',
                    'sample 5',
                    'sample 6',
                    'sample 7',
                    'sample 8',
                    'sample 9',
                    'sample 10',
                    'sample 11',
                    'sample 12'
                    // 'sample 13', 'sample 14', 'sample 15', 'sample 16',
                    // 'sample 17', 'sample 18', 'sample 19', 'sample 20'
                ],
                bin: 4
            },
            mark: 'line',
            x: {
                field: 'position',
                type: 'genomic',
                axis: 'top'
            },
            y: { field: 'peak', type: 'quantitative' },
            color: { field: 'sample', type: 'nominal', range: ['#FF4E4C'] },
            opacity: { value: 0.5 },
            width: 800,
            height: 800,
            outerRadius: 360,
            innerRadius: 300,

            style: { outline: 'white' }
        }
    ]
} as GeminidSpec;
