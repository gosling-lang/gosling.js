import type { GoslingSpec } from 'gosling.js';

export const EX_SPEC_SPATIAL_LAYOUT_GRAMMAR_EXTENSION: GoslingSpec = {
    title: 'Spatial Layout: Grammar Extension',
    assembly: [
        ['chrI', 230218],
        ['chrII', 813184],
        ['chrIII', 316620],
        ['chrIV', 1531933],
        ['chrV', 576874],
        ['chrVI', 270161],
        ['chrVII', 1090940],
        ['chrVIII', 562643],
        ['chrIX', 439888],
        ['chrX', 745751],
        ['chrXI', 666816],
        ['chrXII', 1078177],
        ['chrXIII', 924431],
        ['chrXIV', 784333],
        ['chrXV', 1091291],
        ['chrXVI', 948066]
    ],
    views: [
        {
            layout: {
                type: 'spatial',
                model: {
                    type: 'csv',
                    url: 'https://gosling-lang.s3.us-east-1.amazonaws.com/data/3d/yeast.csv',
                    xyz: ['x', 'y', 'z'],
                    chromosome: 'chr',
                    position: 'coord'
                }
            },
            tracks: [
                {
                    mark: 'point',
                    data: {
                        // Reference:
                        // - Paper: https://wiki.yeastgenome.org/images/f/f0/Ng_2019_PMID_31612944.pdf
                        // - File Repo: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM5241662
                        type: 'bigwig',
                        url: 'https://gosling-lang.s3.us-east-1.amazonaws.com/data/3d/GSM5241662_y1483_plus.bw'
                    },
                    locus: { field: 'position' },
                    color: { field: 'value', type: 'quantitative' },
                    size: { field: 'value', type: 'quantitative' },
                    width: 500,
                    height: 500
                }
            ]
        }
    ]
};
