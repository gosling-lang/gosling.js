import { IsChannelDeep } from '../gosling.schema.guards';
import { resolveSuperposedTracks } from './overlay';

describe('Should handle superposition options correctly', () => {
    it('Should return an 1-element array if superpose option is not used', () => {
        const tracks = resolveSuperposedTracks({
            mark: 'line',
            data: { type: 'csv', url: '' },
            width: 100,
            height: 100
        });
        expect(tracks).toHaveLength(1);
        expect(tracks[0].mark).toBe('line');
    });
    it('Should resolve `superpose` options when the array length is one', () => {
        const tracks = resolveSuperposedTracks({
            overlay: [{ mark: 'line' }],
            width: 100,
            height: 100
        });
        expect(tracks).toHaveLength(1);
        expect(tracks[0].mark).toBe('line');
    });
    it('Should resolve `superpose` options', () => {
        const tracks = resolveSuperposedTracks({
            overlay: [{ mark: 'line' }, { mark: 'point' }],
            width: 100,
            height: 100
        });
        expect(tracks).toHaveLength(2);
        expect(tracks[0].mark).toBe('line');
        expect(tracks[1].mark).toBe('point');
    });
    it('Should correct several options for consistency', () => {
        const tracks = resolveSuperposedTracks({
            overlay: [{ x: { axis: 'top' } }, { x: { axis: 'bottom' } }],
            width: 100,
            height: 100
        });
        expect(IsChannelDeep(tracks[0].x) && tracks[0].x.axis === 'top').toBe(true);
        expect(IsChannelDeep(tracks[0].x) && IsChannelDeep(tracks[1].x) && tracks[0].x.axis === tracks[1].x.axis).toBe(
            true
        );
    });
});
