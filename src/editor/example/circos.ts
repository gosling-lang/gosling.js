import { GeminiSpec, Track } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';

// refer to the following for supporting zooming and panning in circular layouts:
// higlass/app/scripts/TrackRenderer.js

const CIRCOS_HEATMAP: Track = {
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
            // 'sample 5', 'sample 6', 'sample 7', 'sample 8',
            // 'sample 9', 'sample 10', 'sample 11', 'sample 12',
            // 'sample 13', 'sample 14', 'sample 15', 'sample 16',
            // 'sample 17', 'sample 18', 'sample 19', 'sample 20'
        ]
    },
    mark: 'rect',
    x: {
        field: 'start',
        type: 'genomic',
        domain: { chromosome: '1', interval: [100000000, 150000000] },
        linker: 'link-1'
    },
    xe: {
        field: 'end',
        type: 'genomic'
    },
    row: { field: 'sample', type: 'nominal' },
    color: { field: 'peak', type: 'quantitative', range: 'bupu' },
    width: 640,
    height: 640,

    _is_circular: true
};

export const EXAMPLE_CIRCOS: GeminiSpec = {
    layout: { type: 'circular', direction: 'vertical', gap: 20 },
    tracks: [
        {
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
                        condition: { width: '|xe-x|', transitionPadding: 10 },
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
                        filter: [{ field: 'Stain', oneOf: ['gvar'], not: false }]
                    },
                    color: { value: '#A0A0F2' }
                },
                {
                    mark: 'triangle-r',
                    dataTransform: {
                        filter: [{ field: 'Stain', oneOf: ['acen-1'], not: false }]
                    },
                    color: { value: '#B40101' }
                },
                {
                    mark: 'triangle-l',
                    dataTransform: {
                        filter: [{ field: 'Stain', oneOf: ['acen-2'], not: false }]
                    },
                    color: { value: '#B40101' }
                },
                {
                    mark: 'rect-brush',
                    x: { linker: 'link-1' },
                    color: { value: 'blue' },
                    opacity: { value: 0.2 }
                }
            ],
            x: { field: 'Basepair_start', type: 'genomic', domain: { chromosome: '1' }, axis: 'top' },
            xe: { field: 'Basepair_stop', type: 'genomic' },
            stroke: { value: 'gray' },
            strokeWidth: { value: 0.5 },
            width: 640,
            height: 60
        },
        {
            ...CIRCOS_HEATMAP,
            height: 120,
            x: { ...CIRCOS_HEATMAP.x, axis: 'top' },
            _is_circular: false
        },
        {
            ...CIRCOS_HEATMAP
        }
    ]
};
