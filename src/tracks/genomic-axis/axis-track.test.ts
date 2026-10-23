import { AxisTrackClass } from './axis-track';

// d3-format 3.1.2 returns NaN from `precisionPrefix` for 0; the version pinned here (3.1.0) returns 6
vi.mock('d3-format', async importOriginal => {
    const original = await importOriginal<typeof import('d3-format')>();
    return {
        ...original,
        precisionPrefix: (step: number, value: number) => (step === 0 ? NaN : original.precisionPrefix(step, value))
    };
});

describe('AxisTrackClass.formatTick', () => {
    const formatTick = (pos: number, tickFormat: 'plain' | 'si') =>
        AxisTrackClass.prototype.formatTick.call(
            { _xScale: { domain: () => [0, 248956422] }, options: { tickFormat, tickPositions: 'ends' } } as never,
            pos
        );

    it('formats a tick at position 0 instead of throwing', () => {
        expect(formatTick(0, 'plain')).toBe('0');
        expect(formatTick(0, 'si')).toBe('0M');
    });

    it('formats other positions as before', () => {
        expect(formatTick(1234567, 'plain')).toBe('1,234,567');
        expect(formatTick(248956422, 'si')).toBe('249M');
    });
});
