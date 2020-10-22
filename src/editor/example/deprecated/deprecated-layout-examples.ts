import { GeminiSpec } from '../../../core/gemini.schema';

export const SPEC_TO_SUPPORT: GeminiSpec = {
    // Color channel should be shared only when the data types are the same
    tracks: [
        {
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ',
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
                    mark: 'line',
                    color: { field: 'sample', type: 'nominal' }
                },
                {
                    mark: 'point',
                    size: { field: 'peak', type: 'quantitative', range: [0, 6] },
                    color: { field: 'peak', type: 'quantitative' }
                }
            ],
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] },
                axis: 'top'
            },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            width: 1000,
            height: 180
        }
    ]
};

export const LAYOUT_EXAMPLE_LINK: GeminiSpec = {
    tracks: [
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x: { field: 'from', type: 'nominal' },
            y: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x1: { field: 'from', type: 'nominal' },
            y: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x1: { field: 'from', type: 'nominal' },
            y1: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x: { field: 'from', type: 'nominal' },
            y1: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x: { field: 'from', type: 'nominal' },
            x1: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            y: { field: 'from', type: 'nominal' },
            y1: { field: 'to', type: 'nominal' },
            width: 50,
            height: 50
        }
    ]
};

export const LAYOUT_EXAMPLE_COMBO: GeminiSpec = {
    tracks: [
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 800,
            height: 50
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x1: { field: 'from', type: 'nominal' },
            x: { field: 'to', type: 'nominal' },
            width: 800,
            height: 50
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 800,
            height: 50
        }
    ]
};

export const LAYOUT_EXAMPLE_COMBO_HORIZONTAL: GeminiSpec = {
    layout: { type: 'linear', direction: 'horizontal' },
    tracks: [
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 60,
            height: 500
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            y: { field: 'from', type: 'nominal' },
            y1: { field: 'to', type: 'nominal' },
            width: 60,
            height: 500
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 60,
            height: 500
        }
    ]
};

export const LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS: GeminiSpec = {
    layout: { type: 'linear', direction: 'horizontal', wrap: 2 },
    tracks: [
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 350,
            height: 30
        }
    ]
};

export const LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS_CIRCULAR: GeminiSpec = {
    layout: { type: 'circular', direction: 'horizontal', wrap: 2 },
    tracks: [
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30,
            style: { background: '#FAF9F7' }
        },
        {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 500,
            height: 30
        }
    ]
};
