import { GeminiTrackModel } from '../../../src/core/gemini-track-model';
import { resolveSuperposedTracks } from '../../../src/core/utils/superpose';
import { EXAMPLE_IDEOGRAM_TRACK } from '../../../src/editor/example/ideogram';
import { EXAMPLE_SEMANTIC_ZOOMING } from '../../../src/editor/example/semantic-zoom';

describe('Example specs should be valid', () => {
    it('Ideogram', () => {
        let valid = true;
        const msgs: string[] = [];

        const resolvedIdeograms = resolveSuperposedTracks(EXAMPLE_IDEOGRAM_TRACK);
        resolvedIdeograms.forEach(spec => {
            const ideogramMark = new GeminiTrackModel(spec, []);
            const validity = ideogramMark.validateSpec();
            if (!validity.valid) {
                valid = false;
                msgs.push(...validity.errorMessages);
            }
        });

        // if (!valid) {
        //     console.log(msgs);
        // }

        expect(valid).toEqual(true);
    });

    it('semantic zoom', () => {
        let valid = true;
        const msgs: string[] = [];

        EXAMPLE_SEMANTIC_ZOOMING.tracks.forEach(t => {
            const resolvedIdeograms = resolveSuperposedTracks(t);
            resolvedIdeograms.forEach(spec => {
                const ideogramMark = new GeminiTrackModel(spec, []);
                const validity = ideogramMark.validateSpec();
                if (!validity.valid) {
                    valid = false;
                    msgs.push(...validity.errorMessages);
                }
            });
        });

        // if (!valid) {
        //     console.log(msgs);
        // }

        expect(valid).toEqual(true);
    });
});
