import { drawMark } from '../../../src/higlass-gemini-track/mark';
import { GeminiTrackModel } from '../../../src/lib/gemini-track-model';

describe('Should draw marks correctly', () => {
    it('Should return early when some of parameters are not properly provided', () => {
        drawMark(null, null, null, new GeminiTrackModel({}, [], false));
    });
});
