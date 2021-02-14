import { GoslingTrackModel } from '../../core/gosling-track-model';
import { resolveSuperposedTracks } from '../../core/utils/overlay';
import { ScalableCytoBand } from '../example-new/semantic-zoom';

describe('Example specs should be valid', () => {
    it('Ideogram', () => {
        let valid = true;
        const msgs: string[] = [];

        const resolvedIdeograms = resolveSuperposedTracks({
            ...ScalableCytoBand
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

        [ScalableCytoBand].forEach(t => {
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
