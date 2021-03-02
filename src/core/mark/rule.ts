import { GoslingTrackModel } from '../gosling-track-model';
import { Channel } from '../gosling.schema';
import { getValueUsingChannel } from '../gosling.schema.guards';
import { cartesianToPolar, valueToRadian } from '../utils/polar';
import colorToHex from '../utils/color-to-hex';

export function drawRule(HGC: any, trackInfo: any, tile: any, tm: GoslingTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* data */
    const data = tm.data();

    /* track size */
    const [trackWidth, trackHeight] = trackInfo.dimensions;

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
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* style */
    const dashed = spec.style?.dashed;
    const linePattern = spec.style?.linePattern;
    const curved = spec.style?.curve;

    /* render */
    rowCategories.forEach(rowCategory => {
        // we are separately drawing each row so that y scale can be more effectively shared across tiles without rerendering from the bottom
        const rowGraphics = tile.graphics;
        const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const x = tm.encodedPIXIProperty('x', d);
            const xe = tm.encodedPIXIProperty('xe', d);
            const y = tm.encodedPIXIProperty('y', d); // y middle position
            const color = tm.encodedPIXIProperty('color', d);
            const strokeWidth = tm.encodedPIXIProperty('strokeWidth', d);
            const opacity = tm.encodedPIXIProperty('opacity', d);

            rowGraphics.lineStyle(
                strokeWidth,
                colorToHex(color),
                opacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            if (circular) {
                // !!! Currently, we only support simple straight lines for circular layouts.
                if (strokeWidth === 0) {
                    // Do not render invisible elements.
                    return;
                }

                // Actually, we are drawing arcs instead of lines, so lets remove stroke.
                rowGraphics.lineStyle(
                    strokeWidth,
                    colorToHex(color),
                    0, // alpha
                    0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );

                const midR = trackOuterRadius - ((rowPosition + y) / trackHeight) * trackRingSize;
                const farR = midR + strokeWidth / 2.0;
                const nearR = midR - strokeWidth + 2.0;

                const sPos = cartesianToPolar(x, trackWidth, nearR, cx, cy, startAngle, endAngle);
                const startRad = valueToRadian(x, trackWidth, startAngle, endAngle);
                const endRad = valueToRadian(xe, trackWidth, startAngle, endAngle);

                rowGraphics.beginFill(colorToHex(color), opacity);
                rowGraphics.moveTo(sPos.x, sPos.y);
                rowGraphics.arc(cx, cy, nearR, startRad, endRad, true);
                rowGraphics.arc(cx, cy, farR, endRad, startRad, false);
                rowGraphics.closePath();
            } else if (dashed) {
                const [dashSize, gapSize] = dashed;
                let curPos = x;

                do {
                    rowGraphics.moveTo(curPos, rowPosition + rowHeight - y);
                    rowGraphics.lineTo(curPos + dashSize, rowPosition + rowHeight - y);
                    curPos += dashSize + gapSize;
                } while (curPos < xe);
            } else {
                /* regular horizontal lines */
                if (curved === undefined) {
                    rowGraphics.moveTo(x, rowPosition + rowHeight - y);
                    rowGraphics.lineTo(xe, rowPosition + rowHeight - y);
                } else if (curved === 'top') {
                    // TODO: to default value
                    const CURVE_HEIGHT = 2;
                    ///

                    const xm = x + (xe - x) / 2.0;

                    rowGraphics.moveTo(x, rowPosition + rowHeight - y + CURVE_HEIGHT / 2.0);
                    rowGraphics.lineTo(xm, rowPosition + rowHeight - y - CURVE_HEIGHT / 2.0);
                    rowGraphics.moveTo(xm, rowPosition + rowHeight - y - CURVE_HEIGHT / 2.0);
                    rowGraphics.lineTo(xe, rowPosition + rowHeight - y + CURVE_HEIGHT / 2.0);
                }
            }

            if (linePattern && curved === undefined && !circular) {
                const { type: pType, size: pSize } = linePattern;
                let curPos = Math.max(x, 0); // saftly start from visible position

                rowGraphics.lineStyle(0);

                // TODO: to default value
                const PATTERN_GAP_SIZE = pSize * 2;
                ///

                let count = 0;
                do {
                    const x0 = curPos;
                    const x1 = curPos + pSize;
                    const ym = rowPosition + rowHeight - y;
                    const y0 = ym - pSize / 2.0;
                    const y1 = ym + pSize / 2.0;

                    rowGraphics.beginFill(colorToHex(color), opacity);
                    rowGraphics.drawPolygon(
                        pType === 'triangleLeft' ? [x1, y0, x0, ym, x1, y1, x1, y0] : [x0, y0, x1, ym, x0, y1, x0, y0]
                    );
                    rowGraphics.endFill();
                    curPos += pSize + PATTERN_GAP_SIZE;

                    count++;

                    // saftly end before the visible position
                } while (curPos < Math.min(xe, trackWidth) && count < 100);
            }
        });
    });
}
