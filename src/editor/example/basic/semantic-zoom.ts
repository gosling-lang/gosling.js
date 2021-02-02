import { BasicSingleTrack, GoslingSpec, SuperposedTrack, Track } from '../../../core/gosling.schema';
import { EXAMPLE_CYTOAND_HG38 } from '../cytoband-hg38';
import { EXAMPLE_DATASETS } from './datasets';

export const EXMAPLE_SEMANTIC_ZOOM_SEQ: BasicSingleTrack | SuperposedTrack = {
    data: {
        url: EXAMPLE_DATASETS.fasta,
        type: 'tileset'
    },
    metadata: {
        type: 'higlass-multivec',
        row: 'base',
        column: 'position',
        value: 'count',
        categories: ['A', 'T', 'G', 'C'],
        start: 'start',
        end: 'end'
    },
    superpose: [
        {
            mark: 'bar',
            y: { field: 'count', type: 'quantitative' }
        },
        {
            mark: 'bar',
            y: { field: 'count', type: 'quantitative' },
            strokeWidth: { value: 1 },
            stroke: { value: 'white' },
            visibility: [
                {
                    operation: 'gtet',
                    measure: 'width',
                    threshold: 20,
                    transitionPadding: 10,
                    target: 'mark'
                },
                {
                    operation: 'LT',
                    measure: 'zoomLevel',
                    threshold: 50,
                    target: 'track'
                }
            ]
        },
        {
            dataTransform: { filter: [{ field: 'count', oneOf: [0], not: true }] },
            mark: 'text',
            x: {
                field: 'start',
                type: 'genomic',
                domain: { chromosome: '1', interval: [3000000, 3000010] },
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: { value: 'white' },
            visibility: [
                {
                    operation: 'less-than',
                    measure: 'width',
                    threshold: '|xe-x|',
                    transitionPadding: 30,
                    target: 'mark'
                },
                {
                    operation: 'LT',
                    measure: 'zoomLevel',
                    threshold: 50,
                    target: 'track'
                }
            ]
        }
    ],
    x: {
        field: 'position',
        type: 'genomic',
        domain: { chromosome: '1', interval: [3000000, 3000010] },
        axis: 'top'
    },
    color: {
        field: 'base',
        type: 'nominal',
        domain: ['A', 'T', 'G', 'C'],
        legend: true
    },
    text: {
        field: 'base',
        type: 'nominal'
    },
    style: {
        textFontSize: 24,
        textStrokeWidth: 0,
        textFontWeight: 'bold'
    }
};

const EXAMPLE_SEMANTIC_ZOOMING_LINES: Track = {
    data: {
        url: EXAMPLE_DATASETS.multivec,
        type: 'tileset'
    },
    metadata: {
        type: 'higlass-multivec',
        row: 'sample',
        column: 'position',
        value: 'peak',
        categories: [
            'sample 1',
            'sample 2',
            'sample 3',
            'sample 4'
            // 'sample 11', 'sample 12', 'sample 13', 'sample 14',
            // 'sample 21', 'sample 22', 'sample 23', 'sample 24',
            // 'sample 31', 'sample 32', 'sample 33', 'sample 34',
        ]
    },
    mark: 'line',
    x: {
        field: 'position',
        type: 'genomic',
        domain: { chromosome: '1', interval: [1, 3000500] },
        axis: 'top'
    },
    y: { field: 'peak', type: 'quantitative' },
    color: { field: 'sample', type: 'nominal' },
    superpose: [
        {
            visibility: [{ target: 'track', measure: 'height', threshold: 60, operation: 'lt' }]
        },
        {
            row: { field: 'sample', type: 'nominal' },
            visibility: [{ target: 'track', measure: 'height', threshold: 60, operation: 'gtet' }]
        }
    ]
};

export const EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM: BasicSingleTrack | SuperposedTrack = {
    ...EXAMPLE_CYTOAND_HG38.tracks[0],
    superpose: [
        {
            mark: 'rect',
            color: {
                field: 'Chromosome',
                type: 'nominal',
                domain: [
                    'chr1',
                    'chr2',
                    'chr3',
                    'chr4',
                    'chr5',
                    'chr6',
                    'chr7',
                    'chr8',
                    'chr9',
                    'chr10',
                    'chr11',
                    'chr12',
                    'chr13',
                    'chr14',
                    'chr15',
                    'chr16',
                    'chr17',
                    'chr18',
                    'chr19',
                    'chr20',
                    'chr21',
                    'chr22',
                    'chrX',
                    'chrY'
                ],
                range: ['#F6F6F6', 'gray']
            },
            x: {
                field: 'chromStart',
                type: 'genomic',
                aggregate: 'min'
            },
            xe: {
                field: 'chromEnd',
                aggregate: 'max',
                type: 'genomic'
            },
            strokeWidth: { value: 2 },
            stroke: { value: 'gray' },
            visibility: [
                {
                    operation: 'greater-than',
                    measure: 'zoomLevel',
                    threshold: 100000000,
                    target: 'mark',
                    transitionPadding: 50000000
                }
            ]
        },
        ...(EXAMPLE_CYTOAND_HG38.tracks[0] as SuperposedTrack).superpose
    ],
    visibility: [
        {
            operation: 'greater-than',
            measure: 'width',
            threshold: 3,
            transitionPadding: 5,
            target: 'mark'
        }
    ]
};

export const EXAMPLE_SEMANTIC_ZOOMING: GoslingSpec = {
    layout: 'linear',
    arrangement: {
        direction: 'vertical',
        columnSizes: 800,
        rowSizes: [180, 60, 180, 100, 60]
    },
    tracks: [
        EXMAPLE_SEMANTIC_ZOOM_SEQ,
        EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM,
        EXAMPLE_SEMANTIC_ZOOMING_LINES,
        EXAMPLE_SEMANTIC_ZOOMING_LINES,
        EXAMPLE_SEMANTIC_ZOOMING_LINES
    ]
};
