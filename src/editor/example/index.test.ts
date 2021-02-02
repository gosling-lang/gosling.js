import { GoslingTrackModel } from '../../core/gosling-track-model';
import { resolveSuperposedTracks } from '../../core/utils/superpose';
import { EXAMPLE_SEMANTIC_ZOOMING } from './basic/semantic-zoom';
import { EXAMPLE_CYTOAND_HG38 } from './cytoband-hg38';

describe('Example specs should be valid', () => {
    it('Ideogram', () => {
        let valid = true;
        const msgs: string[] = [];

        const resolvedIdeograms = resolveSuperposedTracks({
            ...EXAMPLE_CYTOAND_HG38.tracks[0],
            width: 300,
            height: 300
        });
        resolvedIdeograms.forEach(spec => {
            const ideogramMark = new GoslingTrackModel(spec, []);
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
            const resolvedIdeograms = resolveSuperposedTracks({ ...t, width: 300, height: 300 });
            resolvedIdeograms.forEach(spec => {
                const ideogramMark = new GoslingTrackModel(spec, []);
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
