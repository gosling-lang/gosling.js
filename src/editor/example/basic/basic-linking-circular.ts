import { GeminidSpec } from '../../../core/geminid.schema';
import { EXAMPLE_BASIC_AREA } from './basic-marks';
import { EXAMPLE_DATASETS } from './datasets';

export const EXMAPLE_BASIC_LINKING_CIRCULAR: GeminidSpec = {
    arrangement: {
        columnSizes: 500,
        rowSizes: [500, 100]
    },
    tracks: [
        {
            outerRadius: 200,
            innerRadius: 150,
            layout: 'circular',
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
            },
            mark: 'area',
            x: {
                field: 'position',
                type: 'genomic'
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
                    mark: 'rect-brush',
                    x: { linkingID: 'linking-with-brush' }
                }
            ]
        },
        {
            ...EXAMPLE_BASIC_AREA,
            x: {
                ...EXAMPLE_BASIC_AREA.x,
                domain: { chromosome: '5' },
                axis: undefined,
                linkingID: 'linking-with-brush'
            }
        }
    ]
} as GeminidSpec;
