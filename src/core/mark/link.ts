import { GoslingTrackModel } from '../gosling-track-model';
import { Channel } from '../gosling.schema';
import { IsChannelDeep, getValueUsingChannel } from '../gosling.schema.guards';
import { cartesianToPolar, positionToRadian } from '../utils/polar';
import colorToHex from '../utils/color-to-hex';

export function drawLink(g: PIXI.Graphics, model: GoslingTrackModel) {
    /* track spec */
    const spec = model.spec();

    if (!spec.width || !spec.height) {
        console.warn('Size of a track is not properly determined, so visual mark cannot be rendered');
        return;
    }

    /* data */
    const data = model.data();

    /* track size */
    const trackWidth = spec.width;
    const trackHeight = spec.height;

    /* circular parameters */
    const circular = spec.layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220;
    const trackOuterRadius = spec.outerRadius ?? 300;
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const tcx = trackWidth / 2.0;
    const tcy = trackHeight / 2.0;

    /* row separation */
    const rowCategories: string[] = (model.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* render */
    // TODO: Can row be actually used for circular layouts?
    rowCategories.forEach(rowCategory => {
        const rowPosition = model.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            let x = model.encodedPIXIProperty('x', d);
            let xe = model.encodedPIXIProperty('xe', d);
            let x1 = model.encodedPIXIProperty('x1', d);
            let x1e = model.encodedPIXIProperty('x1e', d);
            const stroke = model.encodedPIXIProperty('stroke', d);
            const color = model.encodedPIXIProperty('color', d);
            const opacity = model.encodedPIXIProperty('opacity', d);

            // stroke
            g.lineStyle(
                model.encodedValue('strokeWidth'),
                colorToHex(stroke),
                opacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            const flipY = IsChannelDeep(spec.y) && spec.y.flip;
            const baseY = rowPosition + (flipY ? 0 : rowHeight);

            if (x1 !== undefined && x1e !== undefined) {
                // This means we need to draw 'band' connections
                // TODO: Better way to simply this line (i.e., 'none' for 0 opacity)?
                g.beginFill(color === 'none' ? colorToHex('white') : colorToHex(color), color === 'none' ? 0 : opacity);

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

                    // https://pixijs.download/dev/docs/PIXI.Graphics.html#bezierCurveTo
                    const r = trackOuterRadius - (rowPosition / trackHeight) * trackRingSize;
                    const posX = cartesianToPolar(x, trackWidth, r, tcx, tcy, startAngle, endAngle);
                    const posXE = cartesianToPolar(xe, trackWidth, r, tcx, tcy, startAngle, endAngle);
                    const posX1 = cartesianToPolar(x1, trackWidth, r, tcx, tcy, startAngle, endAngle);
                    const posX1E = cartesianToPolar(x1e, trackWidth, r, tcx, tcy, startAngle, endAngle);

                    g.moveTo(posX.x, posX.y);

                    // outer curve
                    g.bezierCurveTo(tcx, tcy, tcx, tcy, posX1E.x, posX1E.y);

                    g.arc(
                        tcx,
                        tcy,
                        trackOuterRadius,
                        positionToRadian(posX1E.x, posX1E.y, tcx, tcy),
                        positionToRadian(posX1.x, posX1.y, tcx, tcy),
                        false
                    );

                    // inner curve
                    g.bezierCurveTo(tcx, tcy, tcx, tcy, posXE.x, posXE.y);

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
