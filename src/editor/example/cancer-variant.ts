import { GoslingSpec } from '../..';

export function view(sample: string): GoslingSpec {
    return {
        layout: 'circular',
        spacing: 1,
        tracks: [
            {
                title: 'Overview',
                alignment: 'overlay',
                data: {
                    url:
                        'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                    type: 'csv',
                    chromosomeField: 'Chromosome',
                    genomicFields: ['chromStart', 'chromEnd']
                },
                tracks: [{ mark: 'rect' }, { mark: 'brush', x: { linkingId: 'mid-scale' } }],
                color: {
                    field: 'Stain',
                    type: 'nominal',
                    domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar', 'acen'],
                    range: ['#C0C0C0', '#808080', '#404040', 'black', 'black', 'black', '#B74780']
                },
                size: { value: 18 },
                x: { field: 'chromStart', type: 'genomic' },
                xe: { field: 'chromEnd', type: 'genomic' },
                opacity: { value: 0.3 },
                width: 500,
                height: 40
            },
            // {
            //     title: sample,
            //     data: {
            //         url: `https://s3.amazonaws.com/gosling-lang.org/data/cancer/substitution.${sample}.csv`,
            //         type: 'csv',
            //         chromosomeField: 'Chrom',
            //         genomicFields: ['Pos'],
            //         quantitativeFields: ['GP', 'SP', 'DP', 'PosDiff']
            //     },
            //     dataTransform: [
            //         { type: 'concat', fields: ['Ref', 'Alt'], separator: ' > ', newField: 'sub' },
            //         {
            //             type: 'replace',
            //             field: 'sub',
            //             newField: 'sub',
            //             replace: [
            //                 { from: 'G > A', to: 'C > T' },
            //                 { from: 'G > T', to: 'C > A' },
            //                 { from: 'G > C', to: 'C > G' },
            //                 { from: 'A > G', to: 'T > C' },
            //                 { from: 'A > T', to: 'T > A' },
            //                 { from: 'A > C', to: 'T > G' }
            //             ]
            //         }
            //     ],
            //     mark: 'point',
            //     x: { field: 'Pos', type: 'genomic' },
            //     y: { field: 'PosDiff', type: 'quantitative', flip: true },
            //     size: { field: 'PosDiff', type: 'quantitative' },
            //     color: {
            //         field: 'sub',
            //         type: 'nominal',
            //         legend: true,
            //         domain: ['C > A', 'C > G', 'C > T', 'T > A', 'T > C', 'T > G'],
            //         range: ['#0072B2', 'black', '#D45E00', 'gray', '#029F73', '#CB7AA7']
            //     },
            //     opacity: { value: 0.3 },
            //     style: { outlineWidth: 1, outline: 'lightgray' },
            //     // "stroke": {"field": "svclass", "type": "nominal"},
            //     width: 500,
            //     height: 80
            // },
            // {
            //     data: {
            //         url: `https://s3.amazonaws.com/gosling-lang.org/data/cancer/indel.${sample}.csv`,
            //         type: 'csv',
            //         chromosomeField: 'Chrom',
            //         genomicFields: ['Pos']
            //     },
            //     mark: 'rect',
            //     x: { field: 'Pos', type: 'genomic' },
            //     color: { field: 'Type', type: 'nominal', domain: ['Ins', 'Del'], range: ['green', 'red'] },
            //     row: { field: 'Type', type: 'nominal', domain: ['Ins', 'Del'] },
            //     width: 500,
            //     height: 40
            // },
            {
                data: {
                    url: `https://s3.amazonaws.com/gosling-lang.org/data/cancer/rearrangement.${sample}.csv`,
                    type: 'csv',
                    genomicFieldsToConvert: [
                        { chromosomeField: 'chr1', genomicFields: ['start1', 'end1'] },
                        { chromosomeField: 'chr2', genomicFields: ['start2', 'end2'] }
                    ]
                },
                mark: 'withinLink',
                x: { field: 'start1', type: 'genomic' },
                xe: { field: 'end2', type: 'genomic' },
                color: {
                    field: 'svclass',
                    type: 'nominal',
                    legend: true,
                    domain: ['translocation', 'delection', 'tandem-duplication', 'inversion']
                },
                stroke: {
                    field: 'svclass',
                    type: 'nominal',
                    domain: ['translocation', 'delection', 'tandem-duplication', 'inversion']
                },
                width: 500,
                height: 80
            }
        ]
    };
}

