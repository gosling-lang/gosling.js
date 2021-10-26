import * as PIXI from 'pixi.js';
import { GoslingTrackModel } from '../gosling-track-model';
import { Channel, Mark } from '../gosling.schema';
import { getValueUsingChannel } from '../gosling.schema.guards';
import colorToHex from '../utils/color-to-hex';
import { cartesianToPolar } from '../utils/polar';

export function drawTriangle(g: PIXI.Graphics, model: GoslingTrackModel, trackWidth: number, trackHeight: number) {
    /* track spec */
    const spec = model.spec();

    if (!spec.width || !spec.height) {
        console.warn('Size of a track is not properly determined, so visual mark cannot be rendered');
        return;
    }

    /* data */
    const data = model.data();

    /* track size */
    const zoomLevel =
        (model.getChannelScale('x') as any).invert(trackWidth) - (model.getChannelScale('x') as any).invert(0);

    /* circular parameters */
    const circular = spec.layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220;
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    /* row separation */
    const rowCategories: string[] = (model.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    const yCategories: string[] = (model.getChannelDomainArray('y') as string[]) ?? ['___SINGLE_Y___'];
    const triHeight =
        model.encodedValue('size') ??
        (circular ? trackRingSize / rowCategories.length / yCategories.length : rowHeight / yCategories.length);

    /* render */
    rowCategories.forEach(rowCategory => {
        const rowPosition = model.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const x = model.encodedPIXIProperty('x', d);
            const xe = model.encodedPIXIProperty('xe', d);
            const markWidth = model.encodedPIXIProperty('size', d) ?? (xe === undefined ? triHeight : xe - x);

            const y = model.encodedPIXIProperty('y', d);
            const strokeWidth = model.encodedPIXIProperty('strokeWidth', d);
            const stroke = model.encodedPIXIProperty('stroke', d);
            const color = model.encodedPIXIProperty('color', d);
            const opacity = model.encodedPIXIProperty('opacity', d);

            if (circular) {
                let x0 = x ? x : xe - markWidth;
                let x1 = xe ? xe : x + markWidth;
                let xm = (x0 + x1) / 2.0;

                const rm = trackOuterRadius - ((rowPosition + rowHeight - y) / trackHeight) * trackRingSize;
                const r0 = rm - triHeight / 2.0;
                const r1 = rm + triHeight / 2.0;

                if (spec.style?.align === 'right' && !xe) {
                    x0 -= markWidth;
                    x1 -= markWidth;
                    xm -= markWidth;
                }

                let markToPoints: number[] = [];
                if (spec.mark === 'triangleLeft') {
                    const p0 = cartesianToPolar(x1, trackWidth, r0, cx, cy, startAngle, endAngle);
                    const p1 = cartesianToPolar(x0, trackWidth, rm, cx, cy, startAngle, endAngle);
                    const p2 = cartesianToPolar(x1, trackWidth, r1, cx, cy, startAngle, endAngle);
                    const p3 = cartesianToPolar(x1, trackWidth, r0, cx, cy, startAngle, endAngle);
                    markToPoints = [p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y];
                } else if (spec.mark === 'triangleRight') {
                    const p0 = cartesianToPolar(x0, trackWidth, r0, cx, cy, startAngle, endAngle);
                    const p1 = cartesianToPolar(x1, trackWidth, rm, cx, cy, startAngle, endAngle);
                    const p2 = cartesianToPolar(x0, trackWidth, r1, cx, cy, startAngle, endAngle);
                    const p3 = cartesianToPolar(x0, trackWidth, r0, cx, cy, startAngle, endAngle);
                    markToPoints = [p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y];
                } else if (spec.mark === 'triangleBottom') {
                    x0 = xm - markWidth / 2.0;
                    x1 = xm + markWidth / 2.0;
                    const p0 = cartesianToPolar(x0, trackWidth, r1, cx, cy, startAngle, endAngle);
                    const p1 = cartesianToPolar(x1, trackWidth, r1, cx, cy, startAngle, endAngle);
                    const p2 = cartesianToPolar(xm, trackWidth, r0, cx, cy, startAngle, endAngle);
                    const p3 = cartesianToPolar(x0, trackWidth, r1, cx, cy, startAngle, endAngle);
                    markToPoints = [p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y];
                }

                const alphaTransition = model.markVisibility(d, { width: x1 - x0, zoomLevel });
                const actualOpacity = Math.min(alphaTransition, opacity);

                // stroke
                g.lineStyle(
                    strokeWidth,
                    colorToHex(stroke),
                    // too narrow triangle's stroke is becoming too sharp
                    x1 - x0 > 2 ? actualOpacity : 0, // alpha
                    0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );

                g.beginFill(colorToHex(color), actualOpacity);
                g.drawPolygon(markToPoints);
                g.endFill();
            } else {
                let x0 = x ? x : xe - markWidth;
                let x1 = xe ? xe : x + markWidth;
                let xm = x0 + (x1 - x0) / 2.0;
                const ym = rowPosition + rowHeight - y;
                const y0 = rowPosition + rowHeight - y - triHeight / 2.0;
                const y1 = rowPosition + rowHeight - y + triHeight / 2.0;

                if (spec.style?.align === 'right' && !xe) {
                    x0 -= markWidth;
                    x1 -= markWidth;
                    xm -= markWidth;
                }

                const markToPoints: number[] = (
                    {
                        triangleLeft: [x1, y0, x0, ym, x1, y1, x1, y0],
                        triangleRight: [x0, y0, x1, ym, x0, y1, x0, y0],
                        triangleBottom: [x0, y0, x1, y0, xm, y1, x0, y0]
                    } as any
                )[spec.mark as Mark];

                const alphaTransition = model.markVisibility(d, { width: x1 - x0, zoomLevel });
                const actualOpacity = Math.min(alphaTransition, opacity);

                // stroke
                g.lineStyle(
                    strokeWidth,
                    colorToHex(stroke),
                    // too narrow triangle's stroke is becoming too sharp
                    x1 - x0 > 2 ? actualOpacity : 0, // alpha
                    0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );

                g.beginFill(colorToHex(color), actualOpacity);
                g.drawPolygon(markToPoints);
                g.endFill();
            }
        });
    });
}
