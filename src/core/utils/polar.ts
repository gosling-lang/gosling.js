/**
 * Convert a value in a single-linear axis to a radian value. Anticlockwise, starts from 12 o'clock.
 * v span from zero to `max`.
 */
export function valueToRadian(v: number, max: number) {
    const safeV = Math.max(Math.min(max, v), 0);
    const gap = 0.04;
    return (-safeV / max) * (Math.PI * 2 - gap * 2) - Math.PI / 2.0 - gap;
}

/**
 * Convert a position in a cartesian system to a polar coordinate.
 */
export function cartesianToPolar(x: number, max: number, r: number, cx: number, cy: number) {
    return {
        x: cx + r * Math.cos(valueToRadian(x, max)),
        y: cy + r * Math.sin(valueToRadian(x, max))
    };
}
