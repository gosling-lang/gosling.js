import { Track } from '../../../src/core/geminid.schema';
import { DEFAULT_TRACK_HEIGHT, DEFAULT_TRACK_WIDTH } from '../../../src/core/layout/defaults';
import { getArrangement, getGridInfo } from '../../../src/core/utils/bounding-box';

describe('Calculate the size and arrangement of tracks correctly', () => {
    const width = 100,
        height = 300;
    const t: Track = {
        data: { url: 'dummy', type: 'csv' },
        mark: 'dummy'
    };

    it('single track', () => {
        const defaultTrack = getGridInfo({ tracks: [t] });
        expect(defaultTrack.width).toEqual(DEFAULT_TRACK_WIDTH);
        expect(defaultTrack.height).toEqual(DEFAULT_TRACK_HEIGHT);

        const vTrack = getGridInfo({
            layout: { type: 'linear', direction: 'vertical', columnSizes: width, rowSizes: height },
            tracks: [t]
        });
        expect(vTrack.width).toEqual(width);
        expect(vTrack.height).toEqual(height);

        const hTrack = getGridInfo({
            layout: { type: 'linear', direction: 'horizontal', columnSizes: width, rowSizes: height },
            tracks: [t]
        });
        expect(hTrack.width).toEqual(vTrack.width);
        expect(hTrack.height).toEqual(vTrack.height);

        const cTrack = getGridInfo({
            layout: { type: 'circular', direction: 'horizontal', columnSizes: width, rowSizes: height },
            tracks: [t]
        });
        expect(cTrack.width).toEqual(vTrack.width);
        expect(cTrack.height).toEqual(vTrack.height);

        // check additional outputs
        expect(cTrack.rowSizes).toHaveLength(1);
        expect(cTrack.rowSizes[0]).toEqual(cTrack.height);

        /* track info*/
        const arrangement = getArrangement({ tracks: [t] });
        expect(arrangement).toHaveLength(1);

        // bounding box
        expect(arrangement[0].boundingBox.x).toEqual(0);
        expect(arrangement[0].boundingBox.y).toEqual(0);
        expect(arrangement[0].boundingBox.width).toEqual(DEFAULT_TRACK_WIDTH);
        expect(arrangement[0].boundingBox.height).toEqual(DEFAULT_TRACK_HEIGHT);

        // relative arrangements for `react-grid-layout`
        expect(arrangement[0].layout.x).toEqual(0);
        expect(arrangement[0].layout.y).toEqual(0);
        expect(arrangement[0].layout.w).toEqual(12);
        expect(arrangement[0].layout.h).toEqual(12);

        // size of tracks should be added or replaced
        expect(arrangement[0].track.width).toEqual(DEFAULT_TRACK_WIDTH);
        expect(arrangement[0].track.height).toEqual(DEFAULT_TRACK_HEIGHT);
    });

    // TODO: Add multi-track tests when those functions are frequently used
});
