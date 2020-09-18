import { GeminiSpec } from '../../../core/gemini.schema';

const MULTIVEC_FILE_CISTROME = 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ';

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
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
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
    references: [
        'http://genocat.tools/tools/combo.html',
        'http://genocat.tools/tools/gbrowse_syn.html',
        'http://genocat.tools/tools/ggbio.html',
        'http://genocat.tools/tools/give.html',
        'http://genocat.tools/tools/variant_view.html'
    ],
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

export const LAYOUT_EXAMPLE_COMBO_BAND: GeminiSpec = {
    references: [
        'http://genocat.tools/tools/combo.html',
        'http://genocat.tools/tools/gbrowse_syn.html',
        'http://genocat.tools/tools/ggbio.html',
        'http://genocat.tools/tools/give.html',
        'http://genocat.tools/tools/variant_view.html'
    ],
    tracks: [
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'rect',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'sample', type: 'nominal' },
            color: { field: 'peak', type: 'quantitative' },
            width: 800,
            height: 90
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'line',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            width: 800,
            height: 90
        },
        // {
        //     data: {
        //         url: 'https://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA',
        //         type: 'tileset'
        //     },
        //     mark: {
        //         type: 'gene-annotation-higlass',
        //         server: 'gemini-v1'
        //     },
        //     x: { type: 'genomic', axis: true, domain: { chromosome: '2' } },
        //     width: 800,
        //     height: 140
        // },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/range-to-range-relation.csv',
                type: 'csv'
            },
            mark: 'link-between',
            x1: { field: 'from' },
            x1e: { field: 'from1' },
            x: { field: 'to' },
            xe: { field: 'to1' },
            width: 800,
            height: 260,
            stroke: { value: 'none' }
        },
        // {
        //     data: {
        //         url: 'https://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA',
        //         type: 'tileset'
        //     },
        //     mark: {
        //         type: 'gene-annotation-higlass',
        //         server: 'gemini-v1'
        //     },
        //     x: { type: 'genomic', domain: { chromosome: '3' } },
        //     x1: { axis: true },
        //     width: 800,
        //     height: 140
        // },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'bar',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            width: 800,
            height: 90
        },
        {
            data: {
                url: MULTIVEC_FILE_CISTROME,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'point',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] }
            },
            x1: { axis: true },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            width: 800,
            height: 90
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
