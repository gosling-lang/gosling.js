import type { GoslingSpec } from '@gosling-lang/gosling-schema';

export const EX_SPEC_SPATIAL_MINIMAL: GoslingSpec = {
    title: 'Spatial Layout (Minimal, CSV)',
    subtitle: 'Super basic example of spatial layout',
    views: [
        {
            layout: {
                type: 'spatial',
                model: {
                    type: 'csv',
                    url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/gosling-3d/stevens-2017/full-model.csv',
                    xyz: ['x', 'y', 'z'],
                    chromosome: 'chr',
                    position: 'coord'
                }
            },
            tracks: [
                {
                    width: 500,
                    height: 500
                }
            ]
        },
    ]
};

export const EX_SPEC_SPATIAL_COLOR: GoslingSpec = {
    title: 'Coloring strategies',
    subtitle: 'Showcase of different ways to use the color channel.',
    arrangement: "horizontal",
    views: [
        {
            layout: {
                type: 'spatial',
                model: {
                    type: 'csv',
                    url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/gosling-3d/yeast_model.csv',
                    xyz: ['x', 'y', 'z'],
                    chromosome: 'chr',
                    position: 'coord'
                }
            },
            tracks: [
                {
                    color: {
                        value: "lightgreen",
                    },
                    width: 500,
                    height: 500
                }
            ]
        },
        {
            layout: {
                type: 'spatial',
                model: {
                    type: 'csv',
                    url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/gosling-3d/yeast_model.csv',
                    xyz: ['x', 'y', 'z'],
                    chromosome: 'chr',
                    position: 'coord'
                }
            },
            tracks: [
                {
                    color: {
                        field: "chr",
                        type: "nominal",
                    },
                    width: 500,
                    height: 500
                }
            ]
        },
        {
            layout: {
                type: 'spatial',
                model: {
                    type: 'csv',
                    url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/gosling-3d/yeast_model.csv',
                    xyz: ['x', 'y', 'z'],
                    chromosome: 'chr',
                    position: 'coord'
                }
            },
            tracks: [
                {
                    color: {
                        field: "coord",
                        type: "quantitative",
                    },
                    width: 500,
                    height: 500
                }
            ]
        }
    ]
};

export const EX_SPEC_SPATIAL_MULTIPLE_TRACKS: GoslingSpec = {
    title: 'Spatial Layout: multiple tracks in one view',
    views: [
        {
            layout: {
                type: 'spatial',
                model: {
                    type: 'csv',
                    url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/gosling-3d/yeast_model.csv',
                    xyz: ['x', 'y', 'z'],
                    chromosome: 'chr',
                    position: 'coord'
                }
            },
            tracks: [
                {
                    data: {
                        type: 'csv',
                        url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/gosling-3d/yeast_model.csv'
                    },
                    color: {
                        value: '#ffffff'
                    },
                    width: 500,
                    height: 500
                },
                {
                    data: {
                        type: 'csv',
                        url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/gosling-3d/yeast_model_only_one_chromosome.csv'
                    },
                    color: {
                        value: '#ffffff'
                    },
                    mark: 'box',
                    width: 500,
                    height: 500
                }
            ]
        }
    ]
};
