import { Track } from '../../../src/core/gemini.schema';
import { calculateBoundingBox } from '../../../src/core/utils/bounding-box';
import { INNER_CIRCLE_RADIUS, TRACK_GAP } from '../../../src/core/visualizations/defaults';

describe('Calculate the bounding box of Gemini views correctly', () => {
    it('Calculate the bounding box of linear layouts correctly', () => {
        const t: Track = {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 100,
            height: 300
        };
        const singleTrack = calculateBoundingBox({
            tracks: [t]
        });
        expect(singleTrack.width).toEqual(100);
        expect(singleTrack.height).toEqual(300);

        const verTrack = calculateBoundingBox({
            tracks: [t, t]
        });
        expect(verTrack.width).toEqual(100);
        expect(verTrack.height).toEqual(600 + TRACK_GAP);

        const horTrack = calculateBoundingBox({
            layout: { type: 'linear', direction: 'horizontal' },
            tracks: [t, t]
        });
        expect(horTrack.width).toEqual(200 + TRACK_GAP);
        expect(horTrack.height).toEqual(300);

        const horWrapTrack = calculateBoundingBox({
            layout: { type: 'linear', direction: 'horizontal', wrap: 1 },
            tracks: [t, t]
        });
        expect(horWrapTrack.width).toEqual(100);
        expect(horWrapTrack.height).toEqual(600 + TRACK_GAP * 2);
    });

    it('Calculate the bounding box of circular layouts correctly', () => {
        const t: Track = {
            data: { url: 'dummy', type: 'csv' },
            mark: 'dummy',
            width: 100,
            height: 300
        };
        const singleTrack = calculateBoundingBox({
            layout: { type: 'circular', direction: 'horizontal' },
            tracks: [t]
        });
        expect(singleTrack.width).toEqual(300 + INNER_CIRCLE_RADIUS * 2);
        expect(singleTrack.width === singleTrack.height).toEqual(true);
    });
});
