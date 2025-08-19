import type { GoslingSpec } from 'gosling.js';

export const EX_SPEC_DEBUG: GoslingSpec = {
    views: [
        {
            tracks: [
                {
                    id: 'track-1',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=cistrome-multivec',
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4'],
                        binSize: 4
                    },
                    mark: 'rect',
                    x: { field: 'start', type: 'genomic', axis: 'top' },
                    xe: { field: 'end', type: 'genomic' },
                    row: { field: 'sample', type: 'nominal', legend: true },
                    color: { field: 'peak', type: 'quantitative', legend: true },
                    tooltip: [
                        { field: 'start', type: 'genomic', alt: 'Start Position' },
                        { field: 'end', type: 'genomic', alt: 'End Position' },
                        {
                            field: 'peak',
                            type: 'quantitative',
                            alt: 'Value',
                            format: '.2'
                        },
                        { field: 'sample', type: 'nominal', alt: 'Sample' }
                    ],
                    width: 200,
                    height: 30
                }
            ]
        },
        {
            tracks: [
                {
                    id: 'track-2',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=cistrome-multivec',
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                    },
                    mark: 'bar',
                    x: { field: 'position', type: 'genomic', axis: 'top' },
                    y: { field: 'peak', type: 'quantitative' },
                    row: { field: 'sample', type: 'nominal' },
                    color: { field: 'sample', type: 'nominal', legend: true },
                    tooltip: [
                        { field: 'start', type: 'genomic', alt: 'Start Position' },
                        { field: 'end', type: 'genomic', alt: 'End Position' },
                        {
                            field: 'peak',
                            type: 'quantitative',
                            alt: 'Value',
                            format: '.2'
                        },
                        { field: 'sample', type: 'nominal', alt: 'Sample' }
                    ],
                    width: 600,
                    height: 130
                }
            ]
        }
    ]
};
