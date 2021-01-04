import { GeminidSpec } from '../../core/geminid.schema';
import { EXAMPLE_DATASETS } from './basic/datasets';

export const GENOCAT_CNVKIT: GeminidSpec = {
    title: 'CNVkit',
    subtitle: 'Reimplementation of GenoCAT examples',
    arrangement: {
        direction: 'horizontal',
        wrap: 2,
        columnSizes: [420, 300],
        rowSizes: [170, 20, 20],
        columnGaps: 80,
        rowGaps: [80, 10, 10, 10]
    },
    tracks: [
        {
            title: 'Copy ratio (log2)',
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1']
            },
            mark: 'point',
            x: { field: 'position', type: 'genomic', axis: 'bottom' },
            y: { field: 'peak', type: 'quantitative', zeroBaseline: false },
            size: { value: 1 },
            color: { value: '#818181' },
            opacity: { value: 0.5 },
            style: {
                outline: 'black',
                outlineWidth: 2
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
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4', 'sample 5', 'sample 6']
            },
            mark: 'rect',
            x: { field: 'position', type: 'genomic', axis: 'bottom', domain: { chromosome: '12' } },
            row: { field: 'sample', type: 'nominal', legend: true },
            color: { field: 'peak', type: 'quantitative', domain: [0.0001, 0.001], range: 'rdbu' },
            style: {
                outline: 'black',
                outlineWidth: 2
            }
        },
        {
            span: 2,
            title: 'chr1',
            width: 420,
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2']
            },
            mark: 'rect',
            x: { field: 'position', type: 'genomic', domain: { chromosome: '1' } },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'peak', type: 'quantitative', domain: [0.0001, 0.001], range: 'rdbu' },
            style: {
                outline: 'black',
                outlineWidth: 2
            }
        },
        {
            span: 2,
            title: 'chr2',
            width: 380,
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2']
            },
            mark: 'rect',
            x: { field: 'position', type: 'genomic', domain: { chromosome: '2' } },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'peak', type: 'quantitative', domain: [0.0001, 0.001], range: 'rdbu' },
            style: {
                outline: 'black',
                outlineWidth: 2
            }
        }
    ]
};
