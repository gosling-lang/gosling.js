import { drawMark } from '.';
import { GoslingTrackModel } from '../gosling-track-model';
import { SingleTrack } from '../gosling.schema';

describe('Should draw marks correctly', () => {
    it('Should return early when some of parameters are not properly provided', () => {
        drawMark(null, null, null, new GoslingTrackModel({} as SingleTrack, []));
    });
});
