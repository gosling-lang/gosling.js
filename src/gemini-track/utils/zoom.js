import { max, sum, set } from 'd3';

export function getMaxZoomLevel() {
    // TODO: How to calculate maxZoomLevel?
    const TILE_SIZE = 256;
    const totalLength = 4795370;
    return Math.ceil(Math.log(totalLength / TILE_SIZE) / Math.log(2));
}

/**
 * Find max and min heights for the given tile
 *
 * @param matrix 2d array of numbers representing one tile
 */
export function findExtent(matrix) {
    // find max height of bars for scaling in the track
    const maxAndMin = {
        max: null,
        min: null
    };

    matrix.forEach(row => {
        // find total heights of each positive column and each negative column
        // and compare to highest value so far for the tile
        const localPositiveMax = row.filter(a => a >= 0).reduce((a, b) => a + b, 0);
        if (localPositiveMax > maxAndMin.max) {
            maxAndMin.max = localPositiveMax;
        }

        // When dealing with states data we have positive values including 0
        // maxAndMin.min should be 0 in this case
        let negativeValues = row.filter(a => a <= 0);

        if (negativeValues.length > 0) {
            negativeValues = negativeValues.map(a => Math.abs(a));
            const localNegativeMax = negativeValues.reduce((a, b) => a + b, 0); // check
            if (maxAndMin.min === null || localNegativeMax > maxAndMin.min) {
                maxAndMin.min = localNegativeMax;
            }
        }
    });

    return maxAndMin;
}

export function findExtentByTrackType(data, isStacked) {
    // TODO: do not consider negative values here yet
    if (isStacked) {
        const extent = {
            min: 0,
            max: null
        };

        const positions = Array.from(set(data.map(d => d['__G__']).values()));
        positions.forEach(pos => {
            const curMax = sum(data.filter(d => d['__G__'] === pos).map(d => d['__Q__']));
            if (extent.max < curMax) {
                extent.max = curMax;
            }
        });

        return extent;
    } else {
        return { min: 0, max: max(data.map(d => d['__Q__'])) };
    }
}
