import type { OverlaidTrack } from '@gosling-lang/gosling-schema';
import { IsChannelDeep } from '@gosling-lang/gosling-schema';
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
            _overlay: [{ mark: 'line' }],
            width: 100,
            height: 100
        });
        expect(tracks).toHaveLength(1);
        expect(tracks[0].mark).toBe('line');
    });
    it('Should resolve `superpose` options', () => {
        const tracks = resolveSuperposedTracks({
            _overlay: [{ mark: 'line' }, { mark: 'point' }],
            width: 100,
            height: 100
        });
        expect(tracks).toHaveLength(2);
        expect(tracks[0].mark).toBe('line');
        expect(tracks[1].mark).toBe('point');
    });
    it('Should correct several options for consistency', () => {
        const tracks = resolveSuperposedTracks({
            _overlay: [{ x: { axis: 'top' } }, { x: { axis: 'bottom' } }],
            width: 100,
            height: 100
        });
        expect(IsChannelDeep(tracks[0].x) && tracks[0].x.axis === 'top').toBe(true);
        expect(IsChannelDeep(tracks[0].x) && IsChannelDeep(tracks[1].x) && tracks[0].x.axis === tracks[1].x.axis).toBe(
            true
        );
    });
    it('Should delete title except the last one in overlaid tracks', () => {
        const tracks = resolveSuperposedTracks({
            title: 'title',
            _overlay: [{ x: { axis: 'top' } }, { x: { axis: 'bottom' } }],
            width: 100,
            height: 100
        });
        expect(tracks).toHaveLength(2);
        expect(tracks[0].title).toBeDefined();
        expect(tracks[1].title).toBeUndefined();
    });
});

describe('Spread Tracks By Data', () => {
    it('No overlay property', () => {
        const spread = spreadTracksByData([{ mark: 'line', data: { type: 'csv', url: '' }, width: 100, height: 100 }]);
        expect(spread).toHaveLength(1);
    });
    it('overlay: []', () => {
        const spread = spreadTracksByData([{ _overlay: [], width: 100, height: 100 }]);
        expect(spread).toHaveLength(1);
    });
    it('overlay: [{}]', () => {
        const spread = spreadTracksByData([{ _overlay: [{}], width: 100, height: 100 }]);
        expect(spread).toHaveLength(1);
    });
    it('overlay: [{ data }]', () => {
        const base = { _overlay: [{ data: { type: 'csv', url: '' } }] } as OverlaidTrack;
        const spread = spreadTracksByData([base]);
        expect(spread).toHaveLength(1);
        expect(spread[0]).toEqual(base); // The length is zero, so no point to spread
    });
    it('overlay: [{}, { data }]', () => {
        const spread = spreadTracksByData([
            { _overlay: [{}, { data: { type: 'csv', url: '' } }], width: 100, height: 100 }
        ]);
        expect(spread).toHaveLength(1); // There is only one unique data/dataTransform specification, so should not spread.
        expect('data' in spread[0]).toBe(true); // Since there is not data spec in the parent, it should be borrowed from a child.
    });
    it('overlay: [{}, { data }, { data }]', () => {
        const spread = spreadTracksByData([
            {
                _overlay: [
                    {},
                    { data: { type: 'csv', url: '' } },
                    { data: { type: 'vector', url: '', column: 'c', value: 'p' } }
                ],
                width: 100,
                height: 100
            }
        ]);
        expect(spread).toHaveLength(2); // first and second will be stored in a single track
        expect('data' in spread[0]).toBe(true);
        expect('data' in spread[1]).toBe(true);
        expect(spread[1].overlayOnPreviousTrack).toBe(true); // Any spread tracks will have `overlayOnPreviousTrack` flags
    });
    it('overlay: [{ data1 }, { data2 }]', () => {
        const spread = spreadTracksByData([
            {
                _overlay: [
                    { data: { type: 'csv', url: '' } },
                    { data: { type: 'vector', url: '', column: 'c', value: 'p' } }
                ],
                width: 100,
                height: 100
            }
        ]);
        expect(spread).toHaveLength(2);
        expect('data' in spread[0]).toBe(true);
        expect('data' in spread[1]).toBe(true);
        expect(spread[0].overlayOnPreviousTrack).toBe(false);
        expect(spread[1].overlayOnPreviousTrack).toBe(true);
    });
    it('Axis Position of overlay: [{ data1 }, { data2 }]', () => {
        const spread = spreadTracksByData([
            {
                _overlay: [
                    { data: { type: 'csv', url: '' }, y: { field: 'y', type: 'quantitative' } },
                    {
                        data: { type: 'vector', url: '', column: 'c', value: 'p' },
                        y: { field: 'y', type: 'quantitative' }
                    },
                    { data: { type: 'csv', url: '2' }, y: { field: 'y', type: 'quantitative' } }
                ],
                width: 100,
                height: 100
            }
        ]);
        expect(spread).toHaveLength(3);
        expect('data' in spread[0]).toBe(true);
        expect('data' in spread[1]).toBe(true);
        expect(spread[0].overlayOnPreviousTrack).toBe(false);
        expect(spread[1].overlayOnPreviousTrack).toBe(true);
        expect(spread[2].overlayOnPreviousTrack).toBe(true);
        expect((spread[1] as any).y.axis).toBe('right'); // position axis on the right to prevent visual occlusion
        expect((spread[2] as any).y.axis).toBe('none'); // hide axis
    });
    it('title of overlay: [{ data1 }]', () => {
        const spread = spreadTracksByData([
            {
                title: 'title',
                _overlay: [{ data: { type: 'vector', url: '', column: 'c', value: 'p' } }],
                width: 100,
                height: 100
            }
        ]);
        expect(spread).toHaveLength(1);
        expect('title' in spread[0]).toBe(true);
    });
    it('title of overlay: [{ data1 }, { data1 }]', () => {
        const spread = spreadTracksByData([
            {
                title: 'title',
                _overlay: [
                    { data: { type: 'vector', url: '', column: 'c', value: 'p' } },
                    { data: { type: 'vector', url: '', column: 'c', value: 'p' } }
                ],
                width: 100,
                height: 100
            }
        ]);
        expect(spread).toHaveLength(1);
        expect('title' in spread[0]).toBe(true);
    });

    it('title of overlay: [{ data1 }, { data2 }]', () => {
        const spread = spreadTracksByData([
            {
                title: 'title',
                _overlay: [
                    { data: { type: 'csv', url: '' } },
                    { data: { type: 'vector', url: '', column: 'c', value: 'p' } }
                ],
                width: 100,
                height: 100
            }
        ]);
        expect(spread).toHaveLength(2);
        expect('title' in spread[0]).toBe(false);
        expect('title' in spread[1]).toBe(true);
    });
});
