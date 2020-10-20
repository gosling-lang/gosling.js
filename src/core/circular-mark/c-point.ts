import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import { getValueUsingChannel } from '../gemini.schema.guards';
import { cartesianToPolar } from '../utils/polar';

export function drawCircularPoint(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
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
    const trackInnerRadius = spec.innerRadius ?? 220; // TODO: should default values be filled already
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* constant values */
    const constantStrokeWidth = tm.encodedProperty('strokeWidth');
    const constantStroke = tm.encodedProperty('stroke');

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
            const x = tm.encodedProperty('x-center', d);
            const y = tm.encodedProperty('y', d);
            const color = tm.encodedProperty('color', d);
            const size = tm.encodedProperty('size', d);
            const opacity = tm.encodedProperty('opacity', d);

            // Don't draw invisible marks
            if (size === 0 || opacity === 0) return;

            const r = trackOuterRadius - ((rowPosition + rowHeight - y) / trackHeight) * trackRingSize;
            const pos = cartesianToPolar(x, trackWidth, r, cx, cy);

            graphics.beginFill(colorToHex(color), opacity);
            graphics.drawCircle(pos.x, pos.y, size);
        });
    });
}
