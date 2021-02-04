import { shareScaleAcrossTracks } from './scales';
import { GoslingTrackModel } from '../gosling-track-model';
import { IsChannelDeep } from '../gosling.schema.guards';

describe('Should use shared scales', () => {
    it('Quantitative and nominal values should be shared properly', () => {
        const gm = new GoslingTrackModel(
            {
                data: { type: 'csv', url: '' },
                mark: 'line',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative', domain: [0, 1] },
                color: { field: 'color', type: 'nominal', domain: ['a'] },
                width: 300,
                height: 300
            },
            []
        );
        const forceShare = true;
        shareScaleAcrossTracks(
            [
                gm,
                new GoslingTrackModel(
                    {
                        data: { type: 'csv', url: '' },
                        mark: 'line',
                        x: { field: 'x', type: 'genomic' },
                        y: { field: 'y', type: 'quantitative', domain: [0, 2] },
                        color: { field: 'color', type: 'nominal', domain: ['a', 'b'] },
                        width: 300,
                        height: 300
                    },
                    []
                ),
                new GoslingTrackModel(
                    {
                        data: { type: 'csv', url: '' },
                        mark: 'line',
                        x: { field: 'x', type: 'genomic' },
                        y: { field: 'y', type: 'quantitative', domain: [-1, 3] },
                        color: { field: 'color', type: 'nominal', domain: ['c'] },
                        width: 300,
                        height: 300
                    },
                    []
                )
            ],
            forceShare
        );
        const spec = gm.spec();
        expect(IsChannelDeep(spec.y) ? (spec.y.domain as number[])[0] : undefined).toBe(-1);

        expect(IsChannelDeep(spec.y) ? (spec.y.domain as number[])[1] : undefined).toBe(3);

        expect(IsChannelDeep(spec.color) ? (spec.color.domain as string[]).length : undefined).toBe(3);
    });

    it('Quantitative and nominal values should not be shared if domain already defined', () => {
        const gm = new GoslingTrackModel(
            {
                data: { type: 'csv', url: '' },
                mark: 'line',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative', domain: [0, 1] },
                color: { field: 'color', type: 'nominal', domain: ['a'] },
                width: 300,
                height: 300
            },
            []
        );
        const forceShare = false;
        shareScaleAcrossTracks(
            [
                gm,
                new GoslingTrackModel(
                    {
                        data: { type: 'csv', url: '' },
                        mark: 'line',
                        x: { field: 'x', type: 'genomic' },
                        y: { field: 'y', type: 'quantitative', domain: [0, 2] },
                        color: { field: 'color', type: 'nominal', domain: ['a', 'b'] },
                        width: 300,
                        height: 300
                    },
                    []
                ),
                new GoslingTrackModel(
                    {
                        data: { type: 'csv', url: '' },
                        mark: 'line',
                        x: { field: 'x', type: 'genomic' },
                        y: { field: 'y', type: 'quantitative', domain: [0, 3] },
                        color: { field: 'color', type: 'nominal', domain: ['c'] },
                        width: 300,
                        height: 300
                    },
                    []
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
