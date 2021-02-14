import { GoslingSpec } from '../../../core/gosling.schema';
import { EXAMPLE_BASIC_AREA } from './basic-marks';

export const EXMAPLE_BASIC_BRUSH = {
    tracks: [
        {
            ...EXAMPLE_BASIC_AREA,
            x: {
                ...EXAMPLE_BASIC_AREA.x,
                domain: { chromosome: '1' }
            },
            overlay: [
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
