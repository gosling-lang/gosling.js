import { cartesianToPolar, valueToRadian } from './polar';

describe('Calculate polar coordinates correctly', () => {
    it('Polar', () => {
        expect(valueToRadian(0, 100, 0, 360, 0)).toEqual(-Math.PI / 2.0);

        expect(cartesianToPolar(0, 100, 0, 0, 0, 0, 360)).toMatchObject({ x: 0, y: 0 });
    });
});
