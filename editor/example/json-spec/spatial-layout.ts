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

export const EX_SPEC_SPATIAL_DENSITY: GoslingSpec = {
    title: 'Density',
    subtitle: '',
    arrangement: "horizontal",
    views: [
        {
            layout: {
                type: 'spatial',
                model: {
                    type: 'csv',
                    url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/gosling-3d/stevens-2017/densities/Stevens-2017_GSM2219498_Cell_2_model_7_with-densities_r05.csv',
                    xyz: ['x', 'y', 'z'],
                    chromosome: 'chr',
                    position: 'coord'
                }
            },
            tracks: [
                {
                    color: {
                        field: "densityVals",
                        type: "quantitative",
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
                    url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/gosling-3d/stevens-2017/densities/Stevens-2017_GSM2219498_Cell_2_model_7_with-densities_r05.csv',
                    xyz: ['x', 'y', 'z'],
                    chromosome: 'chr',
                    position: 'coord'
                }
            },
            tracks: [
                {
                    color: {
                        field: "densityVals",
                        type: "quantitative",
                    },
                    size: {
                        field: "densityVals",
                        type: "quantitative",
                        range: [0.03, 0.002],
                    },
                    width: 500,
                    height: 500
                }
            ]
        },
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
                    url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/gosling-3d/stevens-2017/full-model.csv',
                    xyz: ['x', 'y', 'z'],
                    chromosome: 'chr',
                    position: 'coord'
                }
            },
            width: 500,
            height: 500,
            alignment: "overlay",
            tracks: [
                {
                    color: {
                        value: 'gainsboro'
                    },
                    size: {
                        value: 0.005,
                    },
                    mark: 'sphere',
                },
                {
                    color: {
                        value: 'darkslateblue'
                    },
                    size: {
                        value: 0.02,
                    },
                    mark: 'box',
                    dataTransform: [{
                        type: "filter",
                        field: "chr",
                        oneOf: ["chr b"],
                    }],
                },
                {
                    color: {
                        value: 'darkseagreen'
                    },
                    size: {
                        value: 0.02,
                    },
                    mark: 'octahedron',
                    dataTransform: [{
                        type: "filter",
                        field: "chr",
                        oneOf: ["chr a"],
                    }],
                }
            ]
        }
    ]
};


export const EX_SPEC_SPATIAL_TAN_COMP: GoslingSpec = {
    title: 'Tan 2018 (Science) comparison',
    arrangement: "horizontal",
    views: [
        {
            layout: {
                type: 'spatial',
                model: {
                    type: 'csv',
                    url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/gosling-3d/tan-2018/Tan-2018_GSM3271347_gm12878_01.csv',
                    xyz: ['x', 'y', 'z'],
                    chromosome: 'chr',
                    position: 'coord'
                }
            },
            width: 500,
            height: 500,
            alignment: "overlay",
            tracks: [
                {
                    color: {
                        value: 'gainsboro'
                    },
                    size: {
                        value: 0.005,
                    },
                    mark: 'sphere',
                },
                {
                    color: {
                        field: 'coord',
                        type: 'quantitative',
                        domain: [900000, 249200000],
                        range: "spectral",
                    },
                    size: {
                        value: 0.02,
                    },
                    mark: 'box',
                    dataTransform: [{
                        type: "filter",
                        field: "chr",
                        oneOf: ["1(pat)"],
                    }],
                },

            ]
        },
        {
            layout: {
                type: 'spatial',
                model: {
                    type: 'csv',
                    url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/gosling-3d/tan-2018/Tan-2018_GSM3271348_gm12878_02.csv',
                    xyz: ['x', 'y', 'z'],
                    chromosome: 'chr',
                    position: 'coord'
                }
            },
            width: 500,
            height: 500,
            alignment: "overlay",
            tracks: [
                {
                    color: {
                        value: 'gainsboro'
                    },
                    size: {
                        value: 0.005,
                    },
                    mark: 'sphere',
                },
                {
                    color: {
                        field: 'coord',
                        type: 'quantitative',
                        domain: [900000, 249300000],
                        range: "spectral",
                    },
                    size: {
                        value: 0.02,
                    },
                    mark: 'box',
                    dataTransform: [{
                        type: "filter",
                        field: "chr",
                        oneOf: ["1(pat)"],
                    }],
                },

            ]
        }
    ]
};

export const EX_SPEC_SPATIAL_SUPERIMPOSITION: GoslingSpec = {
    title: 'Spatial Layout: superimposition',
    views: [
        {
            layout: 'spatial',
            tracks: [
                {
                    data: {
                        type: 'csv',
                        url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/gosling-3d/yeast_model.csv',
                    },
                    spatial: {
                        x: "x",
                        y: "y",
                        z: "z",
                        chr: "chr",
                        coord: "coord",
                    },
                    color: {
                        value: "#ff0000",
                    },
                    size: {
                        value: 0.01,
                    },
                    width: 500,
                    height: 500
                },
                {
                    data: {
                        type: 'csv',
                        url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/gosling-3d/stevens-2017/single_chromosome.csv',
                    },
                    spatial: {
                        x: "x",
                        y: "y",
                        z: "z",
                        chr: "chr",
                        coord: "coord",
                    },
                    color: {
                        value: "#00ff00",
                    },
                    size: {
                        value: 0.01,
                    },
                    width: 500,
                    height: 500
                },
                {
                    data: {
                        type: 'csv',
                        url: 'https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/gosling-3d/stevens-2017/single_chromosome.csv',
                    },
                    spatial: {
                        x: "x",
                        y: "y",
                        z: "z",
                        chr: "chr",
                        coord: "coord",
                    },
                    color: {
                        value: "#0000ff",
                    },
                    size: {
                        value: 0.01,
                    },
                    width: 500,
                    height: 500
                }
            ]
        }
    ],
};
