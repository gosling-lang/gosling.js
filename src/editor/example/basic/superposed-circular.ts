import { BasicSingleTrack, GoslingSpec, SuperposedTrack, Track } from '../../../core/gosling.schema';
import { EXAMPLE_DATASETS } from './datasets';

// refer to the following for supporting zooming and panning in circular layouts:
// higlass/app/scripts/TrackRenderer.js
const size = 400;
const outerRadius = 100;
const innerRadius = 70;

const commonMultivecSpec: Partial<Track> = {
    data: {
        url: EXAMPLE_DATASETS.multivec,
        type: 'tileset'
    },
    metadata: {
        type: 'higlass-multivec',
        row: 'sample',
        column: 'position',
        value: 'peak',
        bin: 6,
        categories: [
            'sample 1',
            'sample 2',
            'sample 3',
            'sample 4'
            // 'sample 5', 'sample 6', 'sample 7', 'sample 8',
            // 'sample 9', 'sample 10', 'sample 11', 'sample 12',
            // 'sample 13', 'sample 14', 'sample 15', 'sample 16',
            // 'sample 17', 'sample 18', 'sample 19', 'sample 20'
        ]
    }
};
const CIRCOS_HEATMAP: BasicSingleTrack | SuperposedTrack = {
    ...commonMultivecSpec,
    mark: 'rect',
    x: {
        field: 'start',
        type: 'genomic'
    },
    xe: {
        field: 'end',
        type: 'genomic'
    },
    row: { field: 'sample', type: 'nominal' },
    color: { field: 'peak', type: 'quantitative', range: 'spectral' },

    outerRadius,
    innerRadius,
    static: true
} as BasicSingleTrack | SuperposedTrack;

const CIRCOS_LINE: BasicSingleTrack | SuperposedTrack = {
    ...commonMultivecSpec,
    mark: 'line',
    x: {
        field: 'start',
        type: 'genomic',
        domain: { chromosome: '6' },
        linkingID: 'link-1'
    },
    xe: {
        field: 'end',
        type: 'genomic'
    },
    y: { field: 'peak', type: 'quantitative' },
    row: { field: 'sample', type: 'nominal', grid: true },
    color: { field: 'sample', type: 'nominal' },

    outerRadius,
    innerRadius,
    static: true
} as BasicSingleTrack | SuperposedTrack;

const IDEOGRAM_DETAIL: Track = {
    data: {
        url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/cytogenetic_band.csv',
        type: 'csv',
        chromosomeField: 'Chr.',
        genomicFields: ['ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop'],
        quantitativeFields: ['Band', 'Density']
    },
    superpose: [
        {
            mark: 'text',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['acen-1', 'acen-2'], not: true }]
            },
            text: { field: 'Band', type: 'nominal' },
            color: { value: 'black' },
            visibility: {
                operation: 'less-than',
                measure: 'width',
                threshold: '|xe-x|',
                transitionPadding: 10,
                target: 'mark'
            },
            style: {
                textStrokeWidth: 0
            }
        },
        {
            mark: 'rect',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['acen-1', 'acen-2'], not: true }]
            },
            color: {
                field: 'Density',
                type: 'nominal',
                domain: ['', '25', '50', '75', '100'],
                range: ['white', '#D9D9D9', '#979797', '#636363', 'black']
            }
        },
        {
            mark: 'rect',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['gvar'] }]
            },
            color: { value: '#A0A0F2' }
        },
        {
            mark: 'triangle-r',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['acen-1'] }]
            },
            color: { value: '#B40101' }
        },
        {
            mark: 'triangle-l',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['acen-2'] }]
            },
            color: { value: '#B40101' }
        }
    ],
    x: { field: 'Basepair_start', type: 'genomic' },
    xe: { field: 'Basepair_stop', type: 'genomic' },
    stroke: { value: 'gray' },
    strokeWidth: { value: 0.5 },
    style: { outline: 'white' }
};

