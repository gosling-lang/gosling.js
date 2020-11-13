/**
 * Convert a value in a single-linear axis to a radian value. Anticlockwise, starts from 12 o'clock.
 * v span from zero to `max`.
 */
export function valueToRadian(v: number, max: number, sa: number, ea: number, g?: number) {
    const safeVal = Math.max(Math.min(max, v), 0);
    const gap = g ?? 0.04;
    const radExtent = ((ea - sa) / 360) * Math.PI * 2 - gap * 2;
    const radStart = (sa / 360) * Math.PI * 2;
    return -(radStart + (safeVal / max) * radExtent) - Math.PI / 2.0 - gap;
}

/**
 * Convert a position in a cartesian system to a polar coordinate.
 */
export function cartesianToPolar(x: number, max: number, r: number, cx: number, cy: number, sa: number, ea: number) {
    return {
        x: cx + r * Math.cos(valueToRadian(x, max, sa, ea)),
        y: cy + r * Math.sin(valueToRadian(x, max, sa, ea))
    };
}

export function positionToRadian(x: number, y: number, cx: number, cy: number) {
    if (cx <= x) {
        return Math.atan((y - cy) / (x - cx));
    } else {
        return Math.atan((y - cy) / (x - cx)) - Math.PI;
    }
}
