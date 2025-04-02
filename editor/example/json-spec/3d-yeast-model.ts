import type { GoslingSpec } from 'gosling.js';

export const EX_SPEC_3D_YEAST_MODEL: GoslingSpec = {
    title: '3D Yeast Model (Nature 2010)',
    assembly: 'sacCer3',
    views: [
        {
            layout: 'linear',
            tracks: [
                {
                    data: {
                        type: 'bigwig',
                        url: 'https://gosling-lang.s3.us-east-1.amazonaws.com/data/3d/GSM2831174_FigS3GH_Scc1_G2.bigwig'
                    },
                    mark: 'rect',
                    x: { field: 'position', type: 'genomic' },
                    color: { field: 'value', type: 'quantitative' },
                    width: 500,
                    height: 50
                }
            ]
        },
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
                    data: {
                        type: 'bigwig',
                        url: 'https://gosling-lang.s3.us-east-1.amazonaws.com/data/3d/GSM2831174_FigS3GH_Scc1_G2.bigwig'
                    },
                    color: { field: 'value', type: 'quantitative' },
                    width: 500,
                    height: 500
                }
            ]
        }
    ]
};
