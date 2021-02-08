import { GoslingSpec } from '../../../core/gosling.schema';
export const EXAMPLE_DATA: GoslingSpec = {
    tracks: [
        {
            data: {
                type: 'bigwig',
                url: 'https://aveit.s3.amazonaws.com/higlass/bigwig/example.chr1.10000-1160000.bw',
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
