import { getNumericDomain, shareScaleAcrossTracks } from './scales';
import { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import { IsChannelDeep } from '@gosling-lang/gosling-schema';
import { getTheme } from './theme';
import type { ChromSizes } from '@gosling-lang/gosling-schema';

describe('Genomic domain', () => {
    it('With Chromosome', () => {
        expect(getNumericDomain({ chromosome: '1' }, 'hg38')).toBeUndefined();
        expect(getNumericDomain({ interval: [1, 100] })).toEqual([1, 100]);
        expect(getNumericDomain({ chromosome: 'chr1', interval: [1, 100] })).toEqual([1, 100]);

        const customAssembly: ChromSizes = [
            ['foo', 10],
            ['bar', 20],
            ['barz', 30]
        ];
        expect(getNumericDomain({ chromosome: 'fool' }, customAssembly)).toBeUndefined();
        expect(getNumericDomain({ chromosome: 'bar' }, customAssembly)).toEqual([11, 30]);
        expect(getNumericDomain({ chromosome: 'barz', interval: [1, 2] }, customAssembly)).toEqual([31, 32]);
    });
});

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
            [],
            getTheme()
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
                    [],
                    getTheme()
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
                    [],
                    getTheme()
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
            [],
            getTheme()
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
                    [],
                    getTheme()
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
                    [],
                    getTheme()
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
