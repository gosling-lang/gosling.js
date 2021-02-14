// @ts-ignore
import { JSONCrush, JSONUncrush } from './json-crush';
import stringify from 'json-stringify-pretty-compact';
import { ScalableCytoBand } from '../../editor/example-new/semantic-zoom';

describe('JSONCrush', () => {
    it('Should not loss information', () => {
        const specStr = stringify({ tracks: [{ ...ScalableCytoBand }] });
        expect(JSONUncrush(decodeURIComponent(JSONCrush(specStr)))).toEqual(specStr);
    });
});
