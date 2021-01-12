import { isUndefined } from 'lodash';
import { GeminidTrackModel } from '../geminid-track-model';
import { cartesianToPolar, valueToRadian } from '../utils/polar';

export function drawBackground(HGC: any, trackInfo: any, tile: any, tm: GeminidTrackModel) {
    /* helper */
    const { colorToHex } = HGC.utils;

    // spec
    const spec = tm.spec();

    // layout
    const circular = spec.layout === 'circular';

    // size and position
    const [l, t] = trackInfo.position;
    const [w, h] = trackInfo.dimensions;

    // refer to https://github.com/higlass/higlass/blob/f82c0a4f7b2ab1c145091166b0457638934b15f3/app/scripts/PixiTrack.js#L129
    const g = trackInfo.pBackground;

    if (tm.spec().style?.background) {
        g.clear();

        const bg = tm.spec().style?.background;
        g.lineStyle(
            1,
            colorToHex('white'),
            0, // alpha
            0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        g.beginFill(colorToHex(bg), 1);

        if (circular) {
            if (
                isUndefined(spec.innerRadius) ||
                isUndefined(spec.outerRadius) ||
                isUndefined(spec.startAngle) ||
                isUndefined(spec.endAngle)
            ) {
                // We do not have enough information to draw background
                return;
            }

            const trackInnerRadius = spec.innerRadius;
            const trackOuterRadius = spec.outerRadius;
            const startAngle = spec.startAngle;
            const endAngle = spec.endAngle;
            const cx = w / 2.0 + l;
            const cy = h / 2.0 + t;

            const posStartInner = cartesianToPolar(0, w, trackInnerRadius, cx, cy, startAngle, endAngle);
            const startRad = valueToRadian(0, w, startAngle, endAngle);
            const endRad = valueToRadian(w, w, startAngle, endAngle);

            g.moveTo(posStartInner.x, posStartInner.y);
            g.arc(cx, cy, trackInnerRadius, startRad, endRad, true);
            g.arc(cx, cy, trackOuterRadius, endRad, startRad, false);
            g.closePath();
        } else {
            g.drawRect(l, t, w, h);
        }
    }
}
