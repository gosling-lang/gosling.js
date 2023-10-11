import { goslingToHiGlass } from '../../compiler/gosling-to-higlass';
import { HiGlassModel } from '../../compiler/higlass-model';
import { GoslingToHiGlassIdMapper } from '../../api/track-and-view-ids';
import { getLinkingInfo } from './linking';
import { getTheme } from './theme';

describe('Should get linking information correctly', () => {
    it('Simple linking', () => {
        const higlass = goslingToHiGlass(
            new HiGlassModel(),
            {
                data: { type: 'csv', url: 'https://' },
                id: 'track',
                _overlay: [
                    {
                        mark: 'point',
                        x: { linkingId: 'regular' }
                    },
                    {
                        mark: 'brush',
                        x: { linkingId: 'brush' }
                    }
                ],
                width: 1000,
                height: 100
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
            },
            getTheme(),
            new GoslingToHiGlassIdMapper()
        );
        const info = getLinkingInfo(higlass);
        expect(info).toHaveLength(2);
        expect(info.filter(d => d.isBrush)).toHaveLength(1);
        expect(info.filter(d => d.isBrush)[0].linkId).toEqual('brush');
    });
});
