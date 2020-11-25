import { GeminidSpec, MultivecMetadata } from '../../core/geminid.schema';
import { EXAMPLE_DATASETS } from './datasets';
import { HIGLASS_GENE_ANNOTATION } from './gene-annotation';
import { EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM } from './semantic-zoom';

const MULTIVEC_METADATA: MultivecMetadata = {
    type: 'higlass-multivec',
    row: 'sample',
    column: 'position',
    value: 'peak',
    categories: ['sample 1'],
    bin: 16
};

const NO_AXIS_HIGLASS_GENE_ANNOTATION = JSON.parse(JSON.stringify(HIGLASS_GENE_ANNOTATION));

NO_AXIS_HIGLASS_GENE_ANNOTATION.superpose[0].x.axis = undefined;
NO_AXIS_HIGLASS_GENE_ANNOTATION.superpose[0].x.domain = { chromosome: '6' };
NO_AXIS_HIGLASS_GENE_ANNOTATION.superpose[0].x.linker = '1';
NO_AXIS_HIGLASS_GENE_ANNOTATION.color.range = ['#3B3B3B', '#3B3B3B'];

export const EXAMPLE_UPSET: GeminidSpec = {
    // description: '*Circular glyphs on the middle represent that peaks in the corresponding region are greater than 500',
    tracks: [
        {
            // title: 'Overview',
            ...JSON.parse(JSON.stringify(EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM).replace('/gray/g', '#3B3B3B')),
            superpose: [
                ...(JSON.parse(JSON.stringify(EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM).replace('/gray/g', '#3B3B3B')) as any)
                    .superpose,
                {
                    mark: 'rect-brush',
                    x: { linkingID: '1' },
                    color: { value: 'blue' },
                    opacity: { value: 0.2 }
                }
            ]
        },
        {
            mark: 'empty',
            data: { type: 'csv', url: '' },
            width: 50,
            height: 50
        },
        {
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            metadata: MULTIVEC_METADATA,
            dataTransform: { filter: [{ field: 'peak', inRange: [0, 0], not: true }] },
            superpose: [
                { mark: 'bar' }
                // { mark: 'text' }
            ],
            x: {
                field: 'start',
                type: 'genomic',
                domain: { chromosome: '1' },
                linkingID: '1'
            },
            xe: { field: 'end', type: 'genomic' },
            y: { field: 'peak', type: 'quantitative', range: [0, 340] },
            text: { field: 'peak', type: 'quantitative' },
            color: { value: '#3B3B3B' },
            stroke: { value: 'white' },
            strokeWidth: { value: 0.5 },
            width: 1000,
            height: 380,
            style: {
                dy: 10
            }
        },
        {
            title: '(Peak > 0.001)',
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            dataTransform: { filter: [{ field: 'peak', inRange: [0, 0.001], not: true }] },
            metadata: { ...MULTIVEC_METADATA, categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4'] },
            mark: 'point',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1' },
                axis: 'top',
                linkingID: '1'
            },
            row: { field: 'sample', type: 'nominal', domain: ['sample 1', 'sample 2', 'sample 3', 'sample 4'] },
            color: { value: '#3B3B3B' },
            size: { value: 7 },
            width: 1000,
            height: 180
        },
        {
            title: 'Gene Annotation',
            ...NO_AXIS_HIGLASS_GENE_ANNOTATION
        }
    ]
};
