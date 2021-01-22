import { goslingToHiGlass } from './gosling-to-higlass';
import { BasicSingleTrack } from './gosling.schema';
import { HiGlassModel } from './higlass-model';
import { EXMAPLE_BASIC_MARKS } from '../editor/example/basic/basic-marks';

describe('Should convert gosling spec to higlass view config.', () => {
    it('Should return a generated higlass view config correctly', () => {
        const model = new HiGlassModel();
        const higlass = goslingToHiGlass(
            model,
            EXMAPLE_BASIC_MARKS.tracks[0],
            {
                width: 1000,
                height: 100,
                x: 10,
                y: 10
            },
            {
                x: 0,
                y: 0,
                w: 12,
                h: 12
            }
        ).spec();
        expect(Object.keys(higlass)).not.toHaveLength(0);
    });
    it('Should not generate a higlass view config when not supported', () => {
        const model = new HiGlassModel();
        const higlass = goslingToHiGlass(
            model,
            {
                // no spec
            } as BasicSingleTrack,
            {
                width: 1000,
                height: 100,
                x: 10,
                y: 10
            },
            {
                x: 0,
                y: 0,
                w: 12,
                h: 12
            }
        ).spec();
        expect(higlass.views).toHaveLength(0);
    });
});
