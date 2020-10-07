import { GeminiSpec, Track } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';
import { EXAMPLE_IDEOGRAM_TRACK } from './ideogram';

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
            visibility: { target: 'track', condition: { height: 60 }, operation: 'lt' }
        },
        {
            row: { field: 'sample', type: 'nominal' },
            visibility: { target: 'track', condition: { height: 60 }, operation: 'gtet' }
        }
    ],
    width: 1000,
    height: 180
};

export const EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM: Track = {
    ...EXAMPLE_IDEOGRAM_TRACK,
    superpose: [
        {
            mark: 'rect',
            color: {
                field: 'Chr.',
                type: 'nominal',
                range: ['#F6F6F6', 'gray']
            },
            x: {
                field: 'Basepair_start',
                type: 'genomic',
                aggregate: 'min',
                axis: 'top'
            },
            xe: {
                field: 'Basepair_stop',
                aggregate: 'max',
                type: 'genomic'
            },
            strokeWidth: { value: 2 },
            stroke: { value: 'gray' },
            visibility: {
                operation: 'less-than',
                condition: { zoomLevel: 3 },
                target: 'track'
            }
        },
        ...EXAMPLE_IDEOGRAM_TRACK.superpose
    ]
};

export const EXAMPLE_SEMANTIC_ZOOMING: GeminiSpec = {
    layout: {
        type: 'linear',
        direction: 'vertical'
    },
    tracks: [
        {
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
                    visibility: {
                        operation: 'gtet',
                        condition: { width: 20, transitionPadding: 10 },
                        target: 'mark'
                    }
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
                    visibility: {
                        operation: 'less-than',
                        condition: { width: '|xe-x|', transitionPadding: 30 },
                        target: 'mark'
                    },
                    style: {
                        textFontSize: 24,
                        textStrokeWidth: 0,
                        textFontWeight: 'bold'
                    }
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
                domain: ['A', 'T', 'G', 'C']
            },
            text: {
                field: 'base',
                type: 'nominal'
            },
            width: 1000,
            height: 180
        },
        { mark: 'empty', data: { type: 'csv', url: '' }, width: 50, height: 50 },
        EXAMPLE_SEMANTIC_ZOOMING_IDEOGRAM,
        { mark: 'empty', data: { type: 'csv', url: '' }, width: 50, height: 50 },
        EXAMPLE_SEMANTIC_ZOOMING_LINES,
        { ...EXAMPLE_SEMANTIC_ZOOMING_LINES, height: 120 },
        { ...EXAMPLE_SEMANTIC_ZOOMING_LINES, height: 60 }
    ]
};
