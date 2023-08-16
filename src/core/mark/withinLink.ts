import type * as PIXI from 'pixi.js';
import type { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import type { Channel } from '@gosling-lang/gosling-schema';
import { IsChannelDeep, getValueUsingChannel, Is2DTrack } from '@gosling-lang/gosling-schema';
import { cartesianToPolar, positionToRadian } from '../utils/polar';
import colorToHex from '../utils/color-to-hex';
import { Bezier } from 'bezier-js';

export function drawWithinLink(g: PIXI.Graphics, trackInfo: any, model: GoslingTrackModel) {
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

    /* defaults */
    const MIN_HEIGHT = spec.style?.linkMinHeight ?? 0.5;
    const NUM_STEPS = spec.experimental?.performanceMode ? 10 : 50; // https://github.com/gosling-lang/gosling.js/issues/634
    const showVerticalLines = spec.style?.withinLinkVerticalLines ?? false;

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
            const ye = model.encodedPIXIProperty('ye', d);
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
            const isRibbon =
                typeof xe !== 'undefined' &&
                typeof x1 !== 'undefined' &&
                typeof x1e !== 'undefined' &&
                // This means the strokeWidth of a band is too small, so we just need to draw a line instead
                Math.abs(x - xe) > 0.1 &&
                Math.abs(x1 - x1e) > 0.1;

            // TODO: This correction can be moved to the compile process
            if (!isRibbon && xe === undefined && !Is2DTrack(spec)) {
                // We need to use a valid value to draw lines, so lets find alternative one.
                if (x1 === undefined && x1e === undefined) {
                    // We do not have a valid ones.
                    return;
                }
                xe = x1 !== undefined ? x1 : x1e;
            }

            if (!isRibbon && Math.abs(x - xe) <= 0.1 && Math.abs(x1 - x1e) <= 0.1) {
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

            const flipY = (IsChannelDeep(spec.y) && spec.y.flip) || spec.flipY;
            const baseY = spec.baselineY ?? rowPosition + (flipY ? 0 : rowHeight);

            let pathForMouseEvent: number[] = [];

            if (isRibbon) {
                g.beginFill(color === 'none' ? colorToHex('white') : colorToHex(color), color === 'none' ? 0 : opacity);

                let [_x1, _x2, _x3, _x4] = [x, xe, x1, x1e];

                // Sort values to safely draw bands
                [_x1, _x2, _x3, _x4] = [_x1, _x2, _x3, _x4].sort((a, b) => a - b);

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
                    pathForMouseEvent = Array.from(g.currentPath.points);
                    g.endFill();
                } else {
                    // Linear mark

                    g.moveTo(_x1, baseY);

                    if (!spec.style?.linkStyle || spec.style?.linkStyle === 'circular') {
                        g.arc(
                            (_x1 + _x4) / 2.0, // cx
                            baseY, // cy
                            (_x4 - _x1) / 2.0, // radius
                            -Math.PI, // start angle
                            Math.PI, // end angle
                            false
                        );
                        g.arc((_x2 + _x3) / 2.0, baseY, (_x3 - _x2) / 2.0, Math.PI, -Math.PI, true);
                        pathForMouseEvent = Array.from(g.currentPath.points);
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
                        pathForMouseEvent = Array.from(g.currentPath.points);
                        g.endFill();
                    }
                }
                /* Mouse Events */
                model.getMouseEventModel().addPolygonBasedEvent(d, pathForMouseEvent);
            } else {
                /**
                 * Line connection and not ribbon style
                 */

                const midX = (x + xe) / 2.0;

                // Must not fill color for `line`, just use `stroke`
                g.beginFill(colorToHex('white'), 0);

                if (circular) {
                    if (x < 0 || xe > trackWidth) {
                        // Do not show bands that are partly outside of the current domain
                        return;
                    }

                    const IS_ELLIPTICAL_READY = false;
                    if (IS_ELLIPTICAL_READY && spec.style?.linkStyle === 'elliptical') {
                        // !! Not ready to use
                        const morePoints: { x: number; y: number }[] = [];

                        for (let step = 0; step <= NUM_STEPS; step++) {
                            const theta = (Math.PI * step) / NUM_STEPS;
                            const mx = ((xe - x) / 2.0) * Math.cos(theta) + (x + xe) / 2.0;
                            const my =
                                baseY -
                                (((rowHeight - y) *
                                    Math.sin(theta) *
                                    Math.min(xe - x + trackWidth * 0.5, trackWidth * 1.5)) /
                                    trackWidth /
                                    1.5) *
                                    (flipY ? -1 : 1);

                            const r = trackOuterRadius - (my / trackHeight) * trackRingSize;
                            const cmx = cartesianToPolar(mx, trackWidth, r, tcx, tcy, startAngle, endAngle);

                            if (step % 20 === 0 || step === NUM_STEPS) {
                                // we draw less points than the hidden points for mouse events
                                if (step === 0) {
                                    g.moveTo(cmx.x, cmx.y);
                                } else {
                                    g.lineTo(cmx.x, cmx.y);
                                }
                            }
                            morePoints.push({ ...cmx });
                        }

                        pathForMouseEvent = morePoints.flatMap(d => [d.x, d.y]);
                    } else if (spec.style?.linkStyle === 'straight') {
                        const r = trackOuterRadius - (rowPosition / trackHeight) * trackRingSize;
                        const posS = cartesianToPolar(x, trackWidth, r, tcx, tcy, startAngle, endAngle);
                        const posE = cartesianToPolar(xe, trackWidth, r, tcx, tcy, startAngle, endAngle);

                        const x1 = posS.x;
                        const y1 = posS.y;
                        const x4 = posE.x;
                        const y4 = posE.y;

                        g.moveTo(x1, y1);
                        g.lineTo(x4, y4);

                        /* click event data */
                        const length = 100;
                        const eventPoints = Array.from({ length }, (d, i) => {
                            return {
                                x: ((x4 - x1) / (length - 1)) * i + x1,
                                y: ((y4 - y1) / (length - 1)) * i + y1
                            };
                        });

                        pathForMouseEvent = eventPoints.flatMap(d => [d.x, d.y]);
                    } else {
                        const r = trackOuterRadius - (rowPosition / trackHeight) * trackRingSize;
                        const posS = cartesianToPolar(x, trackWidth, r, tcx, tcy, startAngle, endAngle);
                        const posE = cartesianToPolar(xe, trackWidth, r, tcx, tcy, startAngle, endAngle);

                        const x1 = posS.x;
                        const y1 = posS.y;
                        const x2 = posS.x;
                        const y2 = posS.y;
                        const x3 = trackWidth / 2.0;
                        const y3 = trackHeight / 2.0;
                        const x4 = posE.x;
                        const y4 = posE.y;

                        g.moveTo(x1, y1);

                        const bezier = new Bezier(x1, y1, x2, y2, x3, y3, x4, y4);
                        const points = bezier.getLUT(14);
                        points.forEach(d => g.lineTo(d.x, d.y));

                        /* click event data */
                        const morePoints = bezier.getLUT(1000);
                        pathForMouseEvent = morePoints.flatMap(d => [d.x, d.y]);
                    }
                } else {
                    // linear line connection

                    if (spec.style?.linkStyle === 'elliptical') {
                        if (!(0 <= x && x <= trackWidth) && !(0 <= xe && xe <= trackWidth)) {
                            // not within this window
                            return;
                        }

                        const points: { x: number; y: number }[] = [];

                        // https://github.com/gosling-lang/gosling.js/issues/634
                        const isYSpecified = IsChannelDeep(spec.y);
                        // Iterate from right to left side
                        for (let step = 0; step <= NUM_STEPS; step++) {
                            const theta = Math.PI * (step / NUM_STEPS);
                            const mx = ((xe - x) / 2.0) * Math.cos(theta) + (x + xe) / 2.0;
                            let my =
                                baseY -
                                y *
                                    Math.sin(theta) *
                                    (isYSpecified
                                        ? 1
                                        : Math.min(xe - x + trackWidth * MIN_HEIGHT, trackWidth) / trackWidth) *
                                    (flipY ? -1 : 1);

                            if (typeof y !== 'undefined' && typeof ye !== 'undefined') {
                                // If both defined, we draw link between `y` and `ye`
                                const linkHeight = Math.abs(ye - y);
                                const flipShape = ye > y;
                                my = y - linkHeight * Math.sin(theta) * (flipShape ? -1 : 1);
                            }

                            if (step === 0) {
                                if (showVerticalLines) {
                                    const _y = flipY ? baseY - trackHeight : baseY;
                                    g.moveTo(mx, _y);
                                    points.push({ x: mx, y: _y });

                                    g.lineTo(mx, my);
                                } else {
                                    g.moveTo(mx, my);
                                }
                            } else {
                                g.lineTo(mx, my);
                            }
                            points.push({ x: mx, y: my });

                            if (step === NUM_STEPS && showVerticalLines) {
                                const _y = flipY ? baseY - trackHeight : baseY;
                                g.lineTo(mx, _y);
                                points.push({ x: mx, y: _y });
                            }
                        }

                        pathForMouseEvent = points.flatMap(d => [d.x, d.y]);
                    } else {
                        if (xe < 0 || x > trackWidth) {
                            // Q: Do we really need this?
                            return;
                        }
                        g.arc(midX, baseY, (xe - x) / 2.0, -Math.PI, Math.PI);
                        pathForMouseEvent = Array.from(g.currentPath.points);
                        g.closePath();
                    }
                }

                /* Mouse Events */
                model.getMouseEventModel().addLineBasedEvent(d, pathForMouseEvent);
            }
        });
    });
}
