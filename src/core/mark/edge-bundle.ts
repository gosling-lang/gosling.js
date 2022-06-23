import type * as PIXI from 'pixi.js';
import type { GoslingTrackModel } from '../gosling-track-model';
import { cartesianToPolar } from '../utils/polar';
import colorToHex from '../utils/color-to-hex';

export function drawEdgeBundling(g: PIXI.Graphics, trackInfo: any, model: GoslingTrackModel) {
    /* track spec */
    const spec = model.spec();

    if (!spec.width || !spec.height) {
        console.warn('Size of a track is not properly determined, so visual mark cannot be rendered');
        return;
    }

    /* data */
    const data = model.data();

    /* track size */
    const [trackWidth, trackHeight] = trackInfo.dimensions;

    /* circular parameters */
    const circular = spec.layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220;
    const trackOuterRadius = spec.outerRadius ?? 300;
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const tcx = trackWidth / 2.0;
    const tcy = trackHeight / 2.0;

    /* render */
    data.forEach(d => {
        const x = model.encodedPIXIProperty('x', d);
        const xe = model.encodedPIXIProperty('xe', d);
        const stroke = model.encodedPIXIProperty('stroke', d);
        const strokeWidth = model.encodedPIXIProperty('strokeWidth', d);
        const opacity = model.encodedPIXIProperty('opacity', d);

        // TODO: We can first ignore `x1` and `x1e`
        // let x1 = model.encodedPIXIProperty('x1', d);
        // let x1e = model.encodedPIXIProperty('x1e', d);

        // TODO: Unsure at the moment if we need these.
        // const y = model.encodedPIXIProperty('y', d);
        // const color = model.encodedPIXIProperty('color', d);

        // stroke
        g.lineStyle(
            strokeWidth,
            colorToHex(stroke),
            opacity, // alpha
            0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );

        if (circular) {
            // TODO: Need to change this. The below code draw `straight` style links in circular layouts.
            const r = trackOuterRadius - trackRingSize / trackHeight;
            const posS = cartesianToPolar(x, trackWidth, r, tcx, tcy, startAngle, endAngle);
            const posE = cartesianToPolar(xe, trackWidth, r, tcx, tcy, startAngle, endAngle);

            const x1 = posS.x;
            const y1 = posS.y;
            const x4 = posE.x;
            const y4 = posE.y;

            g.moveTo(x1, y1);
            g.lineTo(x4, y4);
        } else {
            // TODO: Need to change this. The below code draw `circular` style links in linear layouts.
            const midX = (x + xe) / 2.0;
            g.beginFill(colorToHex('white'), 0);
            g.arc(midX, 0, (xe - x) / 2.0, -Math.PI, Math.PI);
            g.closePath();
        }
    });
}
