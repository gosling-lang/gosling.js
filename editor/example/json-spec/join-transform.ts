import type { GoslingSpec } from 'gosling.js';

export const EX_SPEC_JOIN_TRANSFORM: GoslingSpec = {
    title: 'Spatial Layout (Minimal, CSV)',
    subtitle: 'Super basic example of spatial layout',
    views: [
        {
            assembly: [
                ['chrI', 230218],
                ['chrII', 813184]
            ],
            layout: 'spatial',
            tracks: [
                {
                    data: {
                        type: 'bigwig',
                        url: 'https://gosling-lang.s3.us-east-1.amazonaws.com/data/3d/GSM2831174_FigS3GH_Scc1_G2.bigwig'
                    },
                    dataTransform: [
                        {
                            type: 'join',
                            from: {
                                url: 'https://gosling-lang.s3.us-east-1.amazonaws.com/data/3d/yeast.chrI-II.csv',
                                chromosomeField: 'chr',
                                genomicField: 'coord'
                            },
                            to: { chromosomeField: 'chr', genomicField: 'position' }
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
