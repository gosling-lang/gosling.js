import {
    getValueUsingChannel,
    isStackedMark,
    Track,
    isStackedChannel,
    getVisualizationType,
    IsChannelDeep,
    Channel,
    IsChannelValue
} from '../src/lib/gemini.schema';

describe('gemini schema should be checked correctly', () => {
    it('Deep channels or value channels should be detected correctly', () => {
        expect(IsChannelDeep({ value: 1 } as Channel)).toBe(false);
        expect(IsChannelDeep({ field: 'x' } as Channel)).toBe(true);
        expect(IsChannelValue({ value: 1 } as Channel)).toBe(true);
        expect(IsChannelValue({ field: 'x' } as Channel)).toBe(false);
    });

    it('Should properly retreive values from data with channel spec', () => {
        expect(getValueUsingChannel({ x: 1 }, { field: 'x' } as Channel)).toBe(1);

        expect(getValueUsingChannel({ x: 1 }, { field: 'y' } as Channel)).toBeUndefined();
    });

    it('Spec for stacked bar/area charts should be detected as using a stacked mark', () => {
        expect(
            isStackedMark({
                mark: 'bar',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative' },
                color: { field: 'y', type: 'nominal' }
            } as Track)
        ).toBe(true);

        expect(
            isStackedMark({
                mark: 'area',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative' },
                color: { field: 'y', type: 'nominal' }
            } as Track)
        ).toBe(true);
    });

    it('Spec for regular charts without stacking marks should be detected as using a non-stacked mark', () => {
        expect(
            isStackedMark({
                mark: 'bar',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative' },
                color: { field: 'y', type: 'quantitative' }
            } as Track)
        ).toBe(false);

        expect(
            isStackedMark({
                mark: 'bar',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative' },
                color: { field: 'y', type: 'nominal' },
                row: { field: 'y', type: 'nominal' }
            } as Track)
        ).toBe(false);

        expect(
            isStackedMark({
                mark: 'line',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative' },
                color: { field: 'y', type: 'nominal' }
            } as Track)
        ).toBe(false);
    });

    it('Stacked channels should be detected correctly', () => {
        expect(
            isStackedChannel(
                {
                    mark: 'bar',
                    x: { field: 'x', type: 'genomic' },
                    y: { field: 'y', type: 'quantitative' },
                    color: { field: 'y', type: 'nominal' }
                } as Track,
                'y'
            )
        ).toBe(true);

        expect(
            isStackedChannel(
                {
                    mark: 'bar',
                    x: { field: 'x', type: 'genomic' },
                    y: { field: 'y', type: 'quantitative' },
                    color: { field: 'y', type: 'nominal' }
                } as Track,
                'x'
            )
        ).toBe(false);
    });

    it('Visualization types should be detected correctly', () => {
        expect(
            getVisualizationType({
                mark: 'line'
            } as Track)
        ).toBe('line');
    });
});
