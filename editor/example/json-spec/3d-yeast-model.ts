import type { Layout, SingleTrack } from '@gosling-lang/gosling-schema';
import type { GoslingSpec } from 'gosling.js';

// Reference:
// - Paper: https://wiki.yeastgenome.org/images/f/f0/Ng_2019_PMID_31612944.pdf
// - File Repo: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM5241662
const url = 'https://gosling-lang.s3.us-east-1.amazonaws.com/data/3d/GSM5241662_y1483_plus.bw';

// The width and height of each track
const trackWidth = 401;

// Color hex codes for categories
const colors = [
    '#d60000',
    '#018700',
    '#b500ff',
    '#05acc6',
    '#97ff00',
    '#ffa52f',
    '#ff8ec8',
    '#79525e',
    '#00fdcf',
    '#afa5ff',
    '#93ac83',
    '#9a6900',
    '#366962',
    '#d3008c',
    '#fdf490',
    '#c86e66',
    '#9ee2ff',
    '#00c846'
];

const spatialLayoutDef: Layout = {
    type: 'spatial',
    model: {
        type: 'csv',
        url: 'https://gosling-lang.s3.us-east-1.amazonaws.com/data/3d/yeast.csv',
        xyz: ['x', 'y', 'z'],
        chromosome: 'chr',
        position: 'coord'
    }
};

const base: SingleTrack = {
    data: {
        type: 'bigwig',
        url
    },
    mark: 'rect',
    locus: { field: 'position' },
    color: { field: 'value', type: 'quantitative' },
    width: trackWidth,
    height: 50
};

const chrTrack: SingleTrack = {
    data: {
        type: 'json',
        values: [
            { chr: 'chrI', start: 0, end: 230218 },
            { chr: 'chrII', start: 230218, end: 1043402 },
            { chr: 'chrIII', start: 1043402, end: 1360022 },
            { chr: 'chrIV', start: 1360022, end: 2891955 },
            { chr: 'chrV', start: 2891955, end: 3468829 },
            { chr: 'chrVI', start: 3468829, end: 3738990 },
            { chr: 'chrVII', start: 3738990, end: 4829930 },
            { chr: 'chrVIII', start: 4829930, end: 5392573 },
            { chr: 'chrIX', start: 5392573, end: 5832461 },
            { chr: 'chrX', start: 5832461, end: 6578212 },
            { chr: 'chrXI', start: 6578212, end: 7245028 },
            { chr: 'chrXII', start: 7245028, end: 8323205 },
            { chr: 'chrXIII', start: 8323205, end: 9247636 },
            { chr: 'chrXIV', start: 9247636, end: 10031969 },
            { chr: 'chrXV', start: 10031969, end: 11123260 },
            { chr: 'chrXVI', start: 11123260, end: 12071326 }
        ]
    },
    mark: 'rect',
    x: { field: 'start', type: 'genomic' },
    xe: { field: 'end', type: 'genomic' },
    color: {
        field: 'chr',
        type: 'nominal',
        range: colors
    },
    width: trackWidth,
    height: 10
};

export const EX_SPEC_3D_YEAST_MODEL: GoslingSpec = {
    title: '3D Yeast Model (Nature 2010)',
    assembly: 'sacCer3',
    arrangement: 'horizontal',
    layout: { ...spatialLayoutDef },
    views: [
        {
            tracks: [{ ...base, mark: 'sphere', height: trackWidth }]
        },
        {
            tracks: [
                {
                    ...base,
                    mark: 'sphere',
                    data: undefined,
                    color: { field: 'chr', type: 'nominal', range: colors },
                    height: trackWidth
                }
            ]
        },
        {
            arrangement: 'vertical',
            views: [
                {
                    layout: 'linear',
                    tracks: [{ ...chrTrack }, { title: 'Linear Layout', ...base, locus: undefined, x: { field: 'position', type: 'genomic' } }]
                },
                {
                    layout: 'circular',
                    centerRadius: 0.5,
                    spacing: 1,
                    tracks: [{ ...chrTrack }, { title: 'Cicular Layout', ...base, locus: undefined, x: { field: 'position', type: 'genomic' } }]
                }
            ]
        }
    ]
};
