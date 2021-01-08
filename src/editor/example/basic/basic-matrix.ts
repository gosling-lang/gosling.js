import { GeminidSpec } from '../../../core/geminid.schema';
// import { EXAMPLE_DATASETS } from './datasets';

export const EXMAPLE_BASIC_MATRIX: GeminidSpec = {
    arrangement: {
        direction: 'horizontal',
        columnSizes: 401,
        rowSizes: 401
    },
    tracks: [
        // {
        //     data: {
        //         url: EXAMPLE_DATASETS.matrix,
        //         type: 'tileset'
        //     },
        //     metadata: {
        //         type: 'higlass-matrix',
        //         row: 'y',
        //         column: 'x',
        //         value: 'v'
        //     },
        //     mark: 'rect',
        //     x: {
        //         field: 'startX',
        //         type: 'genomic',
        //         axis: 'top'
        //     },
        //     xe: {
        //         field: 'endX',
        //         type: 'genomic'
        //     },
        //     y: {
        //         field: 'startY',
        //         type: 'genomic',
        //         axis: 'left'
        //     },
        //     ye: {
        //         field: 'endY',
        //         type: 'genomic'
        //     },
        //     color: { field: 'v', type: 'quantitative' }
        // },
        {
            data: {
                url: 'https://raw.githubusercontent.com/vigsterkr/circos/master/data/5/segdup.txt',
                type: 'csv',
                headerNames: ['id', 'chr', 'p1', 'p2'],
                chromosomePrefix: 'hs',
                chromosomeField: 'chr',
                genomicFields: ['p1', 'p2'],
                separator: ' ',
                longToWideId: 'id',
                sampleLength: 1000
            },
            mark: 'rect',
            superpose: [
                {
                    x: { field: 'p1', type: 'genomic', axis: 'top' },
                    // xe: { field: 'p2', type: 'genomic' },
                    y: { field: 'p2_2', type: 'genomic', axis: 'left' }
                    // ye: { field: 'P1_2', type: 'genomic' },
                },
                {
                    y: { field: 'p1', type: 'genomic', axis: 'top' },
                    x: { field: 'p2_2', type: 'genomic', axis: 'left' }
                }
            ],
            size: { value: 6 },
            opacity: { value: 0.4 }
        }
    ]
};
