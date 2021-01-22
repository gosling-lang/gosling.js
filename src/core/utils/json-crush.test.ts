// @ts-ignore
import { JSONCrush, JSONUncrush } from './json-crush';
import { EXAMPLE_CYTOAND_HG38 } from '../../editor/example/cytoband-hg38';
import stringify from 'json-stringify-pretty-compact';

describe('JSONCrush', () => {
    it('Should not loss information', () => {
        const specStr = stringify(EXAMPLE_CYTOAND_HG38);
        expect(JSONUncrush(decodeURIComponent(JSONCrush(specStr)))).toEqual(specStr);
    });
});
