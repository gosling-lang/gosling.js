import { validateGoslingSpec } from './validate';
// @ts-ignore shouldn't import from editor. Perhaps move into own package.
import { EX_SPEC_CYTOBANDS } from '../../../../apps/editor/src/example/json-spec/ideograms';

describe('Validate Spec', () => {
    it('Example Specs', () => {
        expect(validateGoslingSpec(EX_SPEC_CYTOBANDS).state).toEqual('success');
        expect(validateGoslingSpec(delete (EX_SPEC_CYTOBANDS as any).views).state).not.toEqual('success');
    });
});
