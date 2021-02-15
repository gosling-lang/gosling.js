import { GoslingSpec } from '../../core/gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const allDomains = [
    'Pathogenic',
    'Pathogenic/Likely_pathogenic',
    'Likely_pathogenic',
    'Uncertain_significance',
    'Likely_benign',
    'Benign/Likely_benign',
    'Benign'
];

export const EX_SPEC_PATHOGENIC: GoslingSpec = {
    xDomain: { chromosome: '3', interval: [10140000, 10160000] },
    parallelViews: [
        {
            spacing: 0,
            tracks: [
                {
                    title: 'Pathogenic Lollipop Plot',
                    data: {
                        url: GOSLING_PUBLIC_DATA.clinvar,
                        type: 'bed',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
                    },
                    overlay: [
                        {
                            dataTransform: {
                                filter: [
                                    {
                                        field: 'significance',
                                        oneOf: ['Pathogenic', 'Pathogenic/Likely_pathogenic', 'Likely_pathogenic']
                                    }
                                ]
                            },
                            mark: 'bar',
                            y: {
                                field: 'significance',
                                type: 'nominal',
                                domain: [
                                    'Pathogenic',
                                    'Pathogenic/Likely_pathogenic',
                                    'Likely_pathogenic',
                                    'Uncertain_significance'
                                ]
                            },
                            color: { value: 'lightgray' },
                            stroke: { value: 'lightgray' },
                            strokeWidth: { value: 1 },
                            opacity: { value: 0.8 },
                            size: { value: 1 }
                        },
                        {
                            dataTransform: {
                                filter: [
                                    {
                                        field: 'significance',
                                        oneOf: ['Pathogenic', 'Pathogenic/Likely_pathogenic', 'Likely_pathogenic']
                                    }
                                ]
                            },
                            mark: 'point',
                            y: {
                                field: 'significance',
                                type: 'nominal',
                                domain: [
                                    'Pathogenic',
                                    'Pathogenic/Likely_pathogenic',
                                    'Likely_pathogenic',
                                    'Uncertain_significance'
                                ]
                            },
                            size: { value: 8 },
                            stroke: { value: 'white' },
                            opacity: { value: 0.6 },
                            strokeWidth: { value: 2 },
                            color: {
                                field: 'significance',
                                type: 'nominal',
                                domain: [
                                    'Pathogenic',
                                    'Pathogenic/Likely_pathogenic',
                                    'Likely_pathogenic',
                                    'Benign',
                                    'Benign/Likely_benign',
                                    'Likely_benign'
                                ],
                                range: ['#CB3B8C', '#CB71A3', '#CB96B3', '#029F73', '#5A9F8C', '#5A9F8C'],
                                legend: true
                            }
                        },
                        {
                            dataTransform: {
                                filter: [
                                    {
                                        field: 'significance',
                                        oneOf: ['Benign', 'Benign/Likely_benign', 'Likely_benign']
                                    }
                                ]
                            },
                            mark: 'bar',
                            y: {
                                field: 'significance',
                                type: 'nominal',
                                domain: ['Benign', 'Benign/Likely_benign', 'Likely_benign', 'Uncertain_significance']
                            },
                            color: { value: 'lightgray' },
                            stroke: { value: 'lightgray' },
                            strokeWidth: { value: 1 },
                            opacity: { value: 0.8 },
                            size: { value: 1 }
                        },
                        {
                            dataTransform: {
                                filter: [
                                    {
                                        field: 'significance',
                                        oneOf: ['Benign', 'Benign/Likely_benign', 'Likely_benign']
                                    }
                                ]
                            },
                            mark: 'point',
                            y: {
                                field: 'significance',
                                type: 'nominal',
                                domain: ['Benign', 'Benign/Likely_benign', 'Likely_benign', 'Uncertain_significance']
                            },
                            size: { value: 8 },
                            stroke: { value: 'white' },
                            opacity: { value: 0.6 },
                            strokeWidth: { value: 2 },
                            color: {
                                field: 'significance',
                                type: 'nominal',
                                domain: ['Benign', 'Benign/Likely_benign', 'Likely_benign'],
                                range: ['#029F73', '#5A9F8C', '#5A9F8C']
                            }
                        }
                    ],
                    x: { field: 'start', type: 'genomic' },
                    xe: { field: 'end', type: 'genomic' },
                    opacity: { value: 0.8 },
                    style: { outline: 'white' },
                    width: 700,
                    height: 250
                },
                {
                    // title: 'Genes',
                    data: {
                        url: 'https://resgen.io/api/v1/tileset_info/?d=M9A9klpwTci5Vf4bHZ864g',
                        type: 'bed',
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
                    overlay: [
                        {
                            dataTransform: {
                                filter: [{ field: 'type', oneOf: ['gene'] }]
                            },
                            mark: 'rule',
                            x: {
                                field: 'start',
                                type: 'genomic'
                            },
                            strokeWidth: { value: 7 },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            },
                            color: { value: 'lightgray' }
                        },
                        {
                            dataTransform: {
                                filter: [
                                    { field: 'type', oneOf: ['gene'] },
                                    { field: 'strand', oneOf: ['+'] }
                                ]
                            },
                            mark: 'triangle-r',
                            x: {
                                field: 'end',
                                type: 'genomic'
                            },
                            size: { value: 40 }
                        },
                        {
                            dataTransform: {
                                filter: [
                                    { field: 'type', oneOf: ['gene'] },
                                    { field: 'strand', oneOf: ['-'] }
                                ]
                            },
                            mark: 'triangle-l',
                            x: {
                                field: 'start',
                                type: 'genomic'
                            },
                            size: { value: 40 },
                            style: { align: 'right', outline: 'white' }
                        },
                        {
                            dataTransform: {
                                filter: [{ field: 'type', oneOf: ['gene'] }]
                            },
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: {
                                field: 'start',
                                type: 'genomic'
                            },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            },
                            color: { value: 'black' }
                        },
                        {
                            dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
                            mark: 'rect',
                            x: {
                                field: 'start',
                                type: 'genomic'
                            },
                            xe: {
                                field: 'end',
                                type: 'genomic'
                            }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#7585FF', '#FF8A85'] },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    style: { outline: 'white' },
                    opacity: { value: 0.8 },
                    width: 700,
                    height: 80
                }
            ]
        }
    ]
};
