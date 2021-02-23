// @ts-ignore
import { JSONCrush, JSONUncrush } from './json-crush';
import stringify from 'json-stringify-pretty-compact';
import { EX_TRACK_SEMANTIC_ZOOM } from '../../editor/example/semantic-zoom';

describe('JSONCrush', () => {
    it('Should not loss information', () => {
        const specStr = stringify({ tracks: [{ ...EX_TRACK_SEMANTIC_ZOOM.cytoband }] });
        expect(JSONUncrush(decodeURIComponent(JSONCrush(specStr)))).toEqual(specStr);
    });
});
