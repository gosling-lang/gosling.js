import { GeminiTrackModel } from '../../src/lib/gemini-track-model';
import { Track, IsChannelDeep, IsChannelValue } from '../../src/lib/gemini.schema';
import isEqual from 'lodash/isEqual';

const MINIMAL_TRACK_SPEC: Track = {
    data: { url: '', type: 'tileset' },
    mark: 'bar',
    x: { field: 'x', type: 'genomic' }
};

describe('gemini track model should properly validate the original spec', () => {
    it('minimal spec with on genomic coordiate should be valid', () => {
        const model = new GeminiTrackModel(MINIMAL_TRACK_SPEC, [], false);
        expect(model.validateSpec().valid).toBe(true);
    });

    it('row cannot be encoded with quantitative field', () => {
        const track: Track = {
            ...MINIMAL_TRACK_SPEC,
            row: { field: 'x', type: 'nominal' }
        };
        const model = new GeminiTrackModel(track, [], false);
        expect(model.validateSpec().valid).toBe(false);
    });

    it('genomic coordinate should be present in the spec', () => {
        const track: Track = {
            data: { url: '', type: 'tileset' },
            mark: 'bar'
        };
        const model = new GeminiTrackModel(track, [], false);
        expect(model.validateSpec().valid).toBe(false);

        const model2 = new GeminiTrackModel({ ...track, x: { field: 'x', type: 'genomic' } }, [], false);
        expect(model2.validateSpec().valid).toBe(true);
    });

    it('genomic coordinate cannot be encoded with a color channel', () => {
        const track: Track = {
            ...MINIMAL_TRACK_SPEC,
            color: { field: 'f', type: 'genomic' }
        };
        const model = new GeminiTrackModel(track, [], false);
        expect(model.validateSpec().valid).toBe(false);

        if (IsChannelDeep(track.color)) {
            track.color.type = 'nominal';
        }
        const model2 = new GeminiTrackModel(track, [], false);
        expect(model2.validateSpec().valid).toBe(true);
    });
});

describe('default options should be added into the original spec', () => {
    it('original spec should be the same after making a gemini model', () => {
        const model = new GeminiTrackModel(MINIMAL_TRACK_SPEC, [], false);
        expect(isEqual(model.originalSpec(), MINIMAL_TRACK_SPEC)).toEqual(true);
    });

    it('default opacity should be added if it is missing in the spec', () => {
        const model = new GeminiTrackModel(MINIMAL_TRACK_SPEC, [], false);
        const spec = model.spec();
        expect(spec.opacity).not.toBeUndefined();
        expect(IsChannelValue(spec.opacity) ? spec.opacity.value : undefined).toBe(1);
    });

    it('default color scheme for quantitative data field should be added if range is not specified', () => {
        const track: Track = {
            ...MINIMAL_TRACK_SPEC,
            color: { field: 'f', type: 'quantitative' }
        };
        const model = new GeminiTrackModel(track, [], false);
        const spec = model.spec();
        const range = IsChannelDeep(spec.color) ? spec.color.range : [];
        expect(range).not.toBeUndefined();
        expect(range).toBe('viridis');
    });
});

describe('Gemini track model should be properly generated with data', () => {
    it('Default values, such as domain, should be correctly generated based on the data', () => {
        const track: Track = {
            ...MINIMAL_TRACK_SPEC,
            color: { field: 'color', type: 'quantitative' },
            row: { field: 'row', type: 'nominal' }
        };
        const model = new GeminiTrackModel(
            track,
            [
                { color: 1, row: 'a' },
                { color: 2, row: 'b' },
                { color: 3, row: 'a' }
            ],
            false
        );
        const spec = model.spec();
        const colorDomain = IsChannelDeep(spec.color) ? (spec.color.domain as string[]) : [];
        const rowDomain = IsChannelDeep(spec.row) ? (spec.row.domain as string[]) : [];
        expect(colorDomain).not.toBeUndefined();
        expect(colorDomain[0]).toBe(0);
        expect(colorDomain[1]).toBe(3);
        expect(rowDomain).not.toBeUndefined();
        expect(rowDomain).toHaveLength(2);
        expect(rowDomain[0]).toBe('a');
        expect(rowDomain[1]).toBe('b');
    });
});
