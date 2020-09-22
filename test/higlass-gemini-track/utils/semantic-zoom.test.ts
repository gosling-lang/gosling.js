import {
    getMaxZoomLevel,
    isSemanticZoomTriggered,
    logicalComparison
} from '../../../src/higlass-gemini-track/utils/semantic-zoom';

describe('Should determine the zoom level correctly', () => {
    it('Default zoom level should be correct', () => {
        expect(getMaxZoomLevel()).toEqual(15);
    });
});

describe('Logical operation for semantic zooming should be correctly performed', () => {
    it('Basic logical operations', () => {
        expect(logicalComparison(1, 'GT', 1)).toEqual(0);
        expect(logicalComparison(1, 'GTET', 1)).toEqual(0);
        expect(logicalComparison(1, 'LT', 2)).toEqual(logicalComparison(1, 'less-than', 2));
    });

    it('Logical operations w/ transition padding', () => {
        expect(logicalComparison(1, 'LTET', 1, 10)).toEqual(0);
        expect(logicalComparison(1, 'LTET', 2, 10)).toEqual((2 - 1) / 10);
    });
});

describe('Should correctly determin whether to trigger semantic zooming or not', () => {
    it('No semantic zooming spec', () => {
        expect(isSemanticZoomTriggered({}, 0)).toEqual(false);
    });

    it('Logical operation with zoom levels', () => {
        expect(
            isSemanticZoomTriggered(
                {
                    superpose: [],
                    semanticZoom: {
                        type: 'alternative-encoding',
                        spec: {},
                        trigger: {
                            target: 'track',
                            condition: { zoomLevel: 10 },
                            operation: 'greater-than'
                        }
                    }
                },
                10
            )
        ).toEqual(false);
        expect(
            isSemanticZoomTriggered(
                {
                    superpose: [],
                    semanticZoom: {
                        type: 'alternative-encoding',
                        spec: {},
                        trigger: {
                            target: 'track',
                            condition: { zoomLevel: 10 },
                            operation: 'greater-than-or-equal-to'
                        }
                    }
                },
                10
            )
        ).toEqual(true);
    });
});
