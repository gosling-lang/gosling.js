import { GeminiTrackModel } from '../../src/lib/gemini-track-model';
import { Track, IsChannelDeep } from '../../src/lib/gemini.schema';
import isEqual from 'lodash/isEqual';

describe('gemini track model should properly generate specs', () => {
    it('original spec should be the same', () => {
        const track: Track = {
            data: { url: '', type: 'tileset' },
            mark: 'bar'
        };
        const model = new GeminiTrackModel(track, [], false);
        expect(isEqual(model.originalSpec(), track)).toEqual(true);
    });

    it('default options should be added into the original spec', () => {
        const track: Track = {
            data: { url: '', type: 'tileset' },
            mark: 'bar',
            color: { field: 'f', type: 'quantitative' }
        };
        const model = new GeminiTrackModel(track, [], false);
        const spec = model.spec();
        const range = IsChannelDeep(spec.color) ? spec.color.range : [];
        expect(range).not.toBeUndefined();
        expect(range).toBe('viridis');
    });

    it('model should properly validate the original spec', () => {
        const track: Track = {
            data: { url: '', type: 'tileset' },
            mark: 'bar',
            color: { field: 'f', type: 'genomic' } // `genomic` type cannot be used for `color`
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
