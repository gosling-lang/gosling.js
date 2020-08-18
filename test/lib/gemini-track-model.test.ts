import { GeminiTrackModel } from '../../src/lib/gemini-track-model';
import { Track, IsChannelDeep } from '../../src/lib/gemini.schema';
import isEqual from 'lodash/isEqual';

describe('gemini track model should properly generate specs', () => {
    it('original spec should be the same', () => {
        const track: Track = {
            data: { url: '', type: 'tileset' },
            mark: 'bar'
        };
        const model = new GeminiTrackModel(track);
        expect(isEqual(model.originalSpec(), track)).toEqual(true);
    });

    it('Default options should be added into the original spec', () => {
        const track: Track = {
            data: { url: '', type: 'tileset' },
            mark: 'bar',
            color: { field: 'f' }
        };
        const model = new GeminiTrackModel(track);
        const spec = model.spec();
        const range = IsChannelDeep(spec.color) ? spec.color.range : [];
        expect(range?.length).not.toBe(0);
    });
});
