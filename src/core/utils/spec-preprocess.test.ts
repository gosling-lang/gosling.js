import { GoslingSpec, Track } from '../gosling.schema';
import { fixSpecDownstream, overrideTemplates } from './spec-preprocess';

describe('Spec Preprocess', () => {
    it('superposeOnPreviousTrack', () => {
        const spec: GoslingSpec = {
            layout: 'circular',
            arrangement: { direction: 'horizontal' },
            tracks: [{ data: { type: 'csv' }, mark: 'bar', superposeOnPreviousTrack: true }]
        };
        fixSpecDownstream(spec);
        expect(spec.tracks[0].superposeOnPreviousTrack).toEqual(false); // Should be fixed to `false`
    });

    it('circular layout', () => {
        const spec: GoslingSpec = {
            layout: 'circular',
            arrangement: { direction: 'horizontal' },
            tracks: [{} as Track]
        };
        fixSpecDownstream(spec);
        expect(spec.tracks[0].layout).toEqual('circular');
    });

    it('override template (higlass-vector)', () => {
        const spec: GoslingSpec = {
            tracks: [{ data: {}, metadata: { type: 'higlass-vector', column: 'c', value: 'v' } } as Track]
        };
        overrideTemplates(spec);
        expect(spec.tracks[0]).toHaveProperty('mark');
    });

    it('override template (higlass-multivec)', () => {
        const spec: GoslingSpec = {
            tracks: [{ data: {}, metadata: { type: 'higlass-multivec', row: 'r', column: 'c', value: 'v' } } as Track]
        };
        overrideTemplates(spec);
        expect(spec.tracks[0]).toHaveProperty('mark');
    });
});
