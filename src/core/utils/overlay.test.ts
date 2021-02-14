import { OverlaidTrack } from '../gosling.schema';
import { IsChannelDeep } from '../gosling.schema.guards';
import { resolveSuperposedTracks, spreadTracksByData } from './overlay';

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

describe('Spread Tracks By Data', () => {
    it('No superpose property', () => {
        const spread = spreadTracksByData([{ mark: 'line', data: { type: 'csv', url: '' }, width: 100, height: 100 }]);
        expect(spread).toHaveLength(1);
    });
    it('superpose: []', () => {
        const spread = spreadTracksByData([{ overlay: [], width: 100, height: 100 }]);
        expect(spread).toHaveLength(1);
    });
    it('superpose: [{}]', () => {
        const spread = spreadTracksByData([{ overlay: [{}], width: 100, height: 100 }]);
        expect(spread).toHaveLength(1);
    });
    it('superpose: [{ data }]', () => {
        const base = { overlay: [{ data: { type: 'csv', url: '' } }] } as OverlaidTrack;
        const spread = spreadTracksByData([base]);
        expect(spread).toHaveLength(1);
        expect(spread[0]).toEqual(base); // The length is zero, so no point to spread
    });
    it('superpose: [{}, { data }]', () => {
        const spread = spreadTracksByData([
            { overlay: [{}, { data: { type: 'csv', url: '' } }], width: 100, height: 100 }
        ]);
        expect(spread).toHaveLength(2);
        expect('data' in spread[1]).toBe(true); // Any superposed tracks w/ data/metadata will be spread
        expect(spread[1].overlayOnPreviousTrack).toBe(true); // Any spread tracks will have `superposeOnPreviousTrack` flags
    });
    it('superpose: [{}, { data }, { data }]', () => {
        const spread = spreadTracksByData([
            {
                overlay: [
                    {},
                    { data: { type: 'csv', url: '' } },
                    { data: { type: 'vector', url: '', column: 'c', value: 'p' } }
                ],
                width: 100,
                height: 100
            }
        ]);
        expect(spread).toHaveLength(3);
        expect('data' in spread[1]).toBe(true);
        expect('data' in spread[2]).toBe(true);
        expect(spread[1].overlayOnPreviousTrack).toBe(true); // Any spread tracks will have `superposeOnPreviousTrack` flags
        expect(spread[2].overlayOnPreviousTrack).toBe(true); // Any spread tracks will have `superposeOnPreviousTrack` flags
    });
});
