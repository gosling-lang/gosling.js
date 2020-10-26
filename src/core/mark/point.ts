import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import { getValueUsingChannel } from '../gemini.schema.guards';
import { cartesianToPolar } from '../utils/polar';
import { PIXIVisualProperty } from '../visual-property.schema';

export function drawPoint(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = tm.data();

    /* track size */
    const trackWidth = trackInfo.dimensions[0];
    const trackHeight = trackInfo.dimensions[1];

    /* circular parameters */
    const circular = spec._is_circular;
    const trackInnerRadius = spec.innerRadius ?? 220;
    const trackOuterRadius = spec.outerRadius ?? 300;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const tcx = trackWidth / 2.0;
    const tcy = trackHeight / 2.0;

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* constant values */
    const constantStrokeWidth = tm.encodedPIXIProperty('strokeWidth');
    const constantStroke = tm.encodedPIXIProperty('stroke');

    /* render */
    const graphics = tile.graphics;

    // stroke
    graphics.lineStyle(
        constantStrokeWidth,
        colorToHex(constantStroke),
        1, // alpha
        1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );

    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const cx = tm.encodedPIXIProperty('x-center', d);
            const cy = tm.encodedPIXIProperty('y-center', d);
            const color = tm.encodedPIXIProperty('color', d);
            const size = tm.encodedPIXIProperty('size', d);
            const opacity = tm.encodedPIXIProperty('opacity', d);

            // Don't draw invisible marks
            if (size === 0 || opacity === 0) return;

            if (circular) {
                const r = trackOuterRadius - ((rowPosition + rowHeight - cy) / trackHeight) * trackRingSize;
                const pos = cartesianToPolar(cx, trackWidth, r, tcx, tcy);

                graphics.beginFill(colorToHex(color), opacity);
                graphics.drawCircle(pos.x, pos.y, size);
            } else {
                graphics.beginFill(colorToHex(color), opacity);
                graphics.drawCircle(cx, rowPosition + rowHeight - cy, size);
            }
        });
    });
}

export function pointProperty(
    gm: GeminiTrackModel,
    propertyKey: PIXIVisualProperty,
    datum?: { [k: string]: string | number }
) {
    // priority of channels
    switch (propertyKey) {
        case 'x-center':
            const xe = gm.visualPropertyByChannel('xe', datum);
            const x = gm.visualPropertyByChannel('x', datum);
            return xe ? (xe + x) / 2.0 : x;
        case 'y-center':
            const ye = gm.visualPropertyByChannel('ye', datum);
            const y = gm.visualPropertyByChannel('y', datum);
            return ye ? (ye + y) / 2.0 : y;
        default:
            return undefined;
    }
}
