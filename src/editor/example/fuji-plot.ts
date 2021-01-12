import { Domain, GeminidSpec, Range } from '../../core/geminid.schema';

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

export const FUJI_PLOT: GeminidSpec = {
    title: 'Fuji Plot',
    subtitle: 'Kanai, M. et al., Nat. Genet. (2018)',
    static: true,
    layout: 'circular',
    arrangement: {
        columnSizes: 550,
        rowSizes: 550
    },
    tracks: [
        /* Manual way, trick, to draw background */
        // {
        //     startAngle: 0,
        //     endAngle: 270,
        //     outerRadius: 250,
        //     innerRadius: 60,
        //     data: {
        //         type: 'csv',
        //         url: 'https://raw.githubusercontent.com/mkanai/fujiplot/master/input_example/input.txt',
        //         chromosomeField: 'CHR',
        //         genomicFields: ['BP'],
        //         separator: '\t'
        //     },
        //     mark: 'rect',
        //     superpose: [
        //         {
        //             x: { value: 0 },
        //             xe: { value: 550 },
        //             y: { value: 0 },
        //             ye: { value: 550 },
        //             color: { value: '#CDE3C7' },
        //         },
        //         {
        //             outerRadius: 250,
        //             innerRadius: 230,
        //             style: { background: '#F5D9C0' },
        //         }
        //     ]
        // },
        /* End of manual way, trick, to draw background */
        {
            startAngle: 0,
            endAngle: 270,
            outerRadius: 250,
            innerRadius: 60,
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
            color: { field: 'CATEGORY', type: 'nominal', domain: colorDomain, range: colorRange, legend: true },
            size: { value: 3 },
            stroke: { value: 'black' },
            strokeWidth: { value: 0.5 },
            // style: { background: '#F5D9C0' }
            superposeOnPreviousTrack: true
        },
        {
            startAngle: 0,
            endAngle: 270,
            outerRadius: 55,
            innerRadius: 20,
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
            color: { field: 'CATEGORY', type: 'nominal', domain: colorDomain, range: colorRange },
            superposeOnPreviousTrack: true
        }
    ]
};
