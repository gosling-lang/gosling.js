import { GeminiSpec } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';
import { EXAMPLE_DEOGRAM_TRACK } from './ideogram';

export const EXAMPLE_SUPERPOSE: GeminiSpec = {
    tracks: [
        EXAMPLE_DEOGRAM_TRACK,
        {
            data: {
                url: EXAMPLE_DATASETS.clinvar,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-bed',
                genomicFields: [
                    { index: 1, name: 'start' },
                    { index: 2, name: 'end' }
                ],
                valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
            },
            superpose: [
                {
                    mark: 'bar',
                    stroke: {
                        field: 'significance',
                        type: 'nominal',
                        domain: [
                            'Pathogenic',
                            'Pathogenic/Likely_pathogenic',
                            'Likely_pathogenic',
                            'Uncertain_significance',
                            'Likely_benign',
                            'Benign/Likely_benign',
                            'Benign'
                        ],
                        range: ['#D45E00', '#D45E00', '#D45E00', 'black', '#029F73', '#029F73', '#029F73']
                    },
                    strokeWidth: { value: 0.5 },
                    size: { value: 1 }
                },
                {
                    mark: 'point',
                    size: { value: 5 }
                }
            ],
            x: {
                field: 'start',
                type: 'genomic',
                domain: { chromosome: '3' },
                axis: 'top'
            },
            x1: {
                field: 'end',
                type: 'genomic'
            },
            y: {
                field: 'significance',
                type: 'nominal',
                domain: [
                    'Pathogenic',
                    'Pathogenic/Likely_pathogenic',
                    'Likely_pathogenic',
                    'Uncertain_significance',
                    'Likely_benign',
                    'Benign/Likely_benign',
                    'Benign'
                ],
                baseline: 'Uncertain_significance',
                range: [150, 20], // TODO: support more accurate positioning
                grid: true
            },
            color: {
                field: 'significance',
                type: 'nominal',
                domain: [
                    'Pathogenic',
                    'Pathogenic/Likely_pathogenic',
                    'Likely_pathogenic',
                    'Uncertain_significance',
                    'Likely_benign',
                    'Benign/Likely_benign',
                    'Benign'
                ],
                range: ['#D45E00', '#D45E00', '#D45E00', 'black', '#029F73', '#029F73', '#029F73']
            },
            opacity: { value: 0.6 },
            width: 1000,
            height: 180
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
            superpose: [
                {
                    mark: 'line'
                },
                {
                    mark: 'point',
                    size: { field: 'peak', type: 'quantitative', range: [0, 6] }
                }
            ],
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] },
                axis: 'top'
            },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            // background: {"value": "red"},
            width: 1000,
            height: 180
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
            mark: 'area',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] },
                axis: 'top'
            },
            superpose: [
                { y: { field: 'peak', type: 'quantitative', domain: [0, 1] } },
                { y: { field: 'peak', type: 'quantitative', domain: [1, 8] } },
                { y: { field: 'peak', type: 'quantitative', domain: [8, 15] } }
            ],
            color: { field: 'sample', type: 'nominal' },
            row: { field: 'sample', type: 'nominal' },
            opacity: { value: 0.4 },
            width: 1000,
            height: 180
        }
    ]
};
