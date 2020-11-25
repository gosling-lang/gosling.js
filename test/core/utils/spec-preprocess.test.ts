import { GeminidSpec } from '../../../src/core/geminid.schema';
import { fixSpecDownstream } from '../../../src/core/utils/spec-preprocess';

describe('Spec Preprocess', () => {
    it('circular layout', () => {
        const spec: GeminidSpec = { layout: { type: 'circular', direction: 'horizontal' }, tracks: [{}] };
        fixSpecDownstream(spec);
        expect(spec.tracks[0].circularLayout).toEqual(true);
    });
});
