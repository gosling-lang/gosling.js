import { GoslingSpec } from '../../core/gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

const genomicAxisVisibility = [
    {
        operation: 'greater-than',
        measure: 'zoomLevel',
        threshold: 200000000,
        transitionPadding: 50000000,
        target: 'mark'
    }
];

const ideogramVisibility = [
    {
        operation: 'less-than',
        measure: 'zoomLevel',
        threshold: 200000000,
        transitionPadding: 50000000,
        target: 'mark'
    },
    {
        operation: 'greater-than',
        measure: 'zoomLevel',
        threshold: 2000000,
        transitionPadding: 500000,
        target: 'mark'
    }
];
const ideogramCommon = {
    x: { field: 'chromStart', type: 'genomic', axis: 'bottom' },
    xe: { field: 'chromEnd', type: 'genomic', axis: 'bottom' },
    size: { value: 20 },
    stroke: { value: 'black' },
    strokeWidth: { value: 1 }
};

const geneData = {
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
};

const geneVisibility = [
    {
        operation: 'less-than',
        measure: 'zoomLevel',
        threshold: 1000000,
        transitionPadding: 500000,
        target: 'mark'
    }
];

const geneCommon = {
    color: { value: 'black' },
    opacity: { value: 0.9 },
    size: { value: 15 }
};

