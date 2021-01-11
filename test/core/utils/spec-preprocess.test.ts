import { GeminidSpec, Track } from '../../../src/core/geminid.schema';
import { fixSpecDownstream } from '../../../src/core/utils/spec-preprocess';

describe('Spec Preprocess', () => {
    it('superposeOnPreviousTrack', () => {
        const spec: GeminidSpec = {
            layout: 'circular',
            arrangement: { direction: 'horizontal' },
            tracks: [{ data: { type: 'csv' }, mark: 'bar', superposeOnPreviousTrack: true }]
        };
        fixSpecDownstream(spec);
        expect(spec.tracks[0].superposeOnPreviousTrack).toEqual(false); // Should be fixed to `false`
    });

    it('circular layout', () => {
        const spec: GeminidSpec = {
            layout: 'circular',
            arrangement: { direction: 'horizontal' },
            tracks: [{} as Track]
        };
        fixSpecDownstream(spec);
        expect(spec.tracks[0].layout).toEqual('circular');
    });
});
