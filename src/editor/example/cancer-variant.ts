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
                mark: 'link',
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
    static: true,
    views: [
        {
            arrangement: 'horizontal',
            views: [
                {
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
                            mark: 'link',
                            x: { field: 'start1', type: 'genomic' },
                            xe: { field: 'end2', type: 'genomic' },
                            color: {
                                field: 'svclass',
                                type: 'nominal',
                                legend: false,
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
                            title: 'Zoom View',
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
                            mark: 'link',
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
                            style: { outline: 'lightgray', inlineLegend: true },
                            strokeWidth: { value: 1.5 },
                            opacity: { value: 0.5 },
                            width: 800,
                            height: 450
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
                                { mark: 'brush', x: { linkingId: 'detail-1' }, strokeWidth: {value: 0}, color: {value: 'blue'} },
                                { mark: 'brush', x: { linkingId: 'detail-2' }, strokeWidth: {value: 0}, color: {value: 'red'} },
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
                            width: 700,
                            height: 30
                        },
                    ]
                }
            ]
        },
        {
            arrangement: 'horizontal',
            spacing: 90,
            views: [
                {
                    xDomain: { chromosome: '1', interval: [10000000, 15000000] },
                    linkingId: 'detail-1',
                    tracks: [
                        {
                            title: 'Detail View 1',
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
                            width: 630,
                            height: 100
                        }
                    ]
                },
                {
                    xDomain: { chromosome: '1', interval: [180000000, 185000000] },
                    linkingId: 'detail-2',
                    tracks: [
                        {
                            title: 'Detail View 2',
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
                            width: 630,
                            height: 100
                        }
                    ]
                }
            ]
        }
    ]
};
