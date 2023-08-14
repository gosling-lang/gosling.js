import * as PIXI from 'pixi.js';
import { CHANNEL_DEFAULTS } from '../channel';
import { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import type { Track } from '@gosling-lang/gosling-schema';
import { HIGLASS_AXIS_SIZE } from '../../compiler/higlass-model';
import type { SingleTrack } from '@gosling-lang/gosling-schema';
import { drawPoint } from './point';
import { getTheme } from '../utils/theme';

describe('Rendering Point', () => {
    const g = new PIXI.Graphics();
    it('Simple', () => {
        const t: SingleTrack = {
            data: { type: 'csv', url: '' },
            mark: 'point',
            x: { field: 'x', type: 'genomic' },
            y: { field: 'y', type: 'quantitative' },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, y: 2 },
            { x: 11, y: 22 },
            { x: 111, y: 222 }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawPoint({ dimensions: [100, 100] }, g, model);
    });
});

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
        data: { type: 'vector', url: 'dummy', column: '', value: '' },
        width,
        height
    };

    it('x --> G', () => {
        const track: Track = { ...baseTrack, x: { field: 'G', type: 'genomic' } };
        const model = new GoslingTrackModel(track, data, getTheme());

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
            const model = new GoslingTrackModel(track, data, getTheme());

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
            const model = new GoslingTrackModel(track, data, getTheme());

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
        const model = new GoslingTrackModel(track, data, getTheme());

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
        const model = new GoslingTrackModel(track, data, getTheme());

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
        const model = new GoslingTrackModel(track, data, getTheme());

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
