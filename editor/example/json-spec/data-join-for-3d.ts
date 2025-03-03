import type { GoslingSpec } from 'gosling.js';

export const EX_SPEC_SPATIAL_DATA_JOIN: GoslingSpec = {
    layout: 'spatial',
    tracks: [
        {
            data: {
                type: 'csv',
                url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/gosling-3d/yeast_model.csv'
                // chromosomeField: 'chr',
                // genomicFields: ['position']
            },
            spatial: {
                x: 'x',
                y: 'y',
                z: 'z',
                chr: 'chr',
                coord: 'coord'
            },
            dataTransform: [
                {
                    type: 'join',
                    from: {
                        url: 'https://gist.githubusercontent.com/sehilyi/29d1cfed56da3ed37370f31a508c8024/raw/9ab733bff25c4c539d86451dfb9d03d4e241d1ad/yeast_model.values.csv',
                        chromosomeField: 'chr',
                        genomicField: 'p'
                    },
                    to: { chromosomeField: 'chr', genomicField: 'coord' }
                }
            ]
        }
    ]
};
