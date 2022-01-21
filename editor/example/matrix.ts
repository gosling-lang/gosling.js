import type { GoslingSpec } from 'gosling.js';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const EX_SPEC_MATRIX: GoslingSpec = {
    title: 'Hi-C Matrix',
    subtitle: 'Visualize Hi-C Data Using Matrix and Annotations',
    views: [
        {
            linkingId: 'all',
            spacing: 0,
            views: [
                // {
                //     tracks: [
                //         {
                //             data: {
                //                 url: GOSLING_PUBLIC_DATA.multivec,
                //                 type: 'multivec',
                //                 row: 'sample',
                //                 column: 'position',
                //                 value: 'peak',
                //                 categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                //             },
                //             mark: 'bar',
                //             x: {
                //                 field: 'position',
                //                 type: 'genomic',
                //                 axis: 'top'
                //             },
                //             y: { field: 'peak', type: 'quantitative' },
                //             color: { field: 'sample', type: 'nominal' },
                //             width: 600,
                //             height: 50
                //         }
                //     ]
                // },
                {
                    alignment: 'overlay',
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.matrix,
                                type: 'matrix'
                            },
                            mark: 'bar',
                            x: { field: 'xs', type: 'genomic', axis: 'none' },
                            xe: { field: 'xe', type: 'genomic', axis: 'none' },
                            y: { field: 'ys', type: 'genomic', axis: 'none' },
                            ye: { field: 'ye', type: 'genomic', axis: 'none' },
                            color: { field: 'value', type: 'quantitative', range: 'grey', legend: true },
                            style: { background: 'lightgray' }
                        },
                        {
                            data: {
                                type: 'json',
                                values: [
                                    { c: 'chr2', p: 100000 },
                                    { c: 'chr5', p: 100000 },
                                    { c: 'chr10', p: 100000 }
                                ],
                                chromosomeField: 'c',
                                genomicFields: ['p']
                            },
                            mark: 'rule',
                            x: { field: 'p', type: 'genomic', axis: 'none' },
                            strokeWidth: { value: 2 },
                            color: { value: 'red' }
                        },
                        {
                            data: {
                                type: 'json',
                                values: [
                                    { c: 'chr2', p: 100000 },
                                    { c: 'chr5', p: 100000 },
                                    { c: 'chr10', p: 100000 }
                                ],
                                chromosomeField: 'c',
                                genomicFields: ['p']
                            },
                            mark: 'rule',
                            y: { field: 'p', type: 'genomic', axis: 'none' },
                            strokeWidth: { value: 2 },
                            color: { value: 'blue' }
                        }
                    ],
                    width: 600,
                    height: 600,
                    style: { dashed: [3, 3] }
                }
            ]
        }
    ]
};
