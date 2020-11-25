import { CHANNEL_DEFAULTS } from '../../../src/core/channel';
import { GeminidTrackModel } from '../../../src/core/geminid-track-model';
import { Track } from '../../../src/core/geminid.schema';
import { HIGLASS_AXIS_SIZE } from '../../../src/core/higlass-model';

describe('Point marks should correctly encode visual channels', () => {
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
        mark: 'point',
        data: { type: 'tileset', url: 'dummy' },
        width,
        height
    };

    it('x --> G', () => {
        const track: Track = { ...baseTrack, x: { field: 'G', type: 'genomic' } };
        const model = new GeminidTrackModel(track, data);

        const cx = model.encodedPIXIProperty('x-center', data[1]);
        const cy = model.encodedPIXIProperty('y-center', data[1]);
        const size = model.encodedPIXIProperty('size', data[1]);
        expect(cx).toEqual(width / 2.0);
        expect(cy).toEqual(height / 2.0);
        expect(size).toEqual(CHANNEL_DEFAULTS.SIZE);
    });

    it('x --> G, y --> Q', () => {
        {
            const track: Track = {
                ...baseTrack,
                x: { field: 'G', type: 'genomic' },
                y: { field: 'Q', type: 'quantitative' }
            };
            const model = new GeminidTrackModel(track, data);

            const cx = model.encodedPIXIProperty('x-center', data[1]);
            const cy = model.encodedPIXIProperty('y-center', data[1]);
            const size = model.encodedPIXIProperty('size', data[1]);
            expect(cx).toEqual(width / 2.0);
            expect(cy).toEqual(height / 2.0);
            expect(size).toEqual(CHANNEL_DEFAULTS.SIZE);
        }
        {
            // with axis labels
            const track: Track = {
                ...baseTrack,
                x: { field: 'G', type: 'genomic', axis: 'top' },
                y: { field: 'Q', type: 'quantitative' }
            };
            const model = new GeminidTrackModel(track, data);

            const cx = model.encodedPIXIProperty('x-center', data[1]);
            const cy = model.encodedPIXIProperty('y-center', data[1]);
            const size = model.encodedPIXIProperty('size', data[1]);
            expect(cx).toEqual(width / 2.0);
            expect(cy).toEqual((height - HIGLASS_AXIS_SIZE) / 2.0);
            expect(size).toEqual(CHANNEL_DEFAULTS.SIZE);
        }
    });

    it('x --> G, xe --> G, y --> Q', () => {
        const track: Track = {
            ...baseTrack,
            x: { field: 'G', type: 'genomic' },
            xe: { field: 'G2', type: 'genomic' },
            y: { field: 'Q', type: 'quantitative' }
        };
        const model = new GeminidTrackModel(track, data);

        const cx = model.encodedPIXIProperty('x-center', data[1]);
        const cy = model.encodedPIXIProperty('y-center', data[1]);
        const size = model.encodedPIXIProperty('size', data[1]);
        expect(cx).toEqual(width / 2.0); // middle position of [x, xe]
        expect(cy).toEqual(height / 2.0);
        expect(size).toEqual(CHANNEL_DEFAULTS.SIZE); // TODO: Allow to stretch the size to [x, xe]
    });

    it('x --> G, xe --> G, y --> Q, row --> nominal', () => {
        const track: Track = {
            ...baseTrack,
            x: { field: 'G', type: 'genomic' },
            xe: { field: 'G2', type: 'genomic' },
            y: { field: 'Q', type: 'quantitative' },
            row: { field: 'N', type: 'nominal' }
        };
        const model = new GeminidTrackModel(track, data);

        const cx = model.encodedPIXIProperty('x-center', data[1]);
        const cy = model.encodedPIXIProperty('y-center', data[1]);
        const size = model.encodedPIXIProperty('size', data[1]);
        const rowOffset = model.encodedValue('row', data[1].N);
        expect(cx).toEqual(width / 2.0); // middle position of [x, xe]
        expect(cy).toEqual(height / 2.0 / 2.0);
        expect(rowOffset).toEqual(height / 2.0);
        expect(size).toEqual(CHANNEL_DEFAULTS.SIZE); // TODO: Allow to stretch the size to [x, xe]
    });

    it('x --> G, xe --> G, y --> Q, row --> N, size --> Q', () => {
        const track: Track = {
            ...baseTrack,
            x: { field: 'G', type: 'genomic' },
            xe: { field: 'G2', type: 'genomic' },
            y: { field: 'Q', type: 'quantitative' },
            size: { field: 'Q', type: 'quantitative' },
            row: { field: 'N', type: 'nominal' }
        };
        const model = new GeminidTrackModel(track, data);

        const cx = model.encodedPIXIProperty('x-center', data[1]);
        const cy = model.encodedPIXIProperty('y-center', data[1]);
        const size = model.encodedPIXIProperty('size', data[1]);
        const rowOffset = model.encodedValue('row', data[1].N);
        expect(cx).toEqual(width / 2.0); // middle position of [x, xe]
        expect(cy).toEqual(height / 2.0 / 2.0);
        expect(rowOffset).toEqual(height / 2.0);
        expect(size).toEqual((CHANNEL_DEFAULTS.SIZE_RANGE[0] + CHANNEL_DEFAULTS.SIZE_RANGE[1]) / 2.0);
    });
});
