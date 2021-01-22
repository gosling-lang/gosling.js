import { arrayRepeat } from './array';

describe('Repeat elements in an array correctly', () => {
    it('Repeat array', () => {
        expect(arrayRepeat([1], 2)?.[1]).toEqual(1);
        expect(arrayRepeat([1, 2, 3], 2)).toHaveLength(2);
        expect(arrayRepeat([1, 2], 5)?.[4]).toEqual(1);
    });
});
