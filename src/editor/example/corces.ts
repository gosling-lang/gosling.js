import { GoslingSpec } from '../../core/gosling.schema';

export const EX_SPEC_CORCES_ET_AL: GoslingSpec = {
    title: 'Single-cell Epigenomic Analysis',
    subtitle: 'Corces et al. 2020',
    static: true,
    // subtitle: 'Single-cell epigenomic analyses implicate candidate causal ...',
    // description:
    //     'Corces et al. 2020. Single-cell epigenomic analyses implicate candidate causal variants at inherited risk loci for Alzheimer’s and Parkinson’s diseases. Nature Genetics, pp.1-11.',
    layout: 'linear',
    arrangement: 'vertical',
    views: [
        {
            layout: 'linear',
            xDomain: { chromosome: '3' },
            centerRadius: 0.8,
            tracks: [
                {
                    title: 'chr3',
                    data: {
                        url:
                            'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/cytogenetic_band.csv',
                        type: 'csv',
                        chromosomeField: 'Chr.',
                        genomicFields: ['ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop'],
                        quantitativeFields: ['Band', 'Density']
                    },
                    overlay: [
                        {
                            mark: 'rect',
                            dataTransform: { filter: [{ field: 'Stain', oneOf: ['acen-1', 'acen-2'], not: true }] },
                            color: {
                                field: 'Density',
                                type: 'nominal',
                                domain: ['', '25', '50', '75', '100'],
                                range: ['white', '#D9D9D9', '#979797', '#636363', 'black']
                            },
                            size: { value: 20 }
                        },
                        {
                            mark: 'rect',
                            dataTransform: {
                                filter: [{ field: 'Stain', oneOf: ['gvar'] }]
                            },
                            color: { value: '#A0A0F2' },
                            size: { value: 20 }
                        },
                        {
                            mark: 'triangleRight',
                            dataTransform: {
                                filter: [{ field: 'Stain', oneOf: ['acen-1'] }]
                            },
                            color: { value: '#B40101' },
                            size: { value: 20 }
                        },
                        {
                            mark: 'triangleLeft',
                            dataTransform: {
                                filter: [{ field: 'Stain', oneOf: ['acen-2'] }]
                            },
                            color: { value: '#B40101' },
                            size: { value: 20 }
                        },
                        {
                            mark: 'brush',
                            x: { linkingId: 'detail' },
                            color: { value: 'red' },
                            opacity: { value: 1 },
                            strokeWidth: { value: 1 },
                            stroke: { value: 'red' }
                        }
                    ],
                    x: { field: 'Basepair_start', type: 'genomic', axis: 'none' },
                    xe: { field: 'Basepair_stop', type: 'genomic' },
                    stroke: { value: 'black' },
                    strokeWidth: { value: 1 },
                    style: { outlineWidth: 0 },
                    width: 400,
                    height: 25
                }
            ]
        },
        {
            xDomain: { chromosome: '3', interval: [52168000, 52890000] },
            xLinkingId: 'detail',
            tracks: [
                {
                    data: {
                        url: 'https://resgen.io/api/v1/tileset_info/?d=VLFaiSVjTjW6mkbjRjWREA',
                        type: 'vector',
                        column: 'position',
                        value: 'peak'
                    },
                    title: 'Excitatory neurons',
                    mark: 'bar',
                    x: {
                        field: 'position',
                        type: 'genomic'
                    },
                    y: { field: 'peak', type: 'quantitative' },
                    color: { value: '#F29B67' },
                    style: { outline: '#20102F' },
                    width: 400,
                    height: 40
                },
                {
                    data: {
                        url: 'https://resgen.io/api/v1/tileset_info/?d=UtUGUu9rS3yQ7Ie-YtX32g',
                        type: 'vector',
                        column: 'position',
                        value: 'peak'
                    },
                    title: 'Inhibitory neurons',
                    overlay: [{ mark: 'bar' }],
                    x: { field: 'position', type: 'genomic' },
                    y: { field: 'peak', type: 'quantitative' },
                    color: { value: '#3DC491' },
                    style: { outline: '#20102F' },
                    width: 400,
                    height: 40
                },
                {
                    data: {
                        url: 'https://resgen.io/api/v1/tileset_info/?d=FBwldgSdQQWxh7R7-jemNA',
                        type: 'vector',
                        column: 'position',
                        value: 'peak'
                    },
                    title: 'Dopaminergic neurons',
                    overlay: [{ mark: 'bar' }],
                    x: { field: 'position', type: 'genomic' },
                    y: { field: 'peak', type: 'quantitative' },
                    color: { value: '#565C8B' },
                    style: { outline: '#20102F' },
                    width: 400,
                    height: 40
                },
                {
                    data: {
                        url: 'https://resgen.io/api/v1/tileset_info/?d=Zz3CBDSqQ3ySrOSe2yj1eg',
                        type: 'vector',
                        column: 'position',
                        value: 'peak'
                    },
                    title: 'Microglia',
                    overlay: [{ mark: 'bar' }],
                    x: { field: 'position', type: 'genomic' },
                    y: { field: 'peak', type: 'quantitative' },
                    color: { value: '#77C0FA' },
                    style: { outline: '#20102F' },
                    width: 400,
                    height: 40
                },
                {
                    data: {
                        type: 'vector',
                        url: 'https://resgen.io/api/v1/tileset_info/?d=dc_SOjdCRgq_8PYf6W--7w',
                        column: 'position',
                        value: 'peak'
                    },
                    title: 'Oligodendrocytes',
                    overlay: [{ mark: 'bar' }],
                    x: { field: 'position', type: 'genomic' },
                    y: { field: 'peak', type: 'quantitative' },
                    color: { value: '#9B46E5' },
                    style: { outline: '#20102F' },
                    width: 400,
                    height: 40
                },
                {
                    data: {
                        url: 'https://resgen.io/api/v1/tileset_info/?d=Nolbrk9kS3CE0jJL_7OW1g',
                        type: 'vector',
                        column: 'position',
                        value: 'peak'
                    },
                    title: 'Astrocytes',
                    overlay: [{ mark: 'bar' }],
                    x: { field: 'position', type: 'genomic' },
                    y: { field: 'peak', type: 'quantitative' },
                    color: { value: '#D73636' },
                    style: { outline: '#20102F' },
                    width: 400,
                    height: 40
                },
                {
                    data: {
                        url: 'https://resgen.io/api/v1/tileset_info/?d=UZLlJyRBScWdGQ7L1eNk_g',
                        type: 'vector',
                        column: 'position',
                        value: 'peak'
                    },
                    title: 'OPCs',
                    overlay: [{}],
                    mark: 'bar',
                    x: { field: 'position', type: 'genomic' },
                    y: { field: 'peak', type: 'quantitative' },
                    color: { value: '#E38ADC' },
                    style: { outline: '#20102F' },
                    width: 400,
                    height: 40
                },
                {
                    title: 'Genes',
                    data: {
                        url: 'https://resgen.io/api/v1/tileset_info/?d=M9A9klpwTci5Vf4bHZ864g',
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
                    overlay: [
                        {
                            dataTransform: {
                                filter: [
                                    { field: 'type', oneOf: ['gene'] },
                                    { field: 'strand', oneOf: ['+'] }
                                ]
                            },
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: {
                                field: 'start',
                                type: 'genomic'
                            },
                            xe: { field: 'end', type: 'genomic' },
                            style: { textFontSize: 8, dy: -12 }
                        },
                        {
                            dataTransform: {
                                filter: [
                                    { field: 'type', oneOf: ['gene'] },
                                    { field: 'strand', oneOf: ['-'] }
                                ]
                            },
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            style: { textFontSize: 8, dy: 10 }
                        },
                        {
                            dataTransform: {
                                filter: [
                                    { field: 'type', oneOf: ['gene'] },
                                    { field: 'strand', oneOf: ['+'] }
                                ]
                            },
                            mark: 'rect',
                            x: { field: 'end', type: 'genomic' },
                            size: { value: 7 }
                        },
                        {
                            dataTransform: {
                                filter: [
                                    { field: 'type', oneOf: ['gene'] },
                                    { field: 'strand', oneOf: ['-'] }
                                ]
                            },
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic' },
                            size: { value: 7 }
                        },
                        {
                            dataTransform: { filter: [{ field: 'type', oneOf: ['exon'] }] },
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            size: { value: 14 }
                        },
                        {
                            dataTransform: { filter: [{ field: 'type', oneOf: ['gene'] }] },
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            strokeWidth: { value: 3 }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#012DB8', '#BE1E2C'] },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    style: { outline: '#20102F' },
                    width: 400,
                    height: 80
                },
                // {
                //     title: 'HiChIP (H3K27ac)',
                //     data: {
                //         url: 'https://resgen.io/api/v1/tileset_info/?d=fyY8k9PlS-mGLnBob05_Ow',
                //         type: 'beddb',
                //         genomicFields: [
                //             { name: 'start', index: 1 },
                //             { name: 'end', index: 2 }
                //         ]
                //     },
                //     overlay: [
                //         {},
                //         {
                //             mark: 'brush',
                //             x: { linkingId: 'l-h' },
                //             color: { value: 'blue' },
                //             opacity: { value: 0.2 },
                //             strokeWidth: { value: 0 }
                //         }
                //     ],
                //     mark: 'link',
                //     x: { field: 'start', type: 'genomic',  },
                //     xe: { field: 'end', type: 'genomic' },
                //     y: { flip: true },
                //     strokeWidth: { value: 1 },
                //     color: { value: 'none' },
                //     stroke: { value: 'gray' },
                //     opacity: { value: 0.1 },
                //     style: { outline: '#20102F', circularLink: false },
                //     width: 400,
                //     height: 40
                // },
                // {
                //     data: {
                //         url: 'https://resgen.io/api/v1/tileset_info/?d=fyY8k9PlS-mGLnBob05_Ow',
                //         type: 'beddb',
                //         genomicFields: [
                //             { name: 'start', index: 1 },
                //             { name: 'end', index: 2 }
                //         ]
                //     },
                //     dataTransform: {
                //         filter: [{ field: 'start', inRange: [492449994 + 52450000, 492449994 + 52460000] }]
                //     },
                //     mark: 'link',
                //     x: { field: 'start', type: 'genomic',  },
                //     xe: { field: 'end', type: 'genomic' },
                //     y: { flip: true },
                //     strokeWidth: { value: 1 },
                //     color: { value: 'none' },
                //     stroke: { value: 'red' },
                //     opacity: { value: 1 },
                //     style: { outline: '#20102F', circularLink: false },
                //     overlayOnPreviousTrack: true,
                //     width: 400,
                //     height: 40
                // },
                // {
                //     data: {
                //         url: 'https://resgen.io/api/v1/tileset_info/?d=fyY8k9PlS-mGLnBob05_Ow',
                //         type: 'beddb',
                //         genomicFields: [
                //             { name: 'start', index: 1 },
                //             { name: 'end', index: 2 }
                //         ]
                //     },
                //     dataTransform: {
                //         filter: [{ field: 'end', inRange: [492449994 + 52450000, 492449994 + 52460000] }]
                //     },
                //     mark: 'link',
                //     x: { field: 'start', type: 'genomic',  },
                //     xe: { field: 'end', type: 'genomic' },
                //     y: { flip: true },
                //     strokeWidth: { value: 1 },
                //     color: { value: 'none' },
                //     stroke: { value: 'red' },
                //     opacity: { value: 1 },
                //     style: { outline: '#20102F', circularLink: false },
                //     overlayOnPreviousTrack: true,
                //     width: 400,
                //     height: 40
                // },
                {
                    data: {
                        url: 'https://resgen.io/api/v1/tileset_info/?d=EqSENQSXRL-EWYeBe-Y1rA',
                        type: 'beddb',
                        genomicFields: [
                            { name: 'start', index: 1 },
                            { name: 'end', index: 2 }
                        ]
                    },
                    mark: 'link',
                    x: { field: 'start', type: 'genomic' },
                    xe: { field: 'end', type: 'genomic' },
                    y: { flip: true },
                    strokeWidth: { value: 1 },
                    color: { value: 'none' },
                    stroke: { value: '#F97E2A' },
                    opacity: { value: 0.1 },
                    style: { outline: '#20102F' },
                    width: 400,
                    height: 60
                },
                {
                    data: {
                        url: 'https://resgen.io/api/v1/tileset_info/?d=R4e7-rVfQPWTleJIJjLOEQ',
                        type: 'beddb',
                        genomicFields: [
                            { name: 'start', index: 1 },
                            { name: 'end', index: 2 }
                        ]
                    },
                    mark: 'link',
                    x: { field: 'start', type: 'genomic' },
                    xe: { field: 'end', type: 'genomic' },
                    y: { flip: true },
                    strokeWidth: { value: 1 },
                    color: { value: 'none' },
                    stroke: { value: '#50ADF9' },
                    opacity: { value: 0.1 },
                    style: { outline: '#20102F' },
                    overlayOnPreviousTrack: true,
                    width: 400,
                    height: 60
                },
                {
                    title: 'PLAC-seq (H3K4me3) Nott et al.',
                    data: {
                        url: 'https://resgen.io/api/v1/tileset_info/?d=JzccFAJUQEiz-0188xaWZg',
                        type: 'beddb',
                        genomicFields: [
                            { name: 'start', index: 1 },
                            { name: 'end', index: 2 }
                        ]
                    },
                    mark: 'link',
                    x: { field: 'start', type: 'genomic' },
                    xe: { field: 'end', type: 'genomic' },
                    y: { flip: true },
                    strokeWidth: { value: 1 },
                    color: { value: 'none' },
                    stroke: { value: '#7B0EDC' },
                    opacity: { value: 0.1 },
                    style: { outline: '#20102F' },
                    overlayOnPreviousTrack: true,
                    width: 400,
                    height: 60
                }
                // {
                //     title: '(Artificial data)',
                //     data: {
                //         url: EXAMPLE_DATASETS.multivec,
                //         type: 'multivec',
                //         row: 'base',
                //         column: 'position',
                //         value: 'count',
                //         categories: ['A', 'T', 'G', 'C'],
                //         start: 'start',
                //         end: 'end',
                //         bin: 1
                //     },
                //     mark: 'text',
                //     y: { field: 'count', type: 'quantitative' },
                //     x: {
                //         field: 'start',
                //         type: 'genomic',
                //         linkingId: 'l-h',
                //         domain: { chromosome: '3', interval: [52450000, 52465000] }
                //     },
                //     xe: { field: 'end', type: 'genomic' },
                //     color: {
                //         field: 'base',
                //         type: 'nominal',
                //         domain: ['A', 'T', 'G', 'C'],
                //         range: ['#008001', '#FE0300', '#FFA500', '#1300FF']
                //     },
                //     text: { field: 'base', type: 'nominal' },
                //     stretch: true,
                //     style: { outline: '#20102F', textStrokeWidth: 0 }
                // }
            ]
        }
    ]
};
