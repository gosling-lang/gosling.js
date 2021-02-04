import { GoslingSpec } from '../../../core/gosling.schema';
import { EXAMPLE_BASIC_AREA } from './basic-marks';
import { EXAMPLE_DATASETS } from './datasets';

export const EXMAPLE_BASIC_LINKING: GoslingSpec = {
    layout: 'linear',
    arrangement: {
        direction: 'vertical',
        columnSizes: 800
    },
    tracks: [
        {
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'line',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1' },
                axis: 'top',
                linkingID: 'link1'
            },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            stroke: { value: 'white' },
            strokeWidth: { value: 0.5 },
            width: 1000,
            height: 180
        },
        {
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'area',
            x: {
                field: 'position',
                type: 'genomic',
                domain: { chromosome: '1' },
                axis: 'top',
                linkingID: 'link1'
            },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            stroke: { value: 'white' },
            strokeWidth: { value: 0.5 },
            width: 1000,
            height: 180,
            superpose: [
                {},
                {
                    mark: 'brush',
                    x: { linkingID: 'linking-with-brush' }
                }
            ]
        },
        {
            ...EXAMPLE_BASIC_AREA,
            x: {
                ...EXAMPLE_BASIC_AREA.x,
                domain: { chromosome: '1', interval: [160000000, 200000000] },
                linkingID: 'linking-with-brush'
            }
        }
    ]
} as GoslingSpec;
