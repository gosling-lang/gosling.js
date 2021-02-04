import { GoslingSpec } from '../../../core/gosling.schema';

export const EXAMPLE_SIMPLEST: GoslingSpec = {
    tracks: [
        {
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=VLFaiSVjTjW6mkbjRjWREA',
                type: 'vector',
                column: 'position',
                value: 'peak',
                bin: 16
            },
            mark: 'line',
            overrideTemplate: true
        },
        {
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ',
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            }
        },
        {
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ',
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: [
                    'sample 1',
                    'sample 2',
                    'sample 3',
                    'sample 4',
                    'sample 5',
                    'sample 6',
                    'sample 7',
                    'sample 8',
                    'sample 9',
                    'sample 10'
                ]
            }
        }
    ]
};
