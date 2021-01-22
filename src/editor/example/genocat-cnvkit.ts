import { GoslingSpec } from '../../core/gosling.schema';
import { EXAMPLE_DATASETS } from './basic/datasets';

export const GENOCAT_CNVKIT: GoslingSpec = {
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
                url: 'https://raw.githubusercontent.com/etal/cnvkit/master/test/formats/tr95t.cns',
                type: 'csv',
                separator: '\t',
                quantitativeFields: ['log2'], //, 'depth', 'weight'],
                genomicFields: ['start', 'end'],
                chromosomeField: 'chromosome'
            },
            mark: 'rect',
            x: { field: 'start', type: 'genomic', axis: 'bottom' },
            xe: { field: 'end', type: 'genomic' },
            y: { field: 'log2', type: 'quantitative', domain: [4, -1], zeroBaseline: false },
            size: { value: 2 },
            color: { value: 'red' },
            opacity: { value: 1 },
            style: {
                outline: 'black',
                outlineWidth: 2
            }
        },
        {
            title: 'Copy ratio (log2)',
            data: {
                url: 'https://raw.githubusercontent.com/etal/cnvkit/master/test/formats/tr95t.segmetrics.cns',
                type: 'csv',
                separator: '\t',
                quantitativeFields: ['log2'], //, 'depth', 'weight'],
                genomicFields: ['start', 'end'],
                chromosomeField: 'chromosome'
            },
            mark: 'point',
            x: { field: 'start', type: 'genomic', axis: 'bottom' },
            xe: { field: 'end', type: 'genomic' },
            y: { field: 'log2', type: 'quantitative', domain: [-1, 4], zeroBaseline: false },
            size: { value: 2 },
            color: { value: 'gray' },
            opacity: { value: 1 },
            style: {
                outline: 'black',
                outlineWidth: 2
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
            static: true,
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
            static: true,
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
