import type { GoslingSpec } from '@gosling-lang/gosling-schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const EX_SPEC_SPATIAL: GoslingSpec = {
    title: 'Spatial Layout',
    subtitle: 'Example of spatial chromatin data integration',
    arrangement: 'vertical',
    centerRadius: 0.4,
    views: [
        {
            spacing: 40,
            arrangement: 'horizontal',
            views: [
                {
                    layout: 'spatial',
                    tracks: [
                        {
                            data: {
                                type: 'csv',
                                url: 'https://debug.test/isnt-used-yet'
                            },
                            //type: "3D",
                            width: 250,
                            height: 250
                        }
                    ]
                },
                {
                    layout: 'linear',
                    xDomain: { chromosome: 'chr1' },
                    alignment: 'overlay',
                    tracks: [
                        { mark: 'bar' },
                        {
                            mark: 'brush',
                            x: { linkingId: 'detail' }
                        }
                    ],
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                    },
                    x: { field: 'start', type: 'genomic' },
                    xe: { field: 'end', type: 'genomic' },
                    y: { field: 'peak', type: 'quantitative' },
                    row: { field: 'sample', type: 'nominal' },
                    color: { field: 'sample', type: 'nominal' },
                    width: 400,
                    height: 200
                }
            ]
        },
        {
            layout: 'linear',
            xDomain: { chromosome: 'chr1', interval: [160000000, 200000000] },
            linkingId: 'detail',
            tracks: [
                {
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                    },
                    mark: 'bar',
                    x: {
                        field: 'position',
                        type: 'genomic',
                        axis: 'top'
                    },
                    y: { field: 'peak', type: 'quantitative' },
                    row: { field: 'sample', type: 'nominal' },
                    color: { field: 'sample', type: 'nominal' },
                    width: 690,
                    height: 200
                }
            ]
        }
    ]
};
