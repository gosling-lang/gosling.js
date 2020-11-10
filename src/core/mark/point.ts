import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import { getValueUsingChannel } from '../gemini.schema.guards';
import { cartesianToPolar } from '../utils/polar';
import { PIXIVisualProperty } from '../visual-property.schema';

export function drawPoint(HGC: any, trackInfo: any, tile: any, model: GeminiTrackModel) {
    /* track spec */
    const spec = model.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = model.data();

    /* track size */
    const trackWidth = trackInfo.dimensions[0];
    const trackHeight = trackInfo.dimensions[1];

    /* circular parameters */
    const circular = spec._is_circular;
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

    /* constant values */
    const constantStrokeWidth = model.encodedPIXIProperty('strokeWidth');
    const constantStroke = model.encodedPIXIProperty('stroke');

    /* render */
    const g = tile.graphics;

    // stroke
    g.lineStyle(
        constantStrokeWidth,
        colorToHex(constantStroke),
        1, // alpha
        1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );

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
            const size = model.encodedPIXIProperty('p-size', d);
            const opacity = model.encodedPIXIProperty('opacity', d);

            if (size <= 0.1 || opacity === 0 || cx + size < 0 || cx - size > trackWidth) {
                // Don't draw invisible marks
                return;
            }

            if (circular) {
                const r = trackOuterRadius - ((rowPosition + rowHeight - cy) / trackHeight) * trackRingSize;
                const pos = cartesianToPolar(cx, trackWidth, r, tcx, tcy, startAngle, endAngle);

                g.beginFill(colorToHex(color), opacity);
                g.drawCircle(pos.x, pos.y, size);
            } else {
                g.beginFill(colorToHex(color), opacity);
                g.drawCircle(cx, rowPosition + rowHeight - cy, size);
            }
        });
    });
}

export function pointProperty(
    model: GeminiTrackModel,
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
        case 'y-center':
            const ye = model.visualPropertyByChannel('ye', datum);
            const y = model.visualPropertyByChannel('y', datum);
            return ye ? (ye + y) / 2.0 : y;
        case 'p-size':
            return xe && model.spec().stretch ? (xe - x) / 2.0 : size;
        default:
            return undefined;
    }
}
