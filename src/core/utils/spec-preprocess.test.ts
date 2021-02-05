import { GoslingSpec, Track } from '../gosling.schema';
import { fixSpecDownstream, overrideTemplates } from './spec-preprocess';

describe('Spec Preprocess', () => {
    it('superposeOnPreviousTrack', () => {
        const spec: GoslingSpec = {
            layout: 'circular',
            arrangement: { direction: 'horizontal' },
            tracks: [{ data: { type: 'csv', url: '' }, mark: 'bar', superposeOnPreviousTrack: true }]
        };
        fixSpecDownstream(spec);

        // Should be fixed to `false` since the first track do not have a previoous track
        expect(spec.tracks[0].superposeOnPreviousTrack).toEqual(false);
    });

    it('circular layout', () => {
        const spec: GoslingSpec = {
            layout: 'circular',
            arrangement: { direction: 'horizontal' },
            tracks: [{} as Track, { static: false } as Track]
        };
        fixSpecDownstream(spec);

        expect(spec.tracks[0].layout).toEqual('circular');

        // By default, `static` option for circular tracks are `false` since we do not currently support proper zoom/pan interactions for circular ones.
        expect(spec.tracks[0].static).toEqual(true);

        // The `static` option shouldn't be changed if it is defined by a user.
        expect(spec.tracks[1].static).toEqual(false);
    });

    it('override template (higlass-vector)', () => {
        const spec: GoslingSpec = {
            tracks: [{ data: { type: 'vector', url: '', column: 'c', value: 'v' } } as Track]
        };
        overrideTemplates(spec);
        expect(spec.tracks[0]).toHaveProperty('mark');
    });

    it('override template (higlass-multivec)', () => {
        const spec: GoslingSpec = {
            tracks: [{ data: { type: 'multivec', url: '', row: 'r', column: 'c', value: 'v' } } as Track]
        };
        overrideTemplates(spec);
        expect(spec.tracks[0]).toHaveProperty('mark');
    });
});
