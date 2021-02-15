import { Range, Domain, GoslingSpec } from '../../core/gosling.schema';

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

export const EX_SPEC_FUJI_PLOT: GoslingSpec = {
    title: 'Fuji Plot',
    subtitle: 'Kanai, M. et al., Nat. Genet. (2018)',
    static: true,
    layout: 'circular',
    centerHole: 0.05,
    tracks: [
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
            style: { outlineWidth: 0.5 },
            width: 550,
            height: 200
        },
        {
            data: {
                type: 'csv',
                url: 'https://raw.githubusercontent.com/mkanai/fujiplot/master/input_example/input.txt',
                chromosomeField: 'CHR',
                genomicFields: ['BP'],
                separator: '\t'
            },
            mark: 'rect',
            stackY: true,
            x: { field: 'BP', type: 'genomic' },
            size: { value: 12 },
            color: { field: 'CATEGORY', type: 'nominal', domain: colorDomain, range: colorRange, legend: true },
            style: { outlineWidth: 0.5 },
            width: 550,
            height: 30
        }
    ]
};
