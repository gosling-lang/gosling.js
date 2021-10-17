import * as PIXI from 'pixi.js';
import { GoslingTrackModel } from '../gosling-track-model';
import { Channel } from '../gosling.schema';
import { getValueUsingChannel } from '../gosling.schema.guards';
import colorToHex from '../utils/color-to-hex';
import { cartesianToPolar } from '../utils/polar';
import { TooltipData, TOOLTIP_MOUSEOVER_MARGIN as G } from '../../gosling-tooltip';

export function drawLine(
    g: PIXI.Graphics,
    tm: GoslingTrackModel,
    tooltips: TooltipData[],
    trackWidth: number,
    trackHeight: number
) {
    /* track spec */
    const spec = tm.spec();

    if (!spec.width || !spec.height) {
        console.warn('Size of a track is not properly determined, so visual mark cannot be rendered');
        return;
    }

    /* data */
    const data = tm.data();

    /* circular parameters */
    const circular = spec.layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220; // TODO: should default values be filled already
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const trackCenterX = trackWidth / 2.0;
    const trackCenterY = trackHeight / 2.0;

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* color separation */
    const colorCategories = (tm.getChannelDomainArray('color') as string[]) ?? ['___SINGLE_COLOR___'];

    /* render */
    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        // line marks are drawn for each color
        colorCategories.forEach(colorCategory => {
            data.filter(
                d =>
                    (!getValueUsingChannel(d, spec.row as Channel) ||
                        (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory) &&
                    (!getValueUsingChannel(d, spec.color as Channel) ||
                        (getValueUsingChannel(d, spec.color as Channel) as string) === colorCategory)
            )
                .sort(
                    (d1, d2) =>
                        // draw from the left to right
                        (getValueUsingChannel(d1, spec.x as Channel) as number) -
                        (getValueUsingChannel(d2, spec.x as Channel) as number)
                )
                .forEach((d, i) => {
                    const cx = tm.encodedPIXIProperty('x', d);
                    const y = tm.encodedPIXIProperty('y', d);
                    const size = tm.encodedPIXIProperty('size', d);
                    const color = tm.encodedPIXIProperty('color', d); // should be identical for a single line
                    const opacity = tm.encodedPIXIProperty('opacity', d);

                    g.lineStyle(
                        size,
                        colorToHex(color),
                        opacity,
                        0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                    );

                    if (circular) {
                        const r = trackOuterRadius - ((rowPosition + rowHeight - y) / trackHeight) * trackRingSize;
                        const pos = cartesianToPolar(
                            cx,
                            trackWidth,
                            r,
                            trackCenterX,
                            trackCenterY,
                            startAngle,
                            endAngle
                        );

                        if (i === 0) {
                            g.moveTo(pos.x, pos.y);
                        } else {
                            g.lineTo(pos.x, pos.y);
                        }
                    } else {
                        if (i === 0) {
                            g.moveTo(cx, rowPosition + rowHeight - y);
                        } else {
                            g.lineTo(cx, rowPosition + rowHeight - y);
                        }

                        /* Tooltip data */
                        if (spec.tooltip) {
                            tooltips.push({
                                datum: d,
                                isMouseOver: (x: number, y: number) =>
                                    cx - G < x && x < cx + G && rowPosition - G < y && y < rowPosition + rowHeight + G,
                                markInfo: { x: cx, y, width: G, height: y, type: 'line' }
                            } as TooltipData);
                        }
                    }
                });
        });
    });
}
