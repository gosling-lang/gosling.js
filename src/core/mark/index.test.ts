import { drawMark } from '.';
import { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import type { SingleTrack } from '@gosling-lang/gosling-schema';
import { getTheme } from '../utils/theme';

describe('Should draw marks correctly', () => {
    it('Should return early when some of parameters are not properly provided', () => {
        drawMark(
            // @ts-expect-error should require HGC
            null,
            null,
            null,
            new GoslingTrackModel({} as SingleTrack, [], getTheme())
        );
    });
});
