import { getMaxZoomLevel, logicalComparison } from './semantic-zoom';

describe('Should determine the zoom level correctly', () => {
    it('Default zoom level should be correct', () => {
        expect(getMaxZoomLevel()).toEqual(15);
    });
});

describe('Logical operation for semantic zooming should be correctly performed', () => {
    it('Basic logical operations', () => {
        expect(logicalComparison(1, 'GT', 1)).toEqual(0);
        expect(logicalComparison(1, 'GTET', 1)).toEqual(1);
        expect(logicalComparison(1, 'LT', 2)).toEqual(logicalComparison(1, 'less-than', 2));
    });

    it('Logical operations w/ transition padding', () => {
        expect(logicalComparison(1, 'LTET', 1, 10)).toEqual(0);
        expect(logicalComparison(1, 'LTET', 2, 10)).toEqual((2 - 1) / 10);
    });
});
