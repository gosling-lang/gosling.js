import type { GoslingSpec } from 'gosling.js';

export const EX_SPEC_DEBUG: GoslingSpec = {
    layout: 'space-filling',
    tracks: [
        {
            data: {
                url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=cistrome-multivec',
                type: 'multivec',
                row: 'sample',
                categories: ['sample 1'],
                binSize: 1
            },
            mark: 'rect',
            x: { field: 'position', type: 'genomic', axis: 'none' },
            color: { field: 'value', type: 'quantitative', legend: false },
            width: 400,
            height: 400
        }
    ]
};
