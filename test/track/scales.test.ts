import { shareScaleAcrossTracks } from '../../src/higlass-gemini-track/scales';
import { GeminiTrackModel } from '../../src/lib/gemini-track-model';
import { IsChannelDeep } from '../../src/lib/gemini.schema';

describe('Should use shared scales', () => {
    it('Quantitative and nominal values should be shared properly', () => {
        const gm = new GeminiTrackModel(
            {
                data: { type: 'csv', url: '' },
                mark: 'line',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative', domain: [0, 1] },
                color: { field: 'color', type: 'nominal', domain: ['a'] }
            },
            [],
            false
        );
        const forceShare = true;
        shareScaleAcrossTracks(
            [
                gm,
                new GeminiTrackModel(
                    {
                        data: { type: 'csv', url: '' },
                        mark: 'line',
                        x: { field: 'x', type: 'genomic' },
                        y: { field: 'y', type: 'quantitative', domain: [0, 2] },
                        color: { field: 'color', type: 'nominal', domain: ['a', 'b'] }
                    },
                    [],
                    false
                ),
                new GeminiTrackModel(
                    {
                        data: { type: 'csv', url: '' },
                        mark: 'line',
                        x: { field: 'x', type: 'genomic' },
                        y: { field: 'y', type: 'quantitative', domain: [0, 3] },
                        color: { field: 'color', type: 'nominal', domain: ['c'] }
                    },
                    [],
                    false
                )
            ],
            forceShare
        );
        const spec = gm.spec();
        expect(IsChannelDeep(spec.y) ? (spec.y.domain as number[])[0] : undefined).toBe(0);

        expect(IsChannelDeep(spec.y) ? (spec.y.domain as number[])[1] : undefined).toBe(3);

        expect(IsChannelDeep(spec.color) ? (spec.color.domain as string[]).length : undefined).toBe(3);
    });

    it('Quantitative and nominal values should not be shared if domain already defined', () => {
        const gm = new GeminiTrackModel(
            {
                data: { type: 'csv', url: '' },
                mark: 'line',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative', domain: [0, 1] },
                color: { field: 'color', type: 'nominal', domain: ['a'] }
            },
            [],
            false
        );
        const forceShare = false;
        shareScaleAcrossTracks(
            [
                gm,
                new GeminiTrackModel(
                    {
                        data: { type: 'csv', url: '' },
                        mark: 'line',
                        x: { field: 'x', type: 'genomic' },
                        y: { field: 'y', type: 'quantitative', domain: [0, 2] },
                        color: { field: 'color', type: 'nominal', domain: ['a', 'b'] }
                    },
                    [],
                    false
                ),
                new GeminiTrackModel(
                    {
                        data: { type: 'csv', url: '' },
                        mark: 'line',
                        x: { field: 'x', type: 'genomic' },
                        y: { field: 'y', type: 'quantitative', domain: [0, 3] },
                        color: { field: 'color', type: 'nominal', domain: ['c'] }
                    },
                    [],
                    false
                )
            ],
            forceShare
        );
        const spec = gm.spec();
        expect(IsChannelDeep(spec.y) ? (spec.y.domain as number[])[0] : undefined).toBe(0);

        expect(IsChannelDeep(spec.y) ? (spec.y.domain as number[])[1] : undefined).toBe(1);

        expect(IsChannelDeep(spec.color) ? (spec.color.domain as string[]).length : undefined).toBe(1);
    });
});
