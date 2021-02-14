import { GoslingSpec } from '../../../core/gosling.schema';

export const SPEC_TO_SUPPORT: GoslingSpec = {
    // Color channel should be shared only when the data types are the same
    tracks: [
        {
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ',
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            overlay: [
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
