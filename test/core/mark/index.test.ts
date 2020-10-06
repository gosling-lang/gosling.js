import { drawMark } from '../../../src/core/mark';
import { GeminiTrackModel } from '../../../src/core/gemini-track-model';

describe('Should draw marks correctly', () => {
    it('Should return early when some of parameters are not properly provided', () => {
        drawMark(null, null, null, new GeminiTrackModel({}, []));
    });
});
