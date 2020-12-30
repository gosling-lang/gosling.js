import { GeminidTrackModel } from '../geminid-track-model';
import { Channel } from '../geminid.schema';
import { IsChannelDeep, getValueUsingChannel } from '../geminid.schema.guards';
import { cartesianToPolar, positionToRadian } from '../utils/polar';

export function drawLink(HGC: any, trackInfo: any, tile: any, tm: GeminidTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = tm.data();

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

    /* genomic scale */
    const xScale = trackInfo._xScale;

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* render */
    const g = tile.graphics;

    // TODO: Can row be actually used for circular layouts?
    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            // TODO: support y1, y1e
            const xValue = getValueUsingChannel(d, spec.x as Channel) as number;
            const xeValue = getValueUsingChannel(d, spec.xe as Channel) as number;
            const x1Value = getValueUsingChannel(d, spec.x1 as Channel) as number;
            const x1eValue = getValueUsingChannel(d, spec.x1e as Channel) as number;

            const stroke = tm.encodedPIXIProperty('stroke', d);
            const color = tm.encodedPIXIProperty('color', d);
            const opacity = tm.encodedPIXIProperty('opacity', d);

            let x = xScale(xValue);
            let xe = xScale(xeValue);
            let x1 = xScale(x1Value);
            let x1e = xScale(x1eValue);

            // stroke
            g.lineStyle(
                tm.encodedValue('strokeWidth'),
                colorToHex(stroke),
                opacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            const flipY = IsChannelDeep(spec.y) && spec.y.flip;
            const baseY = rowPosition + (flipY ? 0 : rowHeight);

            if (x1Value !== undefined && x1eValue !== undefined && xValue !== x1Value && xeValue !== x1eValue) {
                // This means we need to draw 'band' connections
                // TODO: Better way to simply this line (i.e., 'none' for 0 opacity)?
                g.beginFill(color === 'none' ? 'white' : colorToHex(color), color === 'none' ? 0 : opacity);

                // Sort values to safely draw bands
                [x, xe, x1, x1e] = [x, xe, x1, x1e].sort((a, b) => a - b);

                if (x > trackWidth || x1e < 0 || Math.abs(x1e - x) < 0.5) {
                    // Do not draw very small visual marks
                    return;
                }

                if (circular) {
                    if (x < 0 || x1e > trackWidth) {
                        // Do not show bands that are partly outside of the current domain
                        return;
                    }

                    const r = trackOuterRadius - (rowPosition / trackHeight) * trackRingSize;
                    const posX = cartesianToPolar(x, trackWidth, r, tcx, tcy, startAngle, endAngle);
                    const posXE = cartesianToPolar(xe, trackWidth, r, tcx, tcy, startAngle, endAngle);
                    const posX1 = cartesianToPolar(x1, trackWidth, r, tcx, tcy, startAngle, endAngle);
                    const posX1E = cartesianToPolar(x1e, trackWidth, r, tcx, tcy, startAngle, endAngle);

                    g.moveTo(posX.x, posX.y);

                    // outer curve
                    g.bezierCurveTo(posX.x, posX.y, tcx, tcy, posX1E.x, posX1E.y);

                    g.arc(
                        tcx,
                        tcy,
                        trackOuterRadius,
                        positionToRadian(posX1E.x, posX1E.y, tcx, tcy),
                        positionToRadian(posX1.x, posX1.y, tcx, tcy),
                        false
                    );

                    // inner curve
                    g.bezierCurveTo(
                        posX1.x,
                        posX1.y,
                        // this control point should be closer towards the axis and more far from the center
                        tcx,
                        tcy,
                        posXE.x,
                        posXE.y
                    );

                    g.arc(
                        tcx,
                        tcy,
                        trackOuterRadius,
                        positionToRadian(posXE.x, posXE.y, tcx, tcy),
                        positionToRadian(posX.x, posX.y, tcx, tcy),
                        false
                    );
                    g.endFill();
                } else {
                    // Linear mark
                    g.moveTo(x, baseY);

                    if (spec.style?.circularLink) {
                        g.arc((x + x1e) / 2.0, baseY, (x1e - x) / 2.0, -Math.PI, 0, false);
                        // g.lineTo(xe, botY);
                        g.arc((xe + x1) / 2.0, baseY, (x1 - xe) / 2.0, 0, -Math.PI, true);
                        // g.lineTo(x, botY);
                        g.closePath();
                    } else {
                        g.lineTo(x1, rowPosition + rowHeight);
                        g.bezierCurveTo(
                            x1 + (xe - x1) / 3.0,
                            // rowPosition + (x1 - x),
                            rowPosition + rowHeight - (xe - x1) / 2.0, //Math.min(rowHeight - (x1 - x), (xe - x1) / 2.0),
                            x1 + ((xe - x1) / 3.0) * 2,
                            // rowPosition + (x1 - x),
                            rowPosition + rowHeight - (xe - x1) / 2.0, //Math.min(rowHeight - (x1 - x), (xe - x1) / 2.0),
                            xe,
                            rowPosition + rowHeight
                        );
                        g.lineTo(x1e, rowPosition + rowHeight);
                        g.bezierCurveTo(
                            x + ((x1e - x) / 3.0) * 2,
                            // rowPosition,
                            rowPosition + rowHeight - (x1e - x) / 2.0, //Math.min(rowHeight, (x1e - x) / 2.0),
                            x + (x1e - x) / 3.0,
                            // rowPosition,
                            rowPosition + rowHeight - (x1e - x) / 2.0, //Math.min(rowHeight, (x1e - x) / 2.0),
                            x,
                            rowPosition + rowHeight
                        );
                        g.endFill();
                    }
                }
            } else {
                // This means we need to draw 'line' connections
                if (xe - x <= 0.1) {
                    // Do not draw very small links
                    return;
                }

                const midX = (x + xe) / 2.0;

                if (circular) {
                    if (x < 0 || xe > trackWidth) {
                        // Do not show bands that are partly outside of the current domain
                        return;
                    }

                    const r = trackOuterRadius - (rowPosition / trackHeight) * trackRingSize;
                    const posS = cartesianToPolar(x, trackWidth, r, tcx, tcy, startAngle, endAngle);
                    const posE = cartesianToPolar(xe, trackWidth, r, tcx, tcy, startAngle, endAngle);

                    g.moveTo(posS.x, posS.y);
                    g.bezierCurveTo(posS.x, posS.y, trackWidth / 2.0, trackHeight / 2.0, posE.x, posE.y);

                    // straight line
                    // g.moveTo(posS.x, posS.y);
                    // g.lineTo(posE.x, posE.y);
                } else {
                    g.moveTo(x, baseY);

                    if (spec.style?.circularLink) {
                        if (xe < 0 || x > trackWidth) {
                            return;
                        }
                        // TODO: Better way to simply this line (i.e., 'none' for 0 opacity)?
                        g.beginFill(color === 'none' ? 'white' : colorToHex(color), color === 'none' ? 0 : opacity);
                        g.arc(midX, baseY, (xe - x) / 2.0, -Math.PI, Math.PI);
                        g.closePath();
                    } else {
                        g.bezierCurveTo(
                            x + (xe - x) / 3.0,
                            // rowPosition,
                            baseY + Math.min(rowHeight, (xe - x) / 2.0) * (flipY ? 1 : -1),
                            x + ((xe - x) / 3.0) * 2,
                            // rowPosition,
                            baseY + Math.min(rowHeight, (xe - x) / 2.0) * (flipY ? 1 : -1),
                            xe,
                            baseY
                        );
                    }
                }
            }
        });
    });
}
