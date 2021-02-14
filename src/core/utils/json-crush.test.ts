// @ts-ignore
import { JSONCrush, JSONUncrush } from './json-crush';
import stringify from 'json-stringify-pretty-compact';
import { EXAMPLE_TRACK_SEMANTIC_ZOOM } from '../../editor/example-new/semantic-zoom';

describe('JSONCrush', () => {
    it('Should not loss information', () => {
        const specStr = stringify({ tracks: [{ ...EXAMPLE_TRACK_SEMANTIC_ZOOM.cytoband }] });
        expect(JSONUncrush(decodeURIComponent(JSONCrush(specStr)))).toEqual(specStr);
    });
});
