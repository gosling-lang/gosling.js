import * as PIXI from 'pixi.js';
import { GoslingTrackModel } from '../gosling-track-model';
import { Channel } from '../gosling.schema';
import { IsChannelDeep, getValueUsingChannel } from '../gosling.schema.guards';
import { cartesianToPolar, positionToRadian } from '../utils/polar';
import colorToHex from '../utils/color-to-hex';

// Bezier deprecated
const DISABLE_BEZIER = true;

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
            const x1 = model.encodedPIXIProperty('x1', d);
            const x1e = model.encodedPIXIProperty('x1e', d);
            const stroke = model.encodedPIXIProperty('stroke', d);
            const color = model.encodedPIXIProperty('color', d);
            const opacity = model.encodedPIXIProperty('opacity', d);

            // Is this band or line?
            const isBand =
                xe !== undefined &&
                x1e !== undefined &&
                // This means the strokeWidth of a band is too small, so we just need to draw a line instead
                Math.abs(x - xe) > 0.1 &&
                Math.abs(x1 - x1e) > 0.1;

            // Should we do this when building Gosling Model?
            if (!isBand && xe === undefined) {
                // We need to use a valid number to draw lines, so lets find alternative one.
                if (x1 === undefined && x1e === undefined) {
                    // We do not have a valid ones.
                    return;
                }
                xe = x1 !== undefined ? x1 : x1e;
            }

            if (!isBand && Math.abs(x - xe) <= 0.1 && Math.abs(x1 - x1e) <= 0.1) {
                // Put the larger value on `xe` so that it can be used in line connection
                x = (x + xe) / 2.0;
                xe = (x1 + x1e) / 2.0;
            }

            // stroke
            g.lineStyle(
                model.encodedValue('strokeWidth'),
                colorToHex(stroke),
                opacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            const flipY = (IsChannelDeep(spec.y) && spec.y.flip) || spec.flipY;
            const baseY = rowPosition + (flipY ? 0 : rowHeight);

            if (isBand) {
                g.beginFill(color === 'none' ? colorToHex('white') : colorToHex(color), color === 'none' ? 0 : opacity);

                let [_x1, _x2, _x3, _x4] = [x, xe, x1, x1e];

                // Sort values to safely draw bands
                if (spec.style?.verticalLink) {
                    [_x1, _x2] = [_x1, _x2].sort((a, b) => a - b);
                    [_x3, _x4] = [_x3, _x4].sort((a, b) => a - b);
                } else {
                    [_x1, _x2, _x3, _x4] = [_x1, _x2, _x3, _x4].sort((a, b) => a - b);
                }

                if (_x1 > trackWidth || _x4 < 0 || Math.abs(_x4 - _x1) < 0.5) {
                    // Do not draw very small visual marks
                    return;
                }

                if (circular) {
                    if (_x1 < 0 || _x4 > trackWidth) {
                        // Do not show bands that are partly outside of the current domain
                        return;
                    }

                    // https://pixijs.download/dev/docs/PIXI.Graphics.html#bezierCurveTo
                    const r = trackOuterRadius - (rowPosition / trackHeight) * trackRingSize;
                    const posX = cartesianToPolar(_x1, trackWidth, r, tcx, tcy, startAngle, endAngle);
                    const posXE = cartesianToPolar(_x2, trackWidth, r, tcx, tcy, startAngle, endAngle);
                    const posX1 = cartesianToPolar(_x3, trackWidth, r, tcx, tcy, startAngle, endAngle);
                    const posX1E = cartesianToPolar(_x4, trackWidth, r, tcx, tcy, startAngle, endAngle);

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

                    // Experimental
                    if (spec.style?.verticalLink) {
                        g.moveTo(_x1, rowPosition);
                        g.lineTo(_x2, rowPosition);
                        g.lineTo(_x4, rowPosition + rowHeight);
                        g.lineTo(_x3, rowPosition + rowHeight);
                        g.lineTo(_x1, rowPosition);
                        g.closePath();
                        return;
                    }

                    g.moveTo(_x1, baseY);

                    if (spec.style?.circularLink || DISABLE_BEZIER) {
                        g.arc(
                            (_x1 + _x4) / 2.0, // cx
                            baseY, // cy
                            (_x4 - _x1) / 2.0, // radius
                            -Math.PI, // start angle
                            Math.PI, // end angle
                            false
                        );
                        g.arc((_x2 + _x3) / 2.0, baseY, (_x3 - _x2) / 2.0, Math.PI, -Math.PI, true);
                        g.closePath();
                    } else {
                        g.lineTo(_x3, rowPosition + rowHeight);
                        g.bezierCurveTo(
                            _x3 + (_x2 - _x3) / 3.0,
                            // rowPosition + (x1 - x),
                            rowPosition + rowHeight - (_x2 - _x3) / 2.0, //Math.min(rowHeight - (x1 - x), (xe - x1) / 2.0),
                            _x3 + ((_x2 - _x3) / 3.0) * 2,
                            // rowPosition + (x1 - x),
                            rowPosition + rowHeight - (_x2 - _x3) / 2.0, //Math.min(rowHeight - (x1 - x), (xe - x1) / 2.0),
                            _x2,
                            rowPosition + rowHeight
                        );
                        g.lineTo(_x4, rowPosition + rowHeight);
                        g.bezierCurveTo(
                            _x1 + ((_x4 - _x1) / 3.0) * 2,
                            // rowPosition,
                            rowPosition + rowHeight - (_x4 - _x1) / 2.0, //Math.min(rowHeight, (x1e - x) / 2.0),
                            _x1 + (_x4 - _x1) / 3.0,
                            // rowPosition,
                            rowPosition + rowHeight - (_x4 - _x1) / 2.0, //Math.min(rowHeight, (x1e - x) / 2.0),
                            _x1,
                            rowPosition + rowHeight
                        );
                        g.endFill();
                    }
                }
            } else {
                /* Line Connection */

                // Experimental
                if (spec.style?.verticalLink) {
                    g.moveTo(xe, rowPosition + rowHeight);
                    g.lineTo(x, rowPosition);
                    return;
                }

                if (xe - x <= 0.1) {
                    // Do not draw very small links
                    return;
                }

                const midX = (x + xe) / 2.0;

                // Must not fill color for `line`, just use `stroke`
                g.beginFill(colorToHex('white'), 0);

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
                } else {
                    g.moveTo(x, baseY);

                    if (spec.style?.circularLink || DISABLE_BEZIER) {
                        if (xe < 0 || x > trackWidth) {
                            // Q: Do we really need this?
                            return;
                        }
                        g.arc(midX, baseY, (xe - x) / 2.0, -Math.PI, Math.PI);
                        g.closePath();
                    } else {
                        g.bezierCurveTo(
                            x + (xe - x) / 3.0,
                            baseY + Math.min(rowHeight, (xe - x) / 2.0) * (flipY ? 1 : -1),
                            x + ((xe - x) / 3.0) * 2,
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
