import { geminidToHiGlass } from '../../../src/core/geminid-to-higlass';
import { HiGlassModel } from '../../../src/core/higlass-model';
import { getLinkingInfo } from '../../../src/core/utils/linking';

describe('Should get linking information correctly', () => {
    it('Simple linking', () => {
        const higlass = geminidToHiGlass(
            new HiGlassModel(),
            {
                data: { type: 'csv', url: 'https://' },
                superpose: [
                    {
                        mark: 'point',
                        x: { linkingID: 'regular' }
                    },
                    {
                        mark: 'rect-brush',
                        x: { linkingID: 'brush' }
                    }
                ]
            },
            {
                width: 1000,
                height: 100,
                x: 10,
                y: 10
            },
            {
                x: 0,
                y: 0,
                w: 12,
                h: 12
            }
        );
        const info = getLinkingInfo(higlass);
        expect(info).toHaveLength(2);
        expect(info.filter(d => d.isBrush)).toHaveLength(1);
        expect(info.filter(d => d.isBrush)[0].linkId).toEqual('brush');
    });
});