export const EX_SPEC_CANCER_VARIANT: GoslingSpec = {
    title: 'Breast Cancer Variant (Staaf et al. 2019)',
    subtitle: 'Genetic characteristics of RAD51C- and PALB2-altered TNBCs',
    layout: 'linear',
    arrangement: 'vertical',
    centerRadius: 0.6,
    assembly: 'hg19',
    views: [
        {
            arrangement: 'horizontal',
            views: [{ ...view('PD35930a') } as any, { ...view('PD36000a') } as any]
        },
        {
            arrangement: 'horizontal',
            views: [{ ...view('PD31042a') } as any, { ...view('PD35930a') } as any]
        }
    ]
};

export const EX_SPEC_CANCER_VARIANT_PROTOTYPE: GoslingSpec = {
    title: 'Breast Cancer Variant (Staaf et al. 2019)',
    subtitle: 'Genetic characteristics of RAD51C- and PALB2-altered TNBCs',
    theme: { base: 'light', legend: { backgroundStroke: '#ffffff' } },
    layout: 'linear',
    arrangement: 'vertical',
    centerRadius: 0.6,
    assembly: 'hg19',
    spacing: 40,
    views: [
        {
            arrangement: 'vertical',
            views: [
                {
                    layout: 'circular',
                    spacing: 1,
                    tracks: [
                        {
                            title: 'Patient Overview (PD35930a)',
                            alignment: 'overlay',
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                                type: 'csv',
                                chromosomeField: 'Chromosome',
                                genomicFields: ['chromStart', 'chromEnd']
                            },
                            tracks: [
                                { mark: 'rect' },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'mid-scale' },
                                    strokeWidth: { value: 0 }
                                }
                            ],
                            color: {
                                field: 'Stain',
                                type: 'nominal',
                                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar', 'acen'],
                                range: ['#C0C0C0', '#808080', '#404040', 'black', 'black', 'black', '#B74780']
                            },
                            size: { value: 18 },
                            x: { field: 'chromStart', type: 'genomic' },
                            xe: { field: 'chromEnd', type: 'genomic' },
                            opacity: { value: 0.3 },
                            width: 500,
                            height: 40
                        },
                        {
                            alignment: 'overlay',
                            data: {
                                url: 'https://s3.amazonaws.com/gosling-lang.org/data/cancer/cnv.PD35930a.csv',
                                headerNames: [
                                    'id',
                                    'chr',
                                    'start',
                                    'end',
                                    'total_cn_normal',
                                    'minor_cp_normal',
                                    'total_cn_tumor',
                                    'minor_cn_tumor'
                                ],
                                type: 'csv',
                                chromosomeField: 'chr',
                                genomicFields: ['start', 'end']
                            },
                            dataTransform: [{ type: 'filter', field: 'minor_cn_tumor', oneOf: ['0'] }],
                            tracks: [
                                { mark: 'rect' },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'mid-scale' },
                                    strokeWidth: { value: 0 }
                                }
                            ],
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#FD7E85' },
                            stroke: { value: 'lightgray' },
                            strokeWidth: { value: 0.3 },
                            width: 620,
                            height: 20
                        },
                        {
                            alignment: 'overlay',
                            data: {
                                url: 'https://s3.amazonaws.com/gosling-lang.org/data/cancer/cnv.PD35930a.csv',
                                headerNames: [
                                    'id',
                                    'chr',
                                    'start',
                                    'end',
                                    'total_cn_normal',
                                    'minor_cp_normal',
                                    'total_cn_tumor',
                                    'minor_cn_tumor'
                                ],
                                type: 'csv',
                                chromosomeField: 'chr',
                                genomicFields: ['start', 'end']
                            },
                            dataTransform: [
                                {
                                    type: 'filter',
                                    field: 'total_cn_tumor',
                                    inRange: [4.5, 900]
                                }
                            ],
                            tracks: [
                                { mark: 'rect' },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'mid-scale' },
                                    strokeWidth: { value: 0 }
                                }
                            ],
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#DFFBBF' },
                            stroke: { value: 'lightgray' },
                            strokeWidth: { value: 0.3 },
                            width: 500,
                            height: 20
                        },
                        {
                            data: {
                                url: 'https://s3.amazonaws.com/gosling-lang.org/data/cancer/rearrangement.PD35930a.csv',
                                type: 'csv',
                                genomicFieldsToConvert: [
                                    {
                                        chromosomeField: 'chr1',
                                        genomicFields: ['start1', 'end1']
                                    },
                                    {
                                        chromosomeField: 'chr2',
                                        genomicFields: ['start2', 'end2']
                                    }
                                ]
                            },
                            mark: 'withinLink',
                            x: { field: 'start1', type: 'genomic' },
                            xe: { field: 'end2', type: 'genomic' },
                            color: {
                                field: 'svclass',
                                type: 'nominal',
                                legend: true,
                                domain: ['translocation', 'delection', 'tandem-duplication', 'inversion']
                            },
                            stroke: {
                                field: 'svclass',
                                type: 'nominal',
                                domain: ['translocation', 'delection', 'tandem-duplication', 'inversion']
                            },
                            strokeWidth: { value: 1.5 },
                            opacity: { value: 0.5 },
                            width: 500,
                            height: 80
                        }
                    ]
                },
                {
                    linkingId: 'mid-scale',
                    xDomain: { chromosome: '1' },
                    xAxis: 'bottom',
                    layout: 'linear',
                    spacing: 0,
                    tracks: [
                        {
                            title: 'Genomic Feature',
                            alignment: 'overlay',
                            data: {
                                url: 'https://s3.amazonaws.com/gosling-lang.org/data/cancer/rearrangement.PD35930a.csv',
                                type: 'csv',
                                genomicFieldsToConvert: [
                                    {
                                        chromosomeField: 'chr1',
                                        genomicFields: ['start1', 'end1']
                                    },
                                    {
                                        chromosomeField: 'chr2',
                                        genomicFields: ['start2', 'end2']
                                    }
                                ]
                            },
                            tracks: [
                                { mark: 'withinLink' },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'detail-1' },
                                    strokeWidth: { value: 0 },
                                    color: { value: 'gray' }
                                },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'detail-2' },
                                    strokeWidth: { value: 0 },
                                    color: { value: 'gray' }
                                }
                            ],
                            x: { field: 'start1', type: 'genomic', axis: 'none' },
                            xe: { field: 'end2', type: 'genomic' },
                            color: {
                                field: 'svclass',
                                type: 'nominal',
                                legend: true,
                                domain: ['translocation', 'delection', 'tandem-duplication', 'inversion']
                            },
                            stroke: {
                                field: 'svclass',
                                type: 'nominal',
                                domain: ['translocation', 'delection', 'tandem-duplication', 'inversion']
                            },
                            style: {
                                outline: 'lightgray',
                                inlineLegend: true,
                                bazierLink: true
                            },
                            strokeWidth: { value: 2.5 },
                            opacity: { value: 0.3 },
                            width: 400,
                            height: 250
                        },
                        {
                            title: 'LOH',
                            alignment: 'overlay',
                            data: {
                                url: 'https://s3.amazonaws.com/gosling-lang.org/data/cancer/cnv.PD35930a.csv',
                                headerNames: [
                                    'id',
                                    'chr',
                                    'start',
                                    'end',
                                    'total_cn_normal',
                                    'minor_cp_normal',
                                    'total_cn_tumor',
                                    'minor_cn_tumor'
                                ],
                                type: 'csv',
                                chromosomeField: 'chr',
                                genomicFields: ['start', 'end']
                            },
                            dataTransform: [{ type: 'filter', field: 'minor_cn_tumor', oneOf: ['0'] }],
                            tracks: [
                                { mark: 'rect' },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'detail-1' },
                                    strokeWidth: { value: 0 },
                                    color: { value: 'gray' }
                                },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'detail-2' },
                                    strokeWidth: { value: 0 },
                                    color: { value: 'gray' }
                                }
                            ],
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#FD7E85' },
                            stroke: { value: 'lightgray' },
                            strokeWidth: { value: 0.3 },
                            style: { outline: 'lightgray' },
                            width: 620,
                            height: 20
                        },
                        {
                            title: 'Gain',
                            alignment: 'overlay',
                            data: {
                                url: 'https://s3.amazonaws.com/gosling-lang.org/data/cancer/cnv.PD35930a.csv',
                                headerNames: [
                                    'id',
                                    'chr',
                                    'start',
                                    'end',
                                    'total_cn_normal',
                                    'minor_cp_normal',
                                    'total_cn_tumor',
                                    'minor_cn_tumor'
                                ],
                                type: 'csv',
                                chromosomeField: 'chr',
                                genomicFields: ['start', 'end']
                            },
                            dataTransform: [
                                {
                                    type: 'filter',
                                    field: 'total_cn_tumor',
                                    inRange: [4.5, 900]
                                }
                            ],
                            tracks: [
                                { mark: 'rect' },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'detail-1' },
                                    strokeWidth: { value: 0 },
                                    color: { value: 'gray' }
                                },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'detail-2' },
                                    strokeWidth: { value: 0 },
                                    color: { value: 'gray' }
                                }
                            ],
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#DFFBBF' },
                            stroke: { value: 'lightgray' },
                            strokeWidth: { value: 0.3 },
                            style: { outline: 'lightgray' },
                            width: 500,
                            height: 20
                        },
                        {
                            alignment: 'overlay',
                            title: 'hg38 | Genes',
                            data: {
                                url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
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
                            tracks: [
                                {
                                    dataTransform: [
                                        { type: 'filter', field: 'type', oneOf: ['gene'] },
                                        { type: 'filter', field: 'strand', oneOf: ['+'] }
                                    ],
                                    mark: 'triangleRight',
                                    x: { field: 'end', type: 'genomic' },
                                    size: { value: 15 }
                                },
                                {
                                    dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                                    mark: 'text',
                                    text: { field: 'name', type: 'nominal' },
                                    x: { field: 'start', type: 'genomic' },
                                    xe: { field: 'end', type: 'genomic' },
                                    style: { dy: -15, outline: 'black', outlineWidth: 0 }
                                },
                                {
                                    dataTransform: [
                                        { type: 'filter', field: 'type', oneOf: ['gene'] },
                                        { type: 'filter', field: 'strand', oneOf: ['-'] }
                                    ],
                                    mark: 'triangleLeft',
                                    x: { field: 'start', type: 'genomic' },
                                    size: { value: 15 },
                                    style: { align: 'right', outline: 'black', outlineWidth: 0 }
                                },
                                {
                                    dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                                    mark: 'rect',
                                    x: { field: 'start', type: 'genomic' },
                                    size: { value: 15 },
                                    xe: { field: 'end', type: 'genomic' }
                                },
                                {
                                    dataTransform: [
                                        { type: 'filter', field: 'type', oneOf: ['gene'] },
                                        { type: 'filter', field: 'strand', oneOf: ['+'] }
                                    ],
                                    mark: 'rule',
                                    x: { field: 'start', type: 'genomic' },
                                    strokeWidth: { value: 2 },
                                    xe: { field: 'end', type: 'genomic' },
                                    style: {
                                        linePattern: { type: 'triangleRight', size: 3.5 },
                                        outline: 'black',
                                        outlineWidth: 0
                                    }
                                },
                                {
                                    dataTransform: [
                                        { type: 'filter', field: 'type', oneOf: ['gene'] },
                                        { type: 'filter', field: 'strand', oneOf: ['-'] }
                                    ],
                                    mark: 'rule',
                                    x: { field: 'start', type: 'genomic' },
                                    strokeWidth: { value: 2 },
                                    xe: { field: 'end', type: 'genomic' },
                                    style: {
                                        linePattern: { type: 'triangleLeft', size: 3.5 },
                                        outline: 'black',
                                        outlineWidth: 0
                                    }
                                },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'detail-1' },
                                    strokeWidth: { value: 0 },
                                    color: { value: 'gray' },
                                    opacity: { value: 0.3 }
                                },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'detail-2' },
                                    strokeWidth: { value: 0 },
                                    color: { value: 'gray' },
                                    opacity: { value: 0.3 }
                                }
                            ],
                            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                            color: {
                                field: 'strand',
                                type: 'nominal',
                                domain: ['+', '-'],
                                range: ['gray', 'gray']
                            },
                            visibility: [
                                {
                                    operation: 'less-than',
                                    measure: 'width',
                                    threshold: '|xe-x|',
                                    transitionPadding: 10,
                                    target: 'mark'
                                }
                            ],
                            opacity: { value: 0.8 },
                            style: { background: '#F5F5F5', outline: 'lightgray' },
                            width: 400,
                            height: 100
                        },
                        {
                            alignment: 'overlay',
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                                type: 'csv',
                                chromosomeField: 'Chromosome',
                                genomicFields: ['chromStart', 'chromEnd']
                            },
                            tracks: [
                                { mark: 'rect' },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'detail-1' },
                                    strokeWidth: { value: 0 },
                                    color: { value: 'gray' }
                                },
                                {
                                    mark: 'brush',
                                    x: { linkingId: 'detail-2' },
                                    strokeWidth: { value: 0 },
                                    color: { value: 'gray' }
                                }
                            ],
                            color: {
                                field: 'Stain',
                                type: 'nominal',
                                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar', 'acen'],
                                range: ['#C0C0C0', '#808080', '#404040', 'black', 'black', 'black', '#B74780']
                            },
                            x: { field: 'chromStart', type: 'genomic', axis: 'bottom' },
                            xe: { field: 'chromEnd', type: 'genomic' },
                            opacity: { value: 0.3 },
                            width: 1000,
                            height: 20
                        }
                    ]
                }
            ]
        },
        {
            arrangement: 'horizontal',
            spacing: 90,
            views: [
                {
                    xDomain: { chromosome: '1', interval: [100000000, 110000000] },
                    linkingId: 'detail-1',
                    tracks: [
                        {
                            title: 'Reads Detail View 1 (To Be Added)',
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                                type: 'csv',
                                chromosomeField: 'Chromosome',
                                genomicFields: ['chromStart', 'chromEnd']
                            },
                            mark: 'rect',
                            color: {
                                field: 'Stain',
                                type: 'nominal',
                                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar', 'acen'],
                                range: ['#C0C0C0', '#808080', '#404040', 'black', 'black', 'black', '#B74780']
                            },
                            x: { field: 'chromStart', type: 'genomic' },
                            xe: { field: 'chromEnd', type: 'genomic' },
                            opacity: { value: 0.3 },
                            width: 452,
                            height: 100
                        }
                    ]
                },
                {
                    linkingId: 'detail-2',
                    xDomain: { chromosome: '1', interval: [240000000, 250000000] },
                    tracks: [
                        {
                            title: 'Reads Detail View 2 (To Be Added)',
                            data: {
                                url:
                                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                                type: 'csv',
                                chromosomeField: 'Chromosome',
                                genomicFields: ['chromStart', 'chromEnd']
                            },
                            mark: 'rect',
                            color: {
                                field: 'Stain',
                                type: 'nominal',
                                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar', 'acen'],
                                range: ['#C0C0C0', '#808080', '#404040', 'black', 'black', 'black', '#B74780']
                            },
                            x: { field: 'chromStart', type: 'genomic' },
                            xe: { field: 'chromEnd', type: 'genomic' },
                            opacity: { value: 0.3 },
                            width: 452,
                            height: 100
                        }
                    ]
                }
            ]
        }
    ]
};
