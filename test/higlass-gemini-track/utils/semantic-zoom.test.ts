import { getMaxZoomLevel } from '../../../src/higlass-gemini-track/utils/semantic-zoom';

describe('Should determine the zoom level correctly', () => {
    it('Default zoom level should be correct', () => {
        expect(getMaxZoomLevel()).toEqual(15);
    });
});
