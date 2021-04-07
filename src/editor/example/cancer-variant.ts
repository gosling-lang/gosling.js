import { GoslingSpec } from '../..';

export const view = (sample: string) => {
    return {
        layout: 'circular',
        spacing: 1,
        tracks: [
            {
                title: sample,
                data: {
                    url: `https://s3.amazonaws.com/gosling-lang.org/data/cancer/substitution.${sample}.csv`,
                    type: 'csv',
                    chromosomeField: 'Chrom',
                    genomicFields: ['Pos'],
                    quantitativeFields: ['GP', 'SP', 'DP']
                },
                mark: 'point',
                x: { field: 'Pos', type: 'genomic' },
                y: { field: 'DP', type: 'quantitative' },
                color: { field: 'Ref', type: 'nominal' },
                // "stroke": {"field": "svclass", "type": "nominal"},
                width: 500,
                height: 60
            },
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
                height: 20
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
                height: 130
            }
        ]
    };
};

export const EX_SPEC_CANCER_VARIANT: GoslingSpec = {
    title: 'Breast Cancer Variant (Staaf et al. 2019)',
    subtitle: 'Genetic characteristics of RAD51C- and PALB2-altered TNBCs (under development)',
    layout: 'linear',
    arrangement: 'vertical',
    // "centerRadius": 0.5,
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
