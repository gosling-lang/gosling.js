import { GoslingSpec } from '../../core/gosling.schema';
import { EX_TRACK_GENE_ANNOTATION } from './gene-annotation';
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
    centerRadius: 0.1,
    layout: 'linear',
    spacing: 0,
    tracks: [
        EX_TRACK_GENE_ANNOTATION.higlass,
        {
            data: {
                url: GOSLING_PUBLIC_DATA.clinvar,
                type: 'beddb',
                genomicFields: [
                    { index: 1, name: 'start' },
                    { index: 2, name: 'end' }
                ],
                valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
            },
            overlay: [
                {
                    mark: 'bar',
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
                        // grid: true,
                        range: [150, 20]
                    },
                    size: { value: 1 },
                    color: { value: 'lightgray' },
                    stroke: { value: 'lightgray' },
                    strokeWidth: { value: 1 },
                    opacity: { value: 0.3 },
                    visibility: [
                        {
                            measure: 'zoomLevel',
                            target: 'mark',
                            threshold: 100000,
                            operation: 'LT',
                            transitionPadding: 100000
                        }
                    ]
                },
                {
                    mark: 'point',
                    row: {
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
                        ]
                    },
                    visibility: [
                        {
                            measure: 'zoomLevel',
                            target: 'mark',
                            threshold: 1000000,
                            operation: 'LT',
                            transitionPadding: 1000000
                        }
                    ]
                }
            ],
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
                range: ['#CB3B8C', '#CB71A3', '#CB96B3', 'gray', '#029F73', '#5A9F8C', '#5A9F8C']
            },
            x: { field: 'start', type: 'genomic' },
            size: { value: 7 },
            opacity: { value: 0.8 },
            width: 700,
            height: 150
        },
        {
            data: {
                url: GOSLING_PUBLIC_DATA.clinvardensity,
                type: 'multivec',
                row: 'significance',
                column: 'position',
                value: 'count',
                categories: [
                    'Benign',
                    'Benign/Likely_benign',
                    'Likely_benign',
                    'Uncertain_significance',
                    'Likely_pathogenic',
                    'Pathogenic/Likely_pathogenic',
                    'Pathogenic'
                    // 'risk_factor',
                    // 'Conflicting_interpretations_of_pathogenicity'
                ],
                bin: 4
                // bin: 16
            },
            mark: 'bar',
            x: { field: 'start', type: 'genomic' },
            xe: { field: 'end', type: 'genomic' },
            y: { field: 'count', type: 'quantitative' },
            // row: {
            //     field: 'significance',
            //     type: 'nominal',
            //     domain: [
            //         'Pathogenic',
            //         'Pathogenic/Likely_pathogenic',
            //         'Likely_pathogenic',
            //         'Uncertain_significance',
            //         'Likely_benign',
            //         'Benign/Likely_benign',
            //         'Benign'
            //     ]
            // },
            // opacity: { field: 'count', type: 'quantitative', range: [0.05, 1] },
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
                range: ['#CB3B8C', '#CB71A3', '#CB96B3', 'gray', '#029F73', '#5A9F8C', '#5A9F8C'],
                legend: true
            },
            visibility: [
                {
                    measure: 'zoomLevel',
                    target: 'mark',
                    threshold: 500000,
                    operation: 'GT',
                    transitionPadding: 500000
                }
            ],
            overlayOnPreviousTrack: true,
            width: 700,
            height: 0
        }
        // {
        //     title: 'Pathogenic Lollipop Plot',
        //     data: {
        //         url: GOSLING_PUBLIC_DATA.clinvar,
        //         type: 'beddb',
        //         genomicFields: [
        //             { index: 1, name: 'start' },
        //             { index: 2, name: 'end' }
        //         ],
        //         valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
        //     },
        //     overlay: [
        //         {
        //             dataTransform: {
        //                 filter: [
        //                     {
        //                         field: 'significance',
        //                         oneOf: ['Pathogenic', 'Pathogenic/Likely_pathogenic', 'Likely_pathogenic']
        //                     }
        //                 ]
        //             },
        //             mark: 'bar',
        //             y: {
        //                 field: 'significance',
        //                 type: 'nominal',
        //                 domain: [
        //                     'Pathogenic',
        //                     'Pathogenic/Likely_pathogenic',
        //                     'Likely_pathogenic',
        //                     'Uncertain_significance'
        //                 ]
        //             },
        //             color: { value: 'lightgray' },
        //             stroke: { value: 'lightgray' },
        //             strokeWidth: { value: 1 },
        //             opacity: { value: 0.8 },
        //             size: { value: 1 }
        //         },
        //         {
        //             dataTransform: {
        //                 filter: [
        //                     {
        //                         field: 'significance',
        //                         oneOf: ['Pathogenic', 'Pathogenic/Likely_pathogenic', 'Likely_pathogenic']
        //                     }
        //                 ]
        //             },
        //             mark: 'point',
        //             y: {
        //                 field: 'significance',
        //                 type: 'nominal',
        //                 domain: [
        //                     'Pathogenic',
        //                     'Pathogenic/Likely_pathogenic',
        //                     'Likely_pathogenic',
        //                     'Uncertain_significance'
        //                 ]
        //             },
        //             size: { value: 8 },
        //             stroke: { value: 'black' },
        //             opacity: { value: 0.1 },
        //             strokeWidth: { value: 0.5 },
        //             color: {
        //                 field: 'significance',
        //                 type: 'nominal',
        //                 domain: [
        //                     'Pathogenic',
        //                     'Pathogenic/Likely_pathogenic',
        //                     'Likely_pathogenic',
        //                     'Benign',
        //                     'Benign/Likely_benign',
        //                     'Likely_benign'
        //                 ],
        //                 range: ['#CB3B8C', '#CB71A3', '#CB96B3', '#029F73', '#5A9F8C', '#5A9F8C'],
        //                 legend: true
        //             }
        //         },
        //         {
        //             dataTransform: {
        //                 filter: [
        //                     {
        //                         field: 'significance',
        //                         oneOf: ['Benign', 'Benign/Likely_benign', 'Likely_benign']
        //                     }
        //                 ]
        //             },
        //             mark: 'bar',
        //             y: {
        //                 field: 'significance',
        //                 type: 'nominal',
        //                 domain: ['Benign', 'Benign/Likely_benign', 'Likely_benign', 'Uncertain_significance']
        //             },
        //             color: { value: 'lightgray' },
        //             stroke: { value: 'lightgray' },
        //             strokeWidth: { value: 1 },
        //             opacity: { value: 0.8 },
        //             size: { value: 1 }
        //         },
        //         {
        //             dataTransform: {
        //                 filter: [
        //                     {
        //                         field: 'significance',
        //                         oneOf: ['Benign', 'Benign/Likely_benign', 'Likely_benign']
        //                     }
        //                 ]
        //             },
        //             mark: 'point',
        //             y: {
        //                 field: 'significance',
        //                 type: 'nominal',
        //                 domain: ['Benign', 'Benign/Likely_benign', 'Likely_benign', 'Uncertain_significance']
        //             },
        //             size: { value: 8 },
        //             stroke: { value: 'black' },
        //             opacity: { value: 0.1 },
        //             strokeWidth: { value: 0.5 },
        //             color: {
        //                 field: 'significance',
        //                 type: 'nominal',
        //                 domain: ['Benign', 'Benign/Likely_benign', 'Likely_benign'],
        //                 range: ['#029F73', '#5A9F8C', '#5A9F8C']
        //             }
        //         }
        //     ],
        //     x: { field: 'start', type: 'genomic' },
        //     // xe: { field: 'end', type: 'genomic' },
        //     opacity: { value: 0.8 },
        //     style: { outline: 'white' },
        //     width: 700,
        //     height: 250
        // },
        // {
        //     // title: 'Genes',
        //     data: {
        //         url: 'https://resgen.io/api/v1/tileset_info/?d=M9A9klpwTci5Vf4bHZ864g',
        //         type: 'beddb',
        //         genomicFields: [
        //             { index: 1, name: 'start' },
        //             { index: 2, name: 'end' }
        //         ],
        //         valueFields: [
        //             { index: 5, name: 'strand', type: 'nominal' },
        //             { index: 3, name: 'name', type: 'nominal' }
        //         ],
        //         exonIntervalFields: [
        //             { index: 12, name: 'start' },
        //             { index: 13, name: 'end' }
        //         ]
        //     },
        //     overlay: [
        //         {
        //             dataTransform: {
        //                 filter: [{ field: 'type', oneOf: ['gene'] }]
        //             },
        //             mark: 'rule',
        //             x: {
        //                 field: 'start',
        //                 type: 'genomic'
        //             },
        //             strokeWidth: { value: 7 },
        //             xe: {
        //                 field: 'end',
        //                 type: 'genomic'
        //             },
        //             color: { value: 'lightgray' }
        //         },
        //         {
        //             dataTransform: {
        //                 filter: [
        //                     { field: 'type', oneOf: ['gene'] },
        //                     { field: 'strand', oneOf: ['+'] }
        //                 ]
        //             },
        //             mark: 'triangle-r',
        //             x: {
        //                 field: 'end',
        //                 type: 'genomic'
        //             },
        //             size: { value: 40 }
        //         },
        //         {
        //             dataTransform: {
        //                 filter: [
        //                     { field: 'type', oneOf: ['gene'] },
        //                     { field: 'strand', oneOf: ['-'] }
        //                 ]
        //             },
        //             mark: 'triangle-l',
        //             x: {
        //                 field: 'start',
        //                 type: 'genomic'
        //             },
        //             size: { value: 40 },
        //             style: { align: 'right', outline: 'white' }
        //         },
        //         {
        //             dataTransform: {
        //                 filter: [{ field: 'type', oneOf: ['gene'] }]
        //             },
        //             mark: 'text',
        //             text: { field: 'name', type: 'nominal' },
        //             x: {
        //                 field: 'start',
        //                 type: 'genomic'
        //             },
        //             xe: {
        //                 field: 'end',
        //                 type: 'genomic'
        //             },
        //             color: { value: 'black' },
        //             style: { textFontSize: 20 }
        //         },
        //         {
        //             dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
        //             mark: 'rect',
        //             x: {
        //                 field: 'start',
        //                 type: 'genomic'
        //             },
        //             xe: {
        //                 field: 'end',
        //                 type: 'genomic'
        //             }
        //         }
        //     ],
        //     row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
        //     color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#7585FF', '#FF8A85'] },
        //     visibility: [
        //         {
        //             operation: 'less-than',
        //             measure: 'width',
        //             threshold: '|xe-x|',
        //             transitionPadding: 10,
        //             target: 'mark'
        //         }
        //     ],
        //     style: { outline: 'white' },
        //     opacity: { value: 0.8 },
        //     width: 700,
        //     height: 80
        // }
    ]
};
