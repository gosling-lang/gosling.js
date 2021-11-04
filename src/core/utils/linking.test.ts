import { goslingToHiGlass } from '../gosling-to-higlass';
import { HiGlassModel } from '../higlass-model';
import { getLinkingInfo } from './linking';
import { getTheme } from './theme';

describe('Should get linking information correctly', () => {
    it('Simple linking', () => {
        const higlass = goslingToHiGlass(
            new HiGlassModel(),
            {
                data: { type: 'csv', url: 'https://' },
                overlay: [
                    {
                        mark: 'point',
                        encoding: {
                            x: { linkingId: 'regular' }
                        }
                    },
                    {
                        mark: 'brush',
                        encoding: {
                            x: { linkingId: 'brush' }
                        }
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
            getTheme()
        );
        const info = getLinkingInfo(higlass);
        expect(info).toHaveLength(2);
        expect(info.filter(d => d.isBrush)).toHaveLength(1);
        expect(info.filter(d => d.isBrush)[0].linkId).toEqual('brush');
    });
});
