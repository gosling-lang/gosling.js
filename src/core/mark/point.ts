import type * as PIXI from 'pixi.js';
import type { GoslingTrackModel } from '../gosling-track-model';
import type { Channel } from '../gosling.schema';
import { getValueUsingChannel } from '../gosling.schema.guards';
import colorToHex from '../utils/color-to-hex';
import { cartesianToPolar } from '../utils/polar';
import type { PIXIVisualProperty } from '../visual-property.schema';

export function drawPoint(track: any, g: PIXI.Graphics, model: GoslingTrackModel) {
    /* track spec */
    const spec = model.spec();

    if (!spec.width || !spec.height) {
        console.warn('Size of a track is not properly determined, so visual mark cannot be rendered');
        return;
    }

    /* data */
    const data = model.data();

    /* track size */
    const [trackWidth, trackHeight] = track.dimensions;
    const zoomLevel =
        (model.getChannelScale('x') as any).invert(trackWidth) - (model.getChannelScale('x') as any).invert(0);

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
    const rowCategories = (model.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* render */
    rowCategories.forEach(rowCategory => {
        const rowPosition = model.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const cx = model.encodedPIXIProperty('x-center', d);
            const cy = model.encodedPIXIProperty('y-center', d);
            const color = model.encodedPIXIProperty('color', d);
            const radius = model.encodedPIXIProperty('p-size', d);
            const strokeWidth = model.encodedPIXIProperty('strokeWidth', d);
            const stroke = model.encodedPIXIProperty('stroke', d);
            const opacity = model.encodedPIXIProperty('opacity', d);

            const alphaTransition = model.markVisibility(d, { width: radius, zoomLevel });
            const actualOpacity = Math.min(alphaTransition, opacity);

            if (radius <= 0.1 || actualOpacity === 0 || cx + radius < 0 || cx - radius > trackWidth) {
                // Don't draw invisible marks
                return;
            }

            // stroke
            g.lineStyle(
                strokeWidth,
                colorToHex(stroke),
                actualOpacity, // alpha
                1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            if (circular) {
                const r = trackOuterRadius - ((rowPosition + rowHeight - cy) / trackHeight) * trackRingSize;
                const pos = cartesianToPolar(cx, trackWidth, r, tcx, tcy, startAngle, endAngle);
                g.beginFill(colorToHex(color), actualOpacity);
                g.drawCircle(pos.x, pos.y, radius);

                /* Mouse Events */
                model.getMouseEventModel().addPointBasedEvent(d, [pos.x, pos.y, radius]);
            } else {
                g.beginFill(colorToHex(color), actualOpacity);
                g.drawCircle(cx, rowPosition + rowHeight - cy, radius);

                /* Mouse Events */
                model.getMouseEventModel().addPointBasedEvent(d, [cx, rowPosition + rowHeight - cy, radius]);
            }
        });
    });
}

export function pointProperty(
    model: GoslingTrackModel,
    propertyKey: PIXIVisualProperty,
    datum?: { [k: string]: string | number }
) {
    const xe = model.visualPropertyByChannel('xe', datum);
    const x = model.visualPropertyByChannel('x', datum);
    const size = model.visualPropertyByChannel('size', datum);

    // priority of channels
    switch (propertyKey) {
        case 'x-center':
            return xe ? (xe + x) / 2.0 : x;
        case 'y-center': {
            const ye = model.visualPropertyByChannel('ye', datum);
            const y = model.visualPropertyByChannel('y', datum);
            return ye ? (ye + y) / 2.0 : y;
        }
        case 'p-size':
            return xe && model.spec().stretch ? (xe - x) / 2.0 : size;
        default:
            return undefined;
    }
}
