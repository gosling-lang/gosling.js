import { CHANNEL_DEFAULTS } from '../../src/core/channel';
import { GeminiTrackModel } from '../../src/core/gemini-track-model';
import { Track } from '../../src/core/gemini.schema';

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

        // (1) X --> G, Y --> NONE, XE --> NONE, ROW --> NONE, SIZE --> NONE
        {
            const track: Track = { ...baseTrack, mark, x: { field: 'G', type: 'genomic' } };
            const model = new GeminiTrackModel(track, data);

            const cx = model.encodedProperty('x-center', data[1]);
            const y = model.encodedProperty('y', data[1]); // TODO: change to y-center
            const size = model.encodedProperty('size', data[1]);
            expect(cx).toEqual(width / 2.0);
            expect(y).toEqual(height / 2.0);
            expect(size).toEqual(CHANNEL_DEFAULTS.SIZE);
        }
        // (2) X --> G, Y --> Q, XE --> NONE, ROW --> NONE, SIZE --> NONE
        {
            const track: Track = {
                ...baseTrack,
                mark,
                x: { field: 'G', type: 'genomic' },
                y: { field: 'Q', type: 'quantitative' }
            };
            const model = new GeminiTrackModel(track, data);

            const cx = model.encodedProperty('x-center', data[1]);
            const y = model.encodedProperty('y', data[1]); // TODO: change to y-center
            const size = model.encodedProperty('size', data[1]);
            expect(cx).toEqual(width / 2.0);
            expect(y).toEqual(height / 2.0);
            expect(size).toEqual(CHANNEL_DEFAULTS.SIZE);
        }
        // (3) X --> G, Y --> Q, XE --> G, ROW --> NONE, SIZE --> NONE
        {
            const track: Track = {
                ...baseTrack,
                mark,
                x: { field: 'G', type: 'genomic' },
                xe: { field: 'G2', type: 'genomic' },
                y: { field: 'Q', type: 'quantitative' }
            };
            const model = new GeminiTrackModel(track, data);

            const cx = model.encodedProperty('x-center', data[1]);
            const y = model.encodedProperty('y', data[1]); // TODO: change to y-center
            const size = model.encodedProperty('size', data[1]);
            expect(cx).toEqual(width / 2.0); // middle position of the [x, xe]
            expect(y).toEqual(height / 2.0);
            expect(size).toEqual(CHANNEL_DEFAULTS.SIZE); // TODO: Allow to stretch the size to [x, xe]
        }
    });
});
