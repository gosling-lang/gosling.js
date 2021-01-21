import { GeminidSpec, Track } from '../../../src/core/geminid.schema';
import { DEFAULT_TRACK_HEIGHT, DEFAULT_TRACK_WIDTH, DEFAULT_TRACK_GAP } from '../../../src/core/layout/defaults';
import { getArrangement, getGridInfo } from '../../../src/core/utils/bounding-box';

describe('Arrangement', () => {
    const width = 100,
        height = 300;
    const t: Track = {
        data: { url: 'dummy', type: 'csv' },
        mark: 'point'
    };

    it('single track', () => {
        const defaultTrack = getGridInfo({ tracks: [t] });
        expect(defaultTrack.width).toEqual(DEFAULT_TRACK_WIDTH);
        expect(defaultTrack.height).toEqual(DEFAULT_TRACK_HEIGHT);

        const vTrack = getGridInfo({
            layout: 'circular',
            arrangement: { direction: 'vertical', columnSizes: width, rowSizes: height },
            tracks: [t]
        });
        expect(vTrack.width).toEqual(width);
        expect(vTrack.height).toEqual(height);

        const hTrack = getGridInfo({
            layout: 'circular',
            arrangement: { direction: 'horizontal', columnSizes: width, rowSizes: height },
            tracks: [t]
        });
        expect(hTrack.width).toEqual(vTrack.width);
        expect(hTrack.height).toEqual(vTrack.height);

        const cTrack = getGridInfo({
            layout: 'circular',
            arrangement: { direction: 'horizontal', columnSizes: width, rowSizes: height },
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

    describe('multiple tracks', () => {
        it('2x1', () => {
            const a = getArrangement({ tracks: [t, t] });
            expect(a).toHaveLength(2);

            // bounding box
            expect(a[1].boundingBox.x).toEqual(0);
            expect(a[1].boundingBox.y).toEqual(DEFAULT_TRACK_HEIGHT + DEFAULT_TRACK_GAP);

            // relative arrangements for `react-grid-layout`
            expect(a[1].layout.x).toEqual(0);
            expect(a[1].layout.y).toEqual(
                ((DEFAULT_TRACK_HEIGHT + DEFAULT_TRACK_GAP) / (DEFAULT_TRACK_HEIGHT * 2 + DEFAULT_TRACK_GAP)) * 12
            );
            expect(a[1].layout.w).toEqual(12);
            expect(a[1].layout.h).toEqual((DEFAULT_TRACK_HEIGHT / (DEFAULT_TRACK_HEIGHT * 2 + DEFAULT_TRACK_GAP)) * 12);
        });
        it('1x2', () => {
            const a = getArrangement({ layout: 'linear', arrangement: { direction: 'horizontal' }, tracks: [t, t] });
            expect(a).toHaveLength(2);

            // bounding box
            expect(a[1].boundingBox.y).toEqual(0);
            expect(a[1].boundingBox.x).toEqual(DEFAULT_TRACK_WIDTH + DEFAULT_TRACK_GAP);

            // relative arrangements for `react-grid-layout`
            expect(a[1].layout.y).toEqual(0);
            expect(a[1].layout.x).toEqual(
                ((DEFAULT_TRACK_WIDTH + DEFAULT_TRACK_GAP) / (DEFAULT_TRACK_WIDTH * 2 + DEFAULT_TRACK_GAP)) * 12
            );
            expect(a[1].layout.h).toEqual(12);
            expect(a[1].layout.w).toEqual((DEFAULT_TRACK_WIDTH / (DEFAULT_TRACK_WIDTH * 2 + DEFAULT_TRACK_GAP)) * 12);
        });
        it('2x2', () => {
            const a = getArrangement({
                layout: 'linear',
                arrangement: { direction: 'horizontal', wrap: 2 },
                tracks: [t, t, t, t]
            });
            expect(a).toHaveLength(4);

            // bounding box
            expect(a[3].boundingBox.x).toEqual(DEFAULT_TRACK_WIDTH + DEFAULT_TRACK_GAP);
            expect(a[3].boundingBox.y).toEqual(DEFAULT_TRACK_HEIGHT + DEFAULT_TRACK_GAP);
        });
        it('3x1 w/ superpose', () => {
            const a = getArrangement({
                layout: 'linear',
                arrangement: { direction: 'horizontal', wrap: 2 },
                tracks: [t, t, t, { ...t, superposeOnPreviousTrack: true }]
            });
            expect(a).toHaveLength(4);

            // bounding box
            expect(a[2].boundingBox).toEqual(a[3].boundingBox);
        });
        it('12x1 complex', () => {
            const rowSizes = [30, 44, 44, 44, 44, 44, 44, 44, 100, 100, 90, 100];
            const rowGaps = [40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 40];
            const tracks = [t, t, t, t, t, t, t, t, t, t, t, t];
            const spec: GeminidSpec = {
                layout: 'linear',
                arrangement: {
                    direction: 'vertical',
                    columnSizes: [550],
                    rowSizes,
                    rowGaps
                },
                tracks // 12 tracks
            };

            const g = getGridInfo(spec);
            expect(g.height).toEqual(rowSizes.reduce((a, b) => a + b, 0) + rowGaps.reduce((a, b) => a + b, 0));

            const a = getArrangement(spec);
            expect(a).toHaveLength(tracks.length);

            // bounding box of the last one
            expect(a[tracks.length - 1].boundingBox.x).toEqual(0);
            expect(a[tracks.length - 1].boundingBox.y).toEqual(
                rowSizes.reduce((a, b) => a + b, 0) + rowGaps.reduce((a, b) => a + b, 0) - 100 /* last track's height */
            );
            expect(a[tracks.length - 1].layout.y).toEqual(
                (1 - 100 / (rowSizes.reduce((a, b) => a + b, 0) + rowGaps.reduce((a, b) => a + b, 0))) * 12
            );
        });
    });
});
