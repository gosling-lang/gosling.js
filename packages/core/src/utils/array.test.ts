import { arrayRepeat, flatArrayToPairArray } from './array';

describe('Array Utils', () => {
    it('Repeat array', () => {
        expect(arrayRepeat([1], 2)?.[1]).toEqual(1);
        expect(arrayRepeat([1, 2, 3], 2)).toHaveLength(2);
        expect(arrayRepeat([1, 2], 5)?.[4]).toEqual(1);
    });

    it('Flat array to 2D array', () => {
        const _ = flatArrayToPairArray([1, 2, 3, 4]);
        expect(_.length).toEqual(2);
        expect(_[0].length).toEqual(2);
        expect(_[1].length).toEqual(2);
        expect(_[0][0]).toEqual(1);
        expect(_[1][1]).toEqual(4);
    });
});
