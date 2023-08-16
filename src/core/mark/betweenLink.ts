import type * as PIXI from 'pixi.js';
import type { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import type { Channel } from '@gosling-lang/gosling-schema';
import { getValueUsingChannel, Is2DTrack } from '@gosling-lang/gosling-schema';
import { cartesianToPolar, positionToRadian } from '../utils/polar';
import colorToHex from '../utils/color-to-hex';

// TODO: This code is taken from `link.ts` which is for withinLink marks. Large parts should be removed.
export function drawBetweenLink(g: PIXI.Graphics, trackInfo: any, model: GoslingTrackModel) {
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

    /* row separation */
    const rowCategories: string[] = (model.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    // TODO: Can row be actually used for circular layouts?
    /* render */
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
            const y = model.encodedPIXIProperty('y', d);
            const stroke = model.encodedPIXIProperty('stroke', d);
            const strokeWidth = model.encodedPIXIProperty('strokeWidth', d);
            const color = model.encodedPIXIProperty('color', d);
            const opacity = model.encodedPIXIProperty('opacity', d);

            // sort properly
            if (typeof xe !== 'undefined') {
                [x, xe] = [x, xe].sort((a, b) => a - b);
            }
            if (typeof x1 !== 'undefined' && typeof x1e !== 'undefined') {
                [x1, x1e] = [x1, x1e].sort((a, b) => a - b);
            }

            // Is this band or line?
            const isRibon =
                typeof xe !== 'undefined' &&
                typeof x1 !== 'undefined' &&
                typeof x1e !== 'undefined' &&
                // This means the strokeWidth of a band is too small, so we just need to draw a line instead
                Math.abs(x - xe) > 0.1 &&
                Math.abs(x1 - x1e) > 0.1;

            // TODO: This correction can be moved to the compile process
            if (!isRibon && xe === undefined && !Is2DTrack(spec)) {
                // We need to use a valid value to draw lines, so lets find alternative one.
                if (x1 === undefined && x1e === undefined) {
                    // We do not have a valid ones.
                    return;
                }
                xe = x1 !== undefined ? x1 : x1e;
            }

            if (!isRibon && Math.abs(x - xe) <= 0.1 && Math.abs(x1 - x1e) <= 0.1) {
                // Put the larger value on `xe` so that it can be used in line connection
                x = (x + xe) / 2.0;
                xe = (x1 + x1e) / 2.0;
            }

            // stroke
            g.lineStyle(
                strokeWidth,
                colorToHex(stroke),
                opacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            if (isRibon) {
                g.beginFill(color === 'none' ? colorToHex('white') : colorToHex(color), color === 'none' ? 0 : opacity);

                let [_x1, _x2, _x3, _x4] = [x, xe, x1, x1e];

                // Sort values to safely draw bands
                [_x1, _x2] = [_x1, _x2].sort((a, b) => a - b);
                [_x3, _x4] = [_x3, _x4].sort((a, b) => a - b);

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
                    g.moveTo(_x1, rowPosition);
                    g.lineTo(_x2, rowPosition);
                    g.lineTo(_x4, rowPosition + rowHeight);
                    g.lineTo(_x3, rowPosition + rowHeight);
                    g.lineTo(_x1, rowPosition);
                    g.closePath();
                }
            } else {
                /* Line Connection */

                // Experimental
                if (Is2DTrack(spec)) {
                    if (spec.style?.linkConnectionType === 'curve') {
                        g.moveTo(x, 0);
                        g.bezierCurveTo(
                            (x / 5.0) * 4,
                            (rowPosition + rowHeight - y) / 2.0,
                            x / 2.0,
                            ((rowPosition + rowHeight - y) / 5.0) * 4,
                            0,
                            rowPosition + rowHeight - y
                        );
                    } else if (spec.style?.linkConnectionType === 'straight') {
                        g.moveTo(x, 0);
                        g.lineTo(0, rowPosition + rowHeight - y);
                    } else {
                        // spec.style?.linkConnectionType === 'corner'
                        g.moveTo(x, 0);
                        g.lineTo(x, rowPosition + rowHeight - y);
                        g.lineTo(0, rowPosition + rowHeight - y);
                    }
                    return;
                }

                if (circular) {
                    /* Original lines */
                    // const r = trackOuterRadius - (rowPosition / trackHeight) * trackRingSize;
                    // const posX = cartesianToPolar(x, trackWidth, r, tcx, tcy, startAngle, endAngle);
                    // const posXE = cartesianToPolar(xe, trackWidth, trackInnerRadius, tcx, tcy, startAngle, endAngle);
                    // g.lineStyle(
                    //     1,
                    //     colorToHex('red'),
                    //     1, // alpha
                    //     0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                    // );
                    // g.moveTo(posX.x, posX.y);
                    // g.lineTo(posXE.x, posXE.y);

                    // https://www.tessellationtech.io/tutorial-circular-sankey/
                    let prevX, prevY;
                    for (let t = 0; t <= 1; t += 0.02) {
                        const logodds = (t: number) => Math.log(t / (1 - t));
                        const movingRadius = (t: number) =>
                            trackOuterRadius - (1 / (1 + Math.exp(logodds(t)))) * trackRingSize + 3;
                        const getRadian = (t: number, s: number, e: number) => ((e - s) * t + s) / trackWidth;
                        const _x = tcx + movingRadius(t) * Math.cos(-getRadian(t, x, xe) * 2 * Math.PI - Math.PI / 2.0);
                        const _y = tcy + movingRadius(t) * Math.sin(-getRadian(t, x, xe) * 2 * Math.PI - Math.PI / 2.0);
                        if (prevX && prevY) {
                            g.lineStyle(
                                strokeWidth,
                                colorToHex(stroke),
                                opacity, // alpha
                                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                            );
                            g.moveTo(prevX, prevY);
                            g.lineTo(_x, _y);
                        }
                        prevX = _x;
                        prevY = _y;
                    }

                    return;
                }

                // TODO: Not yet supported.
                g.moveTo(xe, rowPosition + rowHeight);
                g.lineTo(x, rowPosition);
            }
        });
    });
}