export const EX_SPEC_DEBUG: GoslingSpec = {
    // xDomain: { chromosome: '8', interval: [127734727, 127742774] },
    views: [
        {
            tracks: [
                {
                    alignment: 'overlay',
                    tracks: [
                        {
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                                type: 'csv',
                                chromosomeField: 'Chromosome',
                                genomicFields: ['chromStart', 'chromEnd']
                            },
                            mark: 'rect',
                            color: {
                                field: 'Chromosome',
                                type: 'nominal',
                                domain: [
                                    'chr1',
                                    'chr2',
                                    'chr3',
                                    'chr4',
                                    'chr5',
                                    'chr6',
                                    'chr7',
                                    'chr8',
                                    'chr9',
                                    'chr10',
                                    'chr11',
                                    'chr12',
                                    'chr13',
                                    'chr14',
                                    'chr15',
                                    'chr16',
                                    'chr17',
                                    'chr18',
                                    'chr19',
                                    'chr20',
                                    'chr21',
                                    'chr22',
                                    'chrX',
                                    'chrY'
                                ],
                                range: ['black', 'black']
                            },
                            x: {
                                field: 'chromStart',
                                type: 'genomic',
                                aggregate: 'min',
                                axis: 'bottom'
                            },
                            xe: {
                                field: 'chromEnd',
                                aggregate: 'max',
                                type: 'genomic',
                                axis: 'bottom'
                            },
                            stroke: { value: 'white' },
                            strokeWidth: { value: 3 },
                            size: { value: 6 },
                            visibility: genomicAxisVisibility
                        },
                        // start of ideogram
                        // {
                        //     data: {
                        //         url:
                        //             'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                        //         type: 'csv',
                        //         chromosomeField: 'Chromosome',
                        //         genomicFields: ['chromStart', 'chromEnd']
                        //     },
                        //     mark: 'text',
                        //     dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen'], not: true }],
                        //     text: { field: 'Name', type: 'nominal' },
                        //     color: {
                        //         field: 'Stain',
                        //         type: 'nominal',
                        //         domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                        //         range: ['black', 'black', 'black', 'black', 'white', 'black']
                        //     },
                        //     x: { field: 'chromStart', type: 'genomic' },
                        //     xe: { field: 'chromEnd', type: 'genomic' },
                        //     size: { value: 20 },
                        //     stroke: { value: 'gray' },
                        //     strokeWidth: { value: 0.5 },
                        //     visibility: [
                        //         {
                        //             operation: 'less-than',
                        //             measure: 'width',
                        //             threshold: '|xe-x|',
                        //             transitionPadding: 10,
                        //             target: 'mark'
                        //         }
                        //     ]
                        // },
                        {
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                                type: 'csv',
                                chromosomeField: 'Chromosome',
                                genomicFields: ['chromStart', 'chromEnd']
                            },
                            mark: 'rect',
                            dataTransform: [{ type: 'filter', field: 'Stain', oneOf: ['acen'], not: true }],
                            color: {
                                field: 'Stain',
                                type: 'nominal',
                                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                                range: ['white', '#D9D9D9', '#979797', '#636363', 'black', '#A0A0F2']
                            },
                            ...ideogramCommon,
                            visibility: ideogramVisibility
                        },
                        {
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                                type: 'csv',
                                chromosomeField: 'Chromosome',
                                genomicFields: ['chromStart', 'chromEnd']
                            },
                            mark: 'triangleRight',
                            dataTransform: [
                                { type: 'filter', field: 'Stain', oneOf: ['acen'] },
                                { type: 'filter', field: 'Name', include: 'q' }
                            ],
                            color: { value: '#B40101' },
                            ...ideogramCommon,
                            visibility: ideogramVisibility
                        },
                        {
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                                type: 'csv',
                                chromosomeField: 'Chromosome',
                                genomicFields: ['chromStart', 'chromEnd']
                            },
                            mark: 'triangleLeft',
                            dataTransform: [
                                { type: 'filter', field: 'Stain', oneOf: ['acen'] },
                                { type: 'filter', field: 'Name', include: 'p' }
                            ],
                            color: { value: '#B40101' },
                            ...ideogramCommon,
                            visibility: ideogramVisibility
                        },
                        // Start of genes
                        {
                            data: geneData,
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'triangleRight',
                            x: {
                                field: 'end',
                                type: 'genomic',
                                axis: 'bottom'
                            },
                            ...geneCommon,
                            visibility: geneVisibility
                        },
                        {
                            data: geneData,
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'triangleLeft',
                            x: {
                                field: 'start',
                                type: 'genomic',
                                axis: 'bottom'
                            },
                            ...geneCommon,
                            style: { align: 'right' },
                            visibility: geneVisibility
                        },
                        {
                            data: geneData,
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: {
                                field: 'start',
                                type: 'genomic',
                                axis: 'bottom'
                            },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            },
                            ...geneCommon,
                            visibility: geneVisibility
                        },
                        {
                            data: geneData,
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rule',
                            x: {
                                field: 'start',
                                type: 'genomic',
                                axis: 'bottom'
                            },
                            strokeWidth: { value: 3 },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            },
                            ...geneCommon,
                            visibility: geneVisibility
                        },
                        {
                            data: geneData,
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: {
                                field: 'start',
                                type: 'genomic',
                                axis: 'bottom'
                            },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            },
                            strokeWidth: { value: 3 },
                            stroke: { value: 'black' },
                            ...geneCommon,
                            // size: { value: 24 },
                            style: { dx: -10 },
                            color: { value: 'white' },
                            visibility: [
                                {
                                    operation: 'less-than',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    transitionPadding: 10,
                                    target: 'mark'
                                }
                            ]
                        },
                        // Start of sequence
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.fasta,
                                type: 'multivec',
                                row: 'base',
                                column: 'position',
                                value: 'count',
                                categories: ['A', 'T', 'G', 'C'],
                                start: 'start',
                                end: 'end'
                            },
                            mark: 'bar',
                            y: { field: 'count', type: 'quantitative', axis: 'none' },
                            x: {
                                field: 'position',
                                type: 'genomic',
                                axis: 'bottom'
                            },
                            color: {
                                field: 'base',
                                type: 'nominal',
                                domain: ['A', 'T', 'G', 'C'],
                                legend: false
                            },
                            visibility: [
                                {
                                    operation: 'less-than',
                                    measure: 'zoomLevel',
                                    threshold: 1000,
                                    transitionPadding: 500,
                                    target: 'mark'
                                }
                            ]
                        },
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.fasta,
                                type: 'multivec',
                                row: 'base',
                                column: 'position',
                                value: 'count',
                                categories: ['A', 'T', 'G', 'C'],
                                start: 'start',
                                end: 'end'
                            },
                            dataTransform: [{ type: 'filter', field: 'count', oneOf: [0], not: true }],
                            mark: 'text',
                            x: {
                                field: 'start',
                                type: 'genomic',
                                axis: 'bottom'
                            },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            },
                            size: { value: 24 },
                            color: { value: 'white' },
                            visibility: [
                                {
                                    operation: 'less-than',
                                    measure: 'zoomLevel',
                                    threshold: 50,
                                    transitionPadding: 25,
                                    target: 'mark'
                                }
                            ],
                            text: {
                                field: 'base',
                                type: 'nominal'
                            }
                        }
                    ],
                    width: 800,
                    height: 30
                }
            ]
        }
    ]
};
