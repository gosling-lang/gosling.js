/**
 * @param {Array} point Tuple of the form `[x,y]` to be tested.
 * @param {Array} point2 Tuple of the form `[x,y]` to be tested.
 * @param {number} radius A radius of the second point.
 * @returns {boolean} If `true` point lies within the point.
 */
export const isPointNearPoint: (point: [number, number], point2: number[], radius?: number) => boolean = (
    [x1, y1],
    [x2, y2],
    radius = 5
) => {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) < radius;
};

/**
 * @param {Array} range Tuple of the form `[x1,x2]` to be tested.
 * @param {Array} point A value x to be tested.
 * @returns {boolean} If `true` point lies within the point.
 */
export const isPointInsideRange: (range: [number, number], x: number) => boolean = ([x1, x2], x) => {
    return x1 <= x && x <= x2;
};

/**
 * @param {Array} range Tuple of the form `[x1,x2]` to be tested.
 * @param {Array} x A value x to be tested.
 * @param {number} radius A radius of the point.
 * @returns {boolean} If `true` point lies within the point.
 */
export const isCircleWithinRange: (range: [number, number], x: number, radius?: number) => boolean = (
    range,
    x,
    radius = 5
) => {
    return isPointInsideRange(range, x - radius) && isPointInsideRange(range, x + radius);
};

/**
 * @param {Array} point Tuple of the form `[x1,x2]` to be tested.
 * @param {Array} path 1D list of vertices defining the line segments.
 * @return {boolean} If `true` point lies within the polygon.
 */
export const isAnyPointsWithinRange: (range: [number, number], path: number[]) => boolean = ([x1, x2], path) => {
    let lx;
    let isWithin = true;
    for (let i = 0; i < path.length; i += 2) {
        lx = path[i];
        isWithin = isWithin && isPointInsideRange([x1, x2], lx);
    }
    return isWithin;
};

/**
 * From: https://www.geeksforgeeks.org/minimum-distance-from-a-point-to-the-line-segment-using-vectors/
 * @param {Array} point Tuple of the form `[x,y]` to be tested.
 * @param {Array} path 1D list of vertices defining the line segments.
 * @param {number} dist A threshold distance for test.
 * @return {boolean} If `true` point lies within the polygon.
 */
export const isPointNearLine: (point: [number, number], path: number[], dist?: number) => boolean = (
    [x, y],
    path,
    dist = 5
) => {
    let x1;
    let y1;
    let x2;
    let y2;
    let isWithin = false;
    for (let i = 0; i < path.length - 2; i += 2) {
        x1 = path[i];
        y1 = path[i + 1];
        x2 = path[i + 2];
        y2 = path[i + 3];

        const AB = [x2 - x1, y2 - y1];
        const BE = [x - x2, y - y2];
        const AE = [x - x1, y - y1];

        // Variables to store dot product
        const AB_BE = AB[0] * BE[0] + AB[1] * BE[1];
        const AB_AE = AB[0] * AE[0] + AB[1] * AE[1];

        let actDist = 0;
        if (AB_BE > 0) {
            actDist = Math.sqrt((y - y2) ** 2 + (x - x2) ** 2);
        } else if (AB_AE < 0) {
            actDist = Math.sqrt((y - y1) ** 2 + (x - x1) ** 2);
        } else {
            actDist = Math.abs(AB[0] * AE[1] - AB[1] * AE[0]) / Math.sqrt(AB[0] ** 2 + AB[1] ** 2);
        }
        if (actDist < dist) {
            isWithin = true;
        }
    }
    return isWithin;
};

/**
 * Adopted from
 * https://github.com/flekschas/utils
 * https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
 * @param {Array} point Tuple of the form `[x,y]` to be tested.
 * @param {Array} polygon 1D list of vertices defining the polygon.
 * @return {boolean} If `true` point lies within the polygon.
 */
export const isPointInPolygon: (point: [number, number], polygon: number[]) => boolean = ([x, y], polygon) => {
    let x1;
    let y1;
    let x2;
    let y2;
    let isWithin = false;
    for (let i = 0, j = polygon.length - 2; i < polygon.length; i += 2) {
        x1 = polygon[i];
        y1 = polygon[i + 1];
        x2 = polygon[j];
        y2 = polygon[j + 1];
        if (y1 > y !== y2 > y && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) {
            isWithin = !isWithin;
        }
        j = i;
    }
    return isWithin;
};