export const EXAMPLE_LINK: Track = {
    data: {
        url: EXAMPLE_DATASETS.region2,
        type: 'tileset'
    },
    metadata: {
        type: 'higlass-bed',
        genomicFields: [
            { name: 'start', index: 1 },
            { name: 'end', index: 2 }
        ]
    },
    superpose: [
        {
            mark: 'link',
            x: {
                field: 'start',
                type: 'genomic',
                domain: { chromosome: '4', interval: [132650000, 132680000] },
                linkingID: 'link-2'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            strokeWidth: { value: 1 }
        }
    ],
    color: { value: 'none' },
    // stroke: { value: 'steelblue' },
    stroke: { field: 'start', type: 'nominal' },
    opacity: { value: 0.3 },
    // style: { circularLink: true, background: "lightgray" },
    outerRadius,
    innerRadius: 80
};

export const EXAMPLE_BAND: Track = {
    data: {
        url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
        type: 'csv',
        chromosomeField: 'c2',
        genomicFields: ['s1', 'e1', 's2', 'e2']
    },
    mark: 'link',
    x: {
        field: 's1',
        type: 'genomic'
    },
    xe: {
        field: 'e1',
        type: 'genomic'
    },
    x1: {
        field: 's2',
        type: 'genomic',
        domain: { chromosome: '1' }
    },
    x1e: {
        field: 'e2',
        type: 'genomic'
    },
    color: { field: 's1', type: 'nominal' },
    stroke: { value: 'steelblue' },
    opacity: { value: 0.3 },
    style: { circularLink: true },
    outerRadius,
    innerRadius: 80
};

export const EXAMPLE_SUPERPOSED_CIRCULAR_TRACKS: GoslingSpec = {
    layout: 'circular',
    arrangement: {
        direction: 'horizontal',
        wrap: 2,
        rowSizes: [60, size, size, size, size],
        columnSizes: size,
        columnGaps: 6,
        rowGaps: 6
    },
    tracks: [
        {
            layout: 'linear',
            ...IDEOGRAM_DETAIL,
            x: { ...IDEOGRAM_DETAIL.x, axis: 'top', domain: undefined },
            superpose: [
                ...(IDEOGRAM_DETAIL as SuperposedTrack).superpose,
                {
                    mark: 'brush',
                    x: { linkingID: 'link' },
                    color: { value: 'blue' },
                    opacity: { value: 0.2 }
                }
            ],
            span: 2
        },
        {
            ...IDEOGRAM_DETAIL,
            x: {
                ...IDEOGRAM_DETAIL.x,
                axis: 'none',
                linkingID: 'link',
                domain: { chromosome: '1', interval: [0, 500000000] }
            },
            outerRadius: 190,
            innerRadius: 175
        },
        // { ...CIRCOS_LINE, mark: 'area', innerRadius: 150, color: {...CIRCOS_LINE.color, }, row: undefined, outerRadius: 170, superposeOnPreviousTrack: true },
        {
            ...CIRCOS_HEATMAP,
            innerRadius: 150,
            outerRadius: 170,
            x: { ...CIRCOS_HEATMAP.x },
            color: { ...CIRCOS_HEATMAP.color, range: 'grey' },
            superposeOnPreviousTrack: true
        },
        {
            ...CIRCOS_HEATMAP,
            innerRadius: 120,
            outerRadius: 145,
            x: { ...CIRCOS_HEATMAP.x },
            color: { ...CIRCOS_HEATMAP.color, range: 'warm' },
            superposeOnPreviousTrack: true
        },
        {
            ...CIRCOS_LINE,
            mark: 'bar',
            innerRadius: 70,
            color: { ...CIRCOS_LINE.color },
            outerRadius: 115,
            superposeOnPreviousTrack: true
        },
        {
            outerRadius: 70,
            data: {
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                type: 'csv',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            mark: 'link',
            x: {
                field: 's1',
                type: 'genomic'
            },
            xe: {
                field: 's2',
                type: 'genomic'
            },
            color: { value: 'steelblue' },
            stroke: { value: 'steelblue' },
            opacity: { value: 0.4 },
            superposeOnPreviousTrack: true
        },
        {
            data: {
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                type: 'csv',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            superpose: [
                {
                    mark: 'rect',
                    x: {
                        field: 's1',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [103900000, 104100000] },
                        linkingID: 'link-3'
                    },
                    xe: {
                        field: 'e1',
                        type: 'genomic'
                    }
                },
                {
                    mark: 'rect',
                    x: {
                        field: 's2',
                        type: 'genomic',
                        domain: { chromosome: '1' }
                    },
                    xe: {
                        field: 'e2',
                        type: 'genomic'
                    }
                }
            ],
            color: { field: 's1', type: 'nominal' },
            stroke: { value: 'steelblue' },
            style: { circularLink: true },
            outerRadius: 190,
            innerRadius: 175
        },
        {
            data: {
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                type: 'csv',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            superpose: [
                {
                    mark: 'link',
                    x: {
                        field: 's1',
                        type: 'genomic',
                        domain: { chromosome: '1', interval: [103900000, 104100000] },
                        linkingID: 'link-3'
                    },
                    xe: {
                        field: 'e1',
                        type: 'genomic'
                    },
                    x1: {
                        field: 's2',
                        type: 'genomic',
                        domain: { chromosome: '1' }
                    },
                    x1e: {
                        field: 'e2',
                        type: 'genomic'
                    }
                }
            ],
            color: { field: 's1', type: 'nominal' },
            stroke: { field: 's1', type: 'nominal' },
            opacity: { value: 0.6 },
            style: { circularLink: true },
            outerRadius: 175,
            innerRadius: 150,
            superposeOnPreviousTrack: true
        }
    ]
} as GoslingSpec;
