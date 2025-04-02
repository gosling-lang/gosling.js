import type { GoslingSpec } from 'gosling.js';

export const EX_SPEC_3D_YEAST_BIGWIG: GoslingSpec = {
    title: '3D Yeast Model (Nature 2010)',
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
            layout: 'spatial',
            tracks: [
                {
                    data: {
                        type: 'bigwig',
                        url: 'https://gosling-lang.s3.us-east-1.amazonaws.com/data/3d/GSM2831174_FigS3GH_Scc1_G2.bigwig'
                    },
                    color: { field: 'value', type: 'quantitative' },
                    dataTransform: [
                        {
                            type: 'join',
                            from: {
                                url: 'https://gosling-lang.s3.us-east-1.amazonaws.com/data/3d/yeast.csv',
                                chromosomeField: 'chr',
                                genomicField: 'coord'
                            },
                            to: {
                                chromosomeField: 'chr',
                                startField: 'start',
                                endField: 'end'
                            }
                        }
                    ],
                    spatial: {
                        x: 'x',
                        y: 'y',
                        z: 'z',
                        chr: 'chr',
                        coord: 'coord'
                    },
                    width: 500,
                    height: 500
                }
            ]
        }
    ]
};
