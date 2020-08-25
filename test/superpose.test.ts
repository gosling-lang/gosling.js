import { resolveSuperposedTracks } from '../src/track/superpose';

describe('Should handle superposition options correctly', () => {
    it('Should resolve `superpose` options when the array length is one', () => {
        const tracks = resolveSuperposedTracks({
            superpose: [{ mark: 'line' }]
        });
        expect(tracks).toHaveLength(1);
        expect(tracks[0].mark).toBe('line');
    });
    it('Should resolve `superpose` options', () => {
        const tracks = resolveSuperposedTracks({
            superpose: [{ mark: 'line' }, { mark: 'point' }]
        });
        expect(tracks).toHaveLength(2);
        expect(tracks[0].mark).toBe('line');
        expect(tracks[1].mark).toBe('point');
    });
});
