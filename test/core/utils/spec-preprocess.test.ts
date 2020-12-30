import { GeminidSpec } from '../../../src/core/geminid.schema';
import { fixSpecDownstream } from '../../../src/core/utils/spec-preprocess';

describe('Spec Preprocess', () => {
    it('circular layout', () => {
        const spec: GeminidSpec = { layout: 'circular', arrangement: { direction: 'horizontal' }, tracks: [{}] };
        fixSpecDownstream(spec);
        expect(spec.tracks[0].layout).toEqual('circular');
    });
});
