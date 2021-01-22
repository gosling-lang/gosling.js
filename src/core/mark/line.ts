import { GoslingTrackModel } from '../gosling-track-model';
import { Channel } from '../gosling.schema';
import { getValueUsingChannel } from '../gosling.schema.guards';
import { cartesianToPolar } from '../utils/polar';

export function drawLine(HGC: any, trackInfo: any, tile: any, tm: GoslingTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = tm.data();

    /* track size */
    const [trackWidth, trackHeight] = trackInfo.dimensions;

    /* circular parameters */
    const circular = spec.layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220; // TODO: should default values be filled already
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* color separation */
    const colorCategories = (tm.getChannelDomainArray('color') as string[]) ?? ['___SINGLE_COLOR___'];

    /* render */
    const graphics = tile.graphics;
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
                    const x = tm.encodedPIXIProperty('x', d);
                    const y = tm.encodedPIXIProperty('y', d);
                    const size = tm.encodedPIXIProperty('size', d);
                    const color = tm.encodedPIXIProperty('color', d); // should be identical for a single line
                    const opacity = tm.encodedPIXIProperty('opacity', d);

                    graphics.lineStyle(
                        size,
                        colorToHex(color),
                        opacity,
                        0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                    );

                    if (circular) {
                        const r = trackOuterRadius - ((rowPosition + rowHeight - y) / trackHeight) * trackRingSize;
                        const pos = cartesianToPolar(x, trackWidth, r, cx, cy, startAngle, endAngle);

                        if (i === 0) {
                            graphics.moveTo(pos.x, pos.y);
                        } else {
                            graphics.lineTo(pos.x, pos.y);
                        }
                    } else {
                        if (i === 0) {
                            graphics.moveTo(x, rowPosition + rowHeight - y);
                        } else {
                            graphics.lineTo(x, rowPosition + rowHeight - y);
                        }
                    }
                });
        });
    });
}
