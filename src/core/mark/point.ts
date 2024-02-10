import type * as PIXI from 'pixi.js';
import type { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import type { Channel } from '@gosling-lang/gosling-schema';
import { getValueUsingChannel } from '@gosling-lang/gosling-schema';
import colorToHex from '../utils/color-to-hex';
import { cartesianToPolar } from '../utils/polar';
import type { PIXIVisualProperty } from '../visual-property.schema';
import { uuid } from '../utils/uuid';

function calculateOpacity(
    model: GoslingTrackModel,
    datum: {
        [k: string]: string | number;
    },
    radius: number,
    zoomLevel: number
) {
    const opacity = model.encodedPIXIProperty('opacity', datum);
    const alphaTransition = model.markVisibility(datum, { width: radius, zoomLevel });
    return Math.min(alphaTransition, opacity);
}

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
            // const cx = model.xScale(d.position);
            const cx = model.encodedPIXIProperty('x-center', d);
            const cy = d.cy ?? model.encodedPIXIProperty('y-center', d);
            const color = (d.color as number) ?? (colorToHex(model.encodedPIXIProperty('color', d)) as number);
            const radius = d.radius ?? model.encodedPIXIProperty('p-size', d);
            const strokeWidth = d.strokeWidth ?? model.encodedPIXIProperty('strokeWidth', d);
            const strokeColor = d.stroke ?? colorToHex(model.encodedPIXIProperty('stroke', d));
            const actualOpacity = d.opacity ?? calculateOpacity(model, d, radius, zoomLevel);

            if (!d.radius) {
                d.cy = cy;
                d.color = color;
                d.radius = radius;
                d.strokeWidth = strokeWidth;
                d.stroke = strokeColor;
                d.opacity = actualOpacity;
                d.uuid = uuid();
            }

            if (radius <= 0.1 || actualOpacity === 0 || cx + radius < 0 || cx - radius > trackWidth) {
                // Don't draw invisible marks
                return;
            }

            // stroke
            g.lineStyle(
                strokeWidth,
                strokeColor,
                actualOpacity, // alpha
                1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            let pos: { x: number; y: number };
            if (circular) {
                const r = trackOuterRadius - ((rowPosition + rowHeight - cy) / trackHeight) * trackRingSize;
                pos = cartesianToPolar(cx, trackWidth, r, tcx, tcy, startAngle, endAngle);
                /* Mouse Events */
            } else {
                pos = {
                    x: cx,
                    y: rowPosition + rowHeight - cy
                };
            }
            g.beginFill(color, actualOpacity);
            g.drawCircle(pos.x, pos.y, radius);
            model.getMouseEventModel().addPointBasedEvent(d, [pos.x, pos.y, radius], d.uuid);
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

    // console.warn('pointProperty', propertyKey);

    // priority of channels
    switch (propertyKey) {
        case 'x-center':
            return xe ? (xe + x) / 2.0 : x;
        case 'y-center': {
            const ye = model.visualPropertyByChannel('ye', datum);
            const y = model.visualPropertyByChannel('y', datum);
            return ye ? (ye + y) / 2.0 : y;
        }
        case 'p-size': {
            const size = model.visualPropertyByChannel('size', datum);
            return xe && model.spec().stretch ? (xe - x) / 2.0 : size;
        }
        default:
            return undefined;
    }
}
