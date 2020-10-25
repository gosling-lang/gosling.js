import { CHANNEL_DEFAULTS } from '../../src/core/channel';
import { GeminiTrackModel } from '../../src/core/gemini-track-model';
import { Track } from '../../src/core/gemini.schema';
import { HIGLASS_AXIS_SIZE } from '../../src/core/higlass-model';

describe('Position and size of each visual mark should be corrected encoded', () => {
    // Common dummy data
    const data = [
        { Q: 0, N: 'a', G: 11, G2: 13 },
        { Q: 1, N: 'b', G: 12, G2: 14 },
        { Q: 2, N: 'a', G: 13, G2: 15 }
    ];

    // Common spec
    const width = 100,
        height = 200;
    const baseTrack: Track = {
        mark: 'empty',
        data: { type: 'tileset', url: 'dummy' },
        width,
        height
    };

    it('point mark', () => {
        const mark = 'point';

        // (1) { X: G }
        {
            const track: Track = { ...baseTrack, mark, x: { field: 'G', type: 'genomic' } };
            const model = new GeminiTrackModel(track, data);

            const cx = model.encodedPIXIProperty('x-center', data[1]);
            const cy = model.encodedPIXIProperty('y-center', data[1]);
            const size = model.encodedPIXIProperty('size', data[1]);
            expect(cx).toEqual(width / 2.0);
            expect(cy).toEqual(height / 2.0);
            expect(size).toEqual(CHANNEL_DEFAULTS.SIZE);
        }
        // (2) { X: G, Y: Q }
        {
            const track: Track = {
                ...baseTrack,
                mark,
                x: { field: 'G', type: 'genomic' },
                y: { field: 'Q', type: 'quantitative' }
            };
            const model = new GeminiTrackModel(track, data);

            const cx = model.encodedPIXIProperty('x-center', data[1]);
            const cy = model.encodedPIXIProperty('y-center', data[1]);
            const size = model.encodedPIXIProperty('size', data[1]);
            expect(cx).toEqual(width / 2.0);
            expect(cy).toEqual(height / 2.0);
            expect(size).toEqual(CHANNEL_DEFAULTS.SIZE);
        }
        // (2.5) { X: G, Y: Q } + x-axis
        {
            const track: Track = {
                ...baseTrack,
                mark,
                x: { field: 'G', type: 'genomic', axis: 'top' },
                y: { field: 'Q', type: 'quantitative' }
            };
            const model = new GeminiTrackModel(track, data);

            const cx = model.encodedPIXIProperty('x-center', data[1]);
            const cy = model.encodedPIXIProperty('y-center', data[1]);
            const size = model.encodedPIXIProperty('size', data[1]);
            expect(cx).toEqual(width / 2.0);
            expect(cy).toEqual((height - HIGLASS_AXIS_SIZE) / 2.0);
            expect(size).toEqual(CHANNEL_DEFAULTS.SIZE);
        }
        // (3) { X: G, Y: Q, XE: G }
        {
            const track: Track = {
                ...baseTrack,
                mark,
                x: { field: 'G', type: 'genomic' },
                xe: { field: 'G2', type: 'genomic' },
                y: { field: 'Q', type: 'quantitative' }
            };
            const model = new GeminiTrackModel(track, data);

            const cx = model.encodedPIXIProperty('x-center', data[1]);
            const cy = model.encodedPIXIProperty('y-center', data[1]);
            const size = model.encodedPIXIProperty('size', data[1]);
            expect(cx).toEqual(width / 2.0); // middle position of [x, xe]
            expect(cy).toEqual(height / 2.0);
            expect(size).toEqual(CHANNEL_DEFAULTS.SIZE); // TODO: Allow to stretch the size to [x, xe]
        }
        // (4) { X: G, Y: Q, XE: G, ROW: N }
        {
            const track: Track = {
                ...baseTrack,
                mark,
                x: { field: 'G', type: 'genomic' },
                xe: { field: 'G2', type: 'genomic' },
                y: { field: 'Q', type: 'quantitative' },
                row: { field: 'N', type: 'nominal' }
            };
            const model = new GeminiTrackModel(track, data);

            const cx = model.encodedPIXIProperty('x-center', data[1]);
            const cy = model.encodedPIXIProperty('y-center', data[1]);
            const size = model.encodedPIXIProperty('size', data[1]);
            const rowOffset = model.encodedValue('row', data[1].N);
            expect(cx).toEqual(width / 2.0); // middle position of [x, xe]
            expect(cy).toEqual(height / 2.0 / 2.0);
            expect(rowOffset).toEqual(height / 2.0);
            expect(size).toEqual(CHANNEL_DEFAULTS.SIZE); // TODO: Allow to stretch the size to [x, xe]
        }
        // (5) { X: G, Y: Q, XE: G, ROW: N, SIZE: Q }
        {
            const track: Track = {
                ...baseTrack,
                mark,
                x: { field: 'G', type: 'genomic' },
                xe: { field: 'G2', type: 'genomic' },
                y: { field: 'Q', type: 'quantitative' },
                size: { field: 'Q', type: 'quantitative' },
                row: { field: 'N', type: 'nominal' }
            };
            const model = new GeminiTrackModel(track, data);

            const cx = model.encodedPIXIProperty('x-center', data[1]);
            const cy = model.encodedPIXIProperty('y-center', data[1]);
            const size = model.encodedPIXIProperty('size', data[1]);
            const rowOffset = model.encodedValue('row', data[1].N);
            expect(cx).toEqual(width / 2.0); // middle position of [x, xe]
            expect(cy).toEqual(height / 2.0 / 2.0);
            expect(rowOffset).toEqual(height / 2.0);
            expect(size).toEqual((CHANNEL_DEFAULTS.SIZE_RANGE[0] + CHANNEL_DEFAULTS.SIZE_RANGE[1]) / 2.0);
        }
    });
});
