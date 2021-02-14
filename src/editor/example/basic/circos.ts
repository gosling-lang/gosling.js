import { GoslingSpec, OverlaidTrack, Track } from '../../../core/gosling.schema';
import { EXAMPLE_DATASETS } from './datasets';
import { EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM, EXMAPLE_SEMANTIC_ZOOM_SEQ } from './semantic-zoom';

// refer to the following for supporting zooming and panning in circular layouts:
// higlass/app/scripts/TrackRenderer.js
const size = 210;
const outerRadius = 100;
const innerRadius = 70;

const commonMultivecSpec: Partial<Track> = {
    data: {
        url: EXAMPLE_DATASETS.multivec,
        type: 'multivec',
        row: 'sample',
        column: 'position',
        value: 'peak',
        bin: 2,
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
const CIRCOS_HEATMAP: Track = {
    ...commonMultivecSpec,
    mark: 'rect',
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
    row: { field: 'sample', type: 'nominal' },
    color: { field: 'peak', type: 'quantitative', range: 'spectral' },

    outerRadius,
    innerRadius,
    static: true
} as Track;

const CIRCOS_LINE: Track = {
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
} as Track;

const IDEOGRAM: Track = {
    data: {
        url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/cytogenetic_band.csv',
        type: 'csv',
        chromosomeField: 'Chr.',
        genomicFields: ['ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop'],
        quantitativeFields: ['Band', 'Density']
    },
    overlay: [
        {
            mark: 'text',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['acen-1', 'acen-2'], not: true }]
            },
            text: { field: 'Band', type: 'nominal' },
            color: { value: 'black' },
            visibility: [
                {
                    operation: 'less-than',
                    measure: 'width',
                    threshold: '|xe-x|',
                    transitionPadding: 10,
                    target: 'mark'
                }
            ],
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
    x: { field: 'Basepair_start', type: 'genomic', linkingID: 'link-1', domain: { chromosome: '1' } },
    xe: { field: 'Basepair_stop', type: 'genomic' },
    stroke: { value: 'gray' },
    strokeWidth: { value: 0.5 },
    style: { outline: 'white' }
};

export const EXAMPLE_LINK: Track = {
    data: {
        url: EXAMPLE_DATASETS.region2,
        type: 'bed',
        genomicFields: [
            { name: 'start', index: 1 },
            { name: 'end', index: 2 }
        ]
    },
    overlay: [
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
    overlay: [
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
    stroke: { value: 'steelblue' },
    opacity: { value: 0.4 },
    style: { circularLink: true },
    outerRadius,
    innerRadius: 80
};

export const EXAMPLE_CIRCOS: GoslingSpec = {
    layout: 'circular',
    arrangement: {
        direction: 'horizontal',
        wrap: 4,
        rowSizes: [60, size, size, size, size],
        columnSizes: size,
        columnGaps: 6,
        rowGaps: 6
    },
    tracks: [
        {
            layout: 'linear',
            ...EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM,
            x: {
                ...EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM.x,
                domain: undefined
            },
            overlay: [
                ...(EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM as OverlaidTrack).overlay,
                {
                    mark: 'brush',
                    x: { linkingID: 'link-1' },
                    color: { value: 'blue' },
                    opacity: { value: 0.2 }
                },
                {
                    mark: 'brush',
                    x: { linkingID: 'link-2' },
                    color: { value: 'red' },
                    opacity: { value: 0.2 }
                },
                {
                    mark: 'brush',
                    x: { linkingID: 'link-3' },
                    color: { value: 'green' },
                    opacity: { value: 0.2 }
                }
            ],
            span: 4
        },
        CIRCOS_HEATMAP,
        CIRCOS_LINE,
        { ...CIRCOS_LINE, mark: 'area', row: undefined },
        { ...CIRCOS_LINE, mark: 'area' },
        {
            ...CIRCOS_LINE,
            mark: 'point',
            size: { field: 'peak', type: 'quantitative', range: [0, 3] },
            opacity: { value: 0.8 }
        },
        { ...CIRCOS_LINE, mark: 'bar' },
        { ...CIRCOS_LINE, mark: 'bar', row: undefined /* color: { ...CIRCOS_LINE.color, legend: true } */ },
        { ...IDEOGRAM, outerRadius, innerRadius: 80 },
        EXAMPLE_BAND,
        EXAMPLE_LINK,
        {
            ...EXMAPLE_SEMANTIC_ZOOM_SEQ,
            x: {
                ...EXMAPLE_SEMANTIC_ZOOM_SEQ.x,
                axis: 'none',
                domain: { chromosome: '1', interval: [3000000, 3000006] }
            },
            outerRadius,
            innerRadius: 40,
            style: {
                ...EXMAPLE_SEMANTIC_ZOOM_SEQ.style,
                textFontSize: 16
            }
        },
        {
            ...EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM,
            x: { ...EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM.x, axis: 'none', linkingID: 'overview' },
            outerRadius,
            innerRadius: 80
        }
        // {
        //     outerRadius, innerRadius: 30,
        //     data: {
        //         url: EXAMPLE_DATASETS.clinvar,
        //         type: 'tileset'
        //     },
        //     metadata: {
        //         type: 'bed',
        //         genomicFields: [
        //             { index: 1, name: 'start' },
        //             { index: 2, name: 'end' }
        //         ],
        //         valueFields: [{ index: 7, name: 'significance', type: 'nominal' }]
        //     },
        //     superpose: [
        //         {
        //             mark: 'bar',
        //             stroke: {
        //                 field: 'significance',
        //                 type: 'nominal',
        //                 domain: [
        //                     'Pathogenic',
        //                     'Pathogenic/Likely_pathogenic',
        //                     'Likely_pathogenic',
        //                     'Uncertain_significance',
        //                     'Likely_benign',
        //                     'Benign/Likely_benign',
        //                     'Benign'
        //                 ],
        //                 range: ['#D45E00', '#D45E00', '#D45E00', 'black', '#029F73', '#029F73', '#029F73']
        //             },
        //             strokeWidth: { value: 0.5 },
        //             size: { value: 1 }
        //         },
        //         {
        //             mark: 'point',
        //             size: { value: 3 },
        //             // just for adding a legend only once
        //             color: {
        //                 field: 'significance',
        //                 type: 'nominal',
        //                 domain: [
        //                     'Pathogenic',
        //                     'Pathogenic/Likely_pathogenic',
        //                     'Likely_pathogenic',
        //                     'Uncertain_significance',
        //                     'Likely_benign',
        //                     'Benign/Likely_benign',
        //                     'Benign'
        //                 ],
        //                 range: ['#D45E00', '#D45E00', '#D45E00', 'black', '#029F73', '#029F73', '#029F73'],
        //                 legend: false
        //             }
        //         }
        //     ],
        //     x: {
        //         field: 'start',
        //         type: 'genomic',
        //         domain: { chromosome: '1' },
        //         linkingID: 'link-1'
        //     },
        //     xe: {
        //         field: 'end',
        //         type: 'genomic'
        //     },
        //     y: {
        //         field: 'significance',
        //         type: 'nominal',
        //         domain: [
        //             'Pathogenic',
        //             'Pathogenic/Likely_pathogenic',
        //             'Likely_pathogenic',
        //             'Uncertain_significance',
        //             'Likely_benign',
        //             'Benign/Likely_benign',
        //             'Benign'
        //         ],
        //         baseline: 'Uncertain_significance',
        //         range: [150, 20], // TODO: support more accurate positioning
        //         grid: false
        //     },
        //     color: {
        //         field: 'significance',
        //         type: 'nominal',
        //         domain: [
        //             'Pathogenic',
        //             'Pathogenic/Likely_pathogenic',
        //             'Likely_pathogenic',
        //             'Uncertain_significance',
        //             'Likely_benign',
        //             'Benign/Likely_benign',
        //             'Benign'
        //         ],
        //         range: ['#D45E00', '#D45E00', '#D45E00', 'black', '#029F73', '#029F73', '#029F73']
        //     },
        //     opacity: { value: 0.6 }
        // },
    ]
} as GoslingSpec;
