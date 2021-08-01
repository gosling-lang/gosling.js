import { Range, Domain, GoslingSpec } from '../../core/gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

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

export const EX_SPEC_DEBUG: GoslingSpec = {
    title: 'Chart Templates',
    subtitle: 'Using chart templates in Gosling.js helps you more easily create visualizations!',
    spacing: 0,
    tracks: [
        {
            template: 'gene',
            data: {
                url: GOSLING_PUBLIC_DATA.geneAnnotation,
                type: 'beddb',
                genomicFields: [
                    { index: 1, name: 'start' },
                    { index: 2, name: 'end' }
                ],
                valueFields: [
                    { index: 5, name: 'strand', type: 'nominal' },
                    { index: 3, name: 'name', type: 'nominal' }
                ],
                exonIntervalFields: [
                    { index: 12, name: 'start' },
                    { index: 13, name: 'end' }
                ]
            },
            encoding: {
                startPosition: { field: 'start' },
                endPosition: { field: 'end' },
                strandColor: { field: 'strand' },
                geneHeight: { value: 30 },
                geneLabel: { field: 'name' },
                type: { field: 'type' }
            },
            width: 800,
            height: 300
        },
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
