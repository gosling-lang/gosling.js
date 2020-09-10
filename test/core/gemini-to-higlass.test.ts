import { compiler } from '../../src/core/gemini-to-higlass';
import { EXMAPLE_BASIC_MARKS } from '../../src/editor/example/basic-marks';

describe('Should convert gemini spec to higlass view config.', () => {
    it('Should return a generated higlass view config correctly', () => {
        const higlass = compiler(EXMAPLE_BASIC_MARKS.tracks[0], {
            width: 1000,
            height: 100,
            x: 10,
            y: 10
        });
        expect(Object.keys(higlass)).not.toHaveLength(0);
    });
    it('Should not generate a higlass view config when not supported', () => {
        const higlass = compiler(
            {
                // no spec
            },
            {
                width: 1000,
                height: 100,
                x: 10,
                y: 10
            }
        );
        expect(Object.keys(higlass)).toHaveLength(0);
    });
});
