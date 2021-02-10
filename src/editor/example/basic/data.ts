import { GoslingSpec } from '../../../core/gosling.schema';
export const EXAMPLE_DATA: GoslingSpec = {
    tracks: [
        {
            data: {
                type: 'bigwig',
                url: 'https://s3.amazonaws.com/gosling-lang.org/data/4DNFIMPI5A9N.bw',
                column: 'position',
                value: 'peak'
            },
            mark: 'bar',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1', interval: [1, 3000500] },
                axis: 'top'
            },
            y: { field: 'peak', type: 'quantitative' }
        }
    ]
};
