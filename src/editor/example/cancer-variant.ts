import { GoslingSpec } from '../..';

export function view(sample: string): GoslingSpec {
    return {
        layout: 'circular',
        spacing: 1,
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
                    field: 'Stain',
                    type: 'nominal',
                    domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar', 'acen'],
                    range: ['#C0C0C0', '#808080', '#404040', 'black', 'black', 'black', '#B74780']
                },
                size: { value: 18 },
                x: { field: 'chromStart', type: 'genomic' },
                xe: { field: 'chromEnd', type: 'genomic' },
                opacity: { value: 0.5 },
                width: 500,
                height: 40
            },
            {
                title: sample,
                data: {
                    url: `https://s3.amazonaws.com/gosling-lang.org/data/cancer/substitution.${sample}.csv`,
                    type: 'csv',
                    chromosomeField: 'Chrom',
                    genomicFields: ['Pos'],
                    quantitativeFields: ['GP', 'SP', 'DP', 'PosDiff']
                },
                dataTransform: [
                    { type: 'concat', fields: ['Ref', 'Alt'], separator: ' > ', newField: 'sub' },
                    {
                        type: 'replace',
                        field: 'sub',
                        newField: 'sub',
                        replace: [
                            { from: 'G > A', to: 'C > T' },
                            { from: 'G > T', to: 'C > A' },
                            { from: 'G > C', to: 'C > G' },
                            { from: 'A > G', to: 'T > C' },
                            { from: 'A > T', to: 'T > A' },
                            { from: 'A > C', to: 'T > G' }
                        ]
                    }
                ],
                mark: 'point',
                x: { field: 'Pos', type: 'genomic' },
                y: { field: 'PosDiff', type: 'quantitative', flip: true },
                size: { field: 'PosDiff', type: 'quantitative' },
                color: {
                    field: 'sub',
                    type: 'nominal',
                    legend: true,
                    domain: ['C > A', 'C > G', 'C > T', 'T > A', 'T > C', 'T > G'],
                    range: ['#0072B2', 'black', '#D45E00', 'gray', '#029F73', '#CB7AA7']
                },
                opacity: { value: 0.3 },
                style: { outlineWidth: 1, outline: 'lightgray' },
                // "stroke": {"field": "svclass", "type": "nominal"},
                width: 500,
                height: 80
            },
            {
                data: {
                    url: `https://s3.amazonaws.com/gosling-lang.org/data/cancer/indel.${sample}.csv`,
                    type: 'csv',
                    chromosomeField: 'Chrom',
                    genomicFields: ['Pos']
                },
                mark: 'rect',
                x: { field: 'Pos', type: 'genomic' },
                color: { field: 'Type', type: 'nominal', domain: ['Ins', 'Del'], range: ['green', 'red'] },
                row: { field: 'Type', type: 'nominal', domain: ['Ins', 'Del'] },
                width: 500,
                height: 40
            },
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
                color: { field: 'svclass', type: 'nominal' },
                stroke: { field: 'svclass', type: 'nominal' },
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
    centerRadius: 0.1,
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
