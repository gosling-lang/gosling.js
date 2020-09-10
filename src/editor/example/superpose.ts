import { GeminiSpec } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_SUPERPOSE: GeminiSpec = {
    tracks: [
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/chr1_cytogenetic_band.glyph.csv',
                type: 'csv',
                quantitativeFields: ['Band', 'ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop', 'Density']
            },
            superpose: [
                // this slows down the rendering process
                // {
                //     mark: 'text',
                //     text: { field: 'Band', type: 'nominal' }
                // },
                {
                    mark: 'rect',
                    dataTransform: {
                        filter: [{ field: 'Band', oneOf: [11, 11.1], not: true }]
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
                    mark: 'triangle-l',
                    dataTransform: {
                        filter: [{ field: 'Band', oneOf: [11], not: false }]
                    },
                    color: { value: '#B40101' }
                },
                {
                    mark: 'triangle-r',
                    dataTransform: {
                        filter: [{ field: 'Band', oneOf: [11.1], not: false }]
                    },
                    color: { value: '#B40101' }
                }
            ],
            x: { field: 'Basepair_start', type: 'genomic', domain: { chromosome: '1' } },
            xe: { field: 'Basepair_stop', type: 'genomic' },
            x1: { axis: true },
            stroke: { value: 'black' },
            strokeWidth: { value: 0.5 },
            width: 1000,
            height: 60
        },
        {
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            superpose: [
                {
                    mark: 'line'
                },
                {
                    mark: 'point',
                    size: { field: 'peak', type: 'quantitative', range: [0, 6] }
                }
            ],
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            // background: {"value": "red"},
            width: 1000,
            height: 180
        },
        {
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            superpose: [
                {
                    mark: 'bar',
                    size: { value: 1 },
                    color: { value: 'black' }
                },
                {
                    mark: 'point',
                    size: { field: 'peak', type: 'quantitative', range: [0, 6] }
                }
            ],
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1250000, 1450000] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            // background: {"value": "red"},
            width: 1000,
            height: 180
        },
        {
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
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                    '6',
                    '7',
                    '8',
                    '9',
                    '10',
                    '11'
                    // '12','13','14','15','16','17','18','19','20'
                ]
            },
            superpose: [
                {
                    mark: 'bar',
                    color: { field: 'sample', type: 'nominal', range: ['lightgray'] }
                },
                {
                    mark: 'bar',
                    dataTransform: { filter: [{ field: 'sample', oneOf: ['11'], not: false }] },
                    color: { field: 'sample', type: 'nominal', range: ['steelblue'] }
                },
                {
                    mark: 'line',
                    color: { field: 'sample', type: 'nominal', range: ['salmon'] }
                }
            ],
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [2540000, 2620000] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            stroke: { value: 'white' },
            strokeWidth: { value: 0.5 },
            width: 1000,
            height: 180
        },
        {
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'area',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            superpose: [
                { y: { field: 'peak', type: 'quantitative', domain: [0, 1] } },
                { y: { field: 'peak', type: 'quantitative', domain: [1, 8] } },
                { y: { field: 'peak', type: 'quantitative', domain: [8, 15] } }
            ],
            color: { field: 'sample', type: 'nominal' },
            row: { field: 'sample', type: 'nominal' },
            opacity: { value: 0.4 },
            width: 1000,
            height: 180
        }
    ]
};
