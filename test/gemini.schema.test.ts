import {
    getValueUsingChannel,
    IsStackedMark,
    IsStackedChannel,
    getVisualizationType,
    IsChannelDeep,
    Channel,
    IsChannelValue,
    BasicSingleTrack
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
            IsStackedMark({
                mark: 'bar',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative' },
                color: { field: 'y', type: 'nominal' }
            } as BasicSingleTrack)
        ).toBe(true);

        expect(
            IsStackedMark({
                mark: 'area',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative' },
                color: { field: 'y', type: 'nominal' }
            } as BasicSingleTrack)
        ).toBe(true);
    });

    it('Spec for regular charts without stacking marks should be detected as using a non-stacked mark', () => {
        expect(
            IsStackedMark({
                mark: 'bar',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative' },
                color: { field: 'y', type: 'quantitative' }
            } as BasicSingleTrack)
        ).toBe(false);

        expect(
            IsStackedMark({
                mark: 'bar',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative' },
                color: { field: 'y', type: 'nominal' },
                row: { field: 'y', type: 'nominal' }
            } as BasicSingleTrack)
        ).toBe(false);

        expect(
            IsStackedMark({
                mark: 'line',
                x: { field: 'x', type: 'genomic' },
                y: { field: 'y', type: 'quantitative' },
                color: { field: 'y', type: 'nominal' }
            } as BasicSingleTrack)
        ).toBe(false);
    });

    it('Stacked channels should be detected correctly', () => {
        expect(
            IsStackedChannel(
                {
                    mark: 'bar',
                    x: { field: 'x', type: 'genomic' },
                    y: { field: 'y', type: 'quantitative' },
                    color: { field: 'y', type: 'nominal' }
                } as BasicSingleTrack,
                'y'
            )
        ).toBe(true);

        expect(
            IsStackedChannel(
                {
                    mark: 'bar',
                    x: { field: 'x', type: 'genomic' },
                    y: { field: 'y', type: 'quantitative' },
                    color: { field: 'y', type: 'nominal' }
                } as BasicSingleTrack,
                'x'
            )
        ).toBe(false);
    });

    it('Visualization types should be detected correctly', () => {
        expect(
            getVisualizationType({
                mark: 'line'
            } as BasicSingleTrack)
        ).toBe('line');
    });
});
