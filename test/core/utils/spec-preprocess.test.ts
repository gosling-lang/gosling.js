import { GeminiSpec } from '../../../src/core/gemini.schema';
import { fixSpecDownstream } from '../../../src/core/utils/spec-preprocess';

describe('Preprocess the spec correctly', () => {
    it('circular layout', () => {
        const spec: GeminiSpec = { layout: { type: 'circular', direction: 'horizontal' }, tracks: [{}] };
        fixSpecDownstream(spec);
        expect(spec.tracks[0].circularLayout).toEqual(true);
    });
});
