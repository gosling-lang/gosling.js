import type * as PIXI from 'pixi.js';
import type { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import type { Channel } from '@gosling-lang/gosling-schema';
import { getValueUsingChannel } from '@gosling-lang/gosling-schema';
import colorToHex from '../utils/color-to-hex';
import { cartesianToPolar } from '../utils/polar';

export function drawLine(g: PIXI.Graphics, model: GoslingTrackModel, trackWidth: number, trackHeight: number) {
    /* track spec */
    const spec = model.spec();

    if (!spec.width || !spec.height) {
        console.warn('Size of a track is not properly determined, so visual mark cannot be rendered');
        return;
    }

    /* data */
    const data = model.data();

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
    const rowCategories = (model.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* color separation */
    const colorCategories = (model.getChannelDomainArray('color') as string[]) ?? ['___SINGLE_COLOR___'];

    /* render */
    rowCategories.forEach(rowCategory => {
        const rowPosition = model.encodedValue('row', rowCategory);

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
                    const cx = model.encodedPIXIProperty('x', d);
                    const y = model.encodedPIXIProperty('y', d);
                    const size = model.encodedPIXIProperty('size', d);
                    const color = model.encodedPIXIProperty('color', d); // should be identical for a single line
                    const opacity = model.encodedPIXIProperty('opacity', d);

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
                        /* Mouse Events */
                        model.getMouseEventModel().addPointBasedEvent(d, [pos.x, pos.y, 1]);
                    } else {
                        if (i === 0) {
                            g.moveTo(cx, rowPosition + rowHeight - y);
                        } else {
                            g.lineTo(cx, rowPosition + rowHeight - y);
                        }
                        /* Mouse Events */
                        model.getMouseEventModel().addPointBasedEvent(d, [cx, rowPosition + rowHeight - y, 1]);
                    }
                });
        });
    });
}
