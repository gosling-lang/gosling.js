import { GoslingTrackModel } from '../../core/gosling-track-model';
import { resolveSuperposedTracks } from '../../core/utils/overlay';
import { convertToFlatTracks } from '../../core/utils/spec-preprocess';
import { getTheme } from '../../core/utils/theme';
import { EX_TRACK_SEMANTIC_ZOOM } from './semantic-zoom';

describe('Example specs should be valid', () => {
    it('Ideogram', () => {
        let valid = true;
        const msgs: string[] = [];

        const flatTracks = convertToFlatTracks(EX_TRACK_SEMANTIC_ZOOM.cytoband);

        const resolvedIdeograms = resolveSuperposedTracks(flatTracks[0]);
        resolvedIdeograms.forEach(spec => {
            const ideogramMark = new GoslingTrackModel(spec, [], getTheme());
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

        convertToFlatTracks(EX_TRACK_SEMANTIC_ZOOM.cytoband).forEach(t => {
            const resolvedIdeograms = resolveSuperposedTracks({ ...t, width: 300, height: 300 });
            resolvedIdeograms.forEach(spec => {
                const ideogramMark = new GoslingTrackModel(spec, [], getTheme());
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
