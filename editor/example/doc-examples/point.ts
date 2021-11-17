import type { GoslingSpec } from 'gosling.js';

export const POINT: GoslingSpec = {
    title: 'Basic Marks: Point',
    subtitle: 'Tutorial Examples',
    tracks: [
        {
            width: 800,
            height: 180,
            layout: 'linear',
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ',
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1']
            },
            mark: 'point',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] },
                axis: 'top'
            },
            y: { field: 'peak', type: 'quantitative' },
            size: { field: 'peak', type: 'quantitative' },
            color: { field: 'sample', type: 'nominal', legend: true },
            opacity: { value: 0.9 }
        }
    ]
};
