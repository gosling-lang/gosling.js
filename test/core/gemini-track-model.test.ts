import { GeminiTrackModel } from '../../src/core/gemini-track-model';
import { Track, IsChannelDeep, IsChannelValue } from '../../src/core/gemini.schema';
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
            row: { field: 'x', type: 'quantitative' }
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
            color: { field: 'color', type: 'nominal' },
            row: { field: 'row', type: 'nominal' },
            y: { field: 'y', type: 'quantitative' },
            text: { field: 'row', type: 'nominal' },
            size: { value: 1 },
            stroke: { value: 'white' },
            strokeWidth: { value: 0.5 },
            opacity: { value: 1 },
            height: 300
        };
        const model = new GeminiTrackModel(
            track,
            [
                { color: 1, row: 'a', y: 5 },
                { color: 2, row: 'b', y: 7 },
                { color: 3, row: 'a', y: 10 }
            ],
            false
        );
        const spec = model.spec();
        const colorDomain = IsChannelDeep(spec.color) ? (spec.color.domain as string[]) : [];
        const rowDomain = IsChannelDeep(spec.row) ? (spec.row.domain as string[]) : [];
        const yDomain = IsChannelDeep(spec.y) ? (spec.y.domain as number[]) : [];

        // domain
        expect(colorDomain).not.toBeUndefined();
        expect(colorDomain[0]).toBe(1);
        expect(colorDomain[1]).toBe(2);
        expect(colorDomain[2]).toBe(3);
        expect(rowDomain).not.toBeUndefined();
        expect(rowDomain).toHaveLength(2);
        expect(rowDomain[0]).toBe('a');
        expect(rowDomain[1]).toBe('b');
        expect(yDomain[0]).toBe(0); // zeroBaseline
        expect(yDomain[1]).toBe(10);

        // encoded value
        expect(model.encodedValue('y', 0)).toBe(0);
        expect(model.encodedValue('y', 10)).toBe(300 / 2.0); // there are two rows
        expect(model.encodedValue('size')).toBe(1);
        expect(model.encodedValue('size', 999)).toBe(1);
        expect(model.encodedValue('stroke', 999)).toBe('white');
        expect(model.encodedValue('text', 'a')).toBe('a');
    });
});

describe('Visual marks should be correctly encoded with data', () => {
    const data = [
        { q: 1, n: 'a', g: 11 },
        { q: 2, n: 'b', g: 12 },
        { q: 3, n: 'a', g: 13 }
    ];
    const qExtent = [1, 3];
    const nSize = 2;

    it('Point marks', () => {
        const size = { width: 100, height: 200 };
        const track: Track = {
            data: { type: 'tileset', url: 'dummy' },
            mark: 'point',
            x: { field: 'g', type: 'genomic' },
            row: { field: 'n', type: 'nominal' },
            size: { field: 'q', type: 'quantitative', range: [1, 3] },
            text: { field: 'n', type: 'nominal' },
            width: size.width,
            height: size.height
        };
        const model = new GeminiTrackModel(track, data);

        // y channel not encoded, hence middle of the height
        expect(model.encodedValue('y', 0)).toBe(size.height / 2.0 / nSize);
        expect(model.encodedValue('y', 3)).toBe(size.height / 2.0 / nSize);
        expect(model.encodedValue('y', 10)).toBe(size.height / 2.0 / nSize);

        // row is encoded with nominal values, so top position of each row
        expect(model.encodedValue('row', 'a')).toBe((size.height / nSize) * 0);
        expect(model.encodedValue('row', 'b')).toBe((size.height / nSize) * 1);
        expect(model.encodedValue('row', 'missing')).toBeUndefined();

        // size is encoded with quantitative values, so linear scale values without zero baseline
        expect(model.encodedValue('size', 1)).toBe(1);
        expect(model.encodedValue('size', 3)).toBe(3);
        expect(model.encodedValue('size', 4)).toBe(4);
        expect(model.encodedValue('size', 'missing')).toBeUndefined();

        // text just returns the value, currently
        expect(model.encodedValue('text', 'a')).toBe('a');
        expect(model.encodedValue('text', 'b')).toBe('b');
        expect(model.encodedValue('text', 'missing')).toBe('missing');

        const track2: Track = {
            data: { type: 'tileset', url: 'dummy' },
            mark: 'point',
            x: { field: 'g', type: 'genomic' },
            y: { field: 'q', type: 'quantitative', range: [0, size.height] },
            size: { field: 'n', type: 'nominal', range: [1, 3] },
            width: size.width,
            height: size.height
        };
        const model2 = new GeminiTrackModel(track2, data);

        // y is encoded with quantitative values, hence linear scale values with zero baseline
        expect(model2.encodedValue('y', 0)).toBe(0);
        expect(Math.floor(model2.encodedValue('y', 1))).toBe(Math.floor(size.height / 3));
        expect(Math.floor(model2.encodedValue('y', 2))).toBe(Math.floor((size.height / 3) * 2));
        expect(model2.encodedValue('y', qExtent[1])).toBe(size.height);

        // size is encoded with nominal values, hence ordinal scale values
        expect(model2.encodedValue('size', 'a')).toBe(1);
        expect(model2.encodedValue('size', 'b')).toBe(3);
        expect(model2.encodedValue('size', 'missing')).toBe(1);
    });
});
