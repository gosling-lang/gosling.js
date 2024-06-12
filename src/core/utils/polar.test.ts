import { cartesianToPolar, pointsToDegree, valueToRadian } from './polar';

describe('Calculate polar coordinates correctly', () => {
    it('Polar', () => {
        expect(valueToRadian(0, 100, 0, 360)).toEqual(-Math.PI / 2.0);

        expect(cartesianToPolar(0, 100, 0, 0, 0, 0, 360)).toMatchObject({ x: 0, y: 0 });
    });

    it('Two Points --> Degree', () => {
        // origin
        expect(pointsToDegree(0, -10, 0, 0)).toEqual(0);

        // degrees in the middle
        expect(pointsToDegree(-10, 0, 0, 0)).toEqual(90);
        expect(pointsToDegree(-10, 10, 0, 0)).toEqual(135);
        expect(pointsToDegree(0, 10, 0, 0)).toEqual(180);
        expect(pointsToDegree(10, 10, 0, 0)).toEqual(225);
        expect(pointsToDegree(10, 0, 0, 0)).toEqual(270);
        expect(pointsToDegree(10, -10, 0, 0)).toEqual(315);

        // edge case (two same points)
        expect(pointsToDegree(0, 0, 0, 0)).toEqual(270);
    });
});
