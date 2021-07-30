import { Range, Domain, GoslingSpec, TemplateTrack } from '../../core/gosling.schema';

const colorDomain: Domain = [
    'Metabolic',
    'Protein',
    'Kidney-related',
    'Electrolyte',
    'Liver-related',
    'Other biochemical',
    'Hematological',
    'Blood pressure',
    'Echocardiographic'
];

const colorRange: Range = [
    '#E4812E',
    '#8C60B6',
    '#80594E',
    '#6BBCCC',
    '#BA2E2C',
    '#7F7F7F',
    '#5BA245',
    '#F3DE67',
    '#CE72BB'
];

export const geneTemplate: TemplateTrack = {
    template: 'gene',
    data: {
        type: 'csv',
        url: 'https://raw.githubusercontent.com/mkanai/fujiplot/master/input_example/input.txt',
        chromosomeField: 'CHR',
        genomicFields: ['BP'],
        separator: '\t'
    },
    width: 800,
    height: 300
}

export const EX_SPEC_DEBUG: GoslingSpec = {
    title: 'Chart Templates',
    subtitle: 'Using chart templates in Gosling.js helps you more easily create visualizations!',
    spacing: 0,
    tracks: [
        geneTemplate,
        {
            data: {
                type: 'csv',
                url: 'https://raw.githubusercontent.com/mkanai/fujiplot/master/input_example/input.txt',
                chromosomeField: 'CHR',
                genomicFields: ['BP'],
                separator: '\t'
            },
            mark: 'point',
            x: { field: 'BP', type: 'genomic' },
            y: { field: 'TRAIT', type: 'nominal' },
            row: { field: 'CATEGORY', type: 'nominal', domain: colorDomain },
            color: { field: 'CATEGORY', type: 'nominal', domain: colorDomain, range: colorRange },
            size: { value: 3 },
            stroke: { value: 'black' },
            strokeWidth: { value: 0.5 },
            width: 800,
            height: 300
        }
    ]
};
