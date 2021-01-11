import { drawMark } from '../../../src/core/mark';
import { GeminidTrackModel } from '../../../src/core/geminid-track-model';
import { BasicSingleTrack } from '../../../src/core/geminid.schema';

describe('Should draw marks correctly', () => {
    it('Should return early when some of parameters are not properly provided', () => {
        drawMark(null, null, null, new GeminidTrackModel({} as BasicSingleTrack, []));
    });
});
