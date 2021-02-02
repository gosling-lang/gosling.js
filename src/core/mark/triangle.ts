import { GoslingTrackModel } from '../gosling-track-model';
import { Channel, MarkType } from '../gosling.schema';
import { getValueUsingChannel } from '../gosling.schema.guards';
import { cartesianToPolar } from '../utils/polar';

export function drawTriangle(HGC: any, trackInfo: any, tile: any, tm: GoslingTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = tm.data();

    /* track size */
    const [trackWidth, trackHeight] = trackInfo.dimensions;
    const tileSize = trackInfo.tilesetInfo.tile_size;
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        tileSize
    );

    /* circular parameters */
    const circular = spec.layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220;
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    /* genomic scale */
    const xScale = trackInfo._xScale;
    const markWidth = tm.encodedValue('size') ?? xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    const yCategories: string[] = (tm.getChannelDomainArray('y') as string[]) ?? ['___SINGLE_Y___'];
    const triHeight =
        tm.encodedValue('size') ??
        (circular ? trackRingSize / rowCategories.length / yCategories.length : rowHeight / yCategories.length);

    /* render */
    const g = tile.graphics;

    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const xValue = getValueUsingChannel(d, spec.x as Channel) as number;
            const xeValue = getValueUsingChannel(d, spec.xe as Channel) as number;
            const yValue = getValueUsingChannel(d, spec.y as Channel) as string | number;
            // const sizeValue = getValueUsingChannel(d, spec.size as Channel) as number;

            const x = xScale(xValue);
            const xe = xScale(xeValue);
            const y = tm.encodedValue('y', yValue);
            const strokeWidth = tm.encodedPIXIProperty('strokeWidth', d);
            const stroke = tm.encodedPIXIProperty('stroke', d);
            const color = tm.encodedPIXIProperty('color', d);
            const opacity = tm.encodedPIXIProperty('opacity', d);
            // const size = tm.encodedValue('size', sizeValue);

            if (circular) {
                let x0 = x ? x : xe - markWidth;
                let x1 = xe ? xe : x + markWidth;
                // let xm = x0 + (x1 - x0) / 2.0;
                const rm = trackOuterRadius - ((rowPosition + y) / trackHeight) * trackRingSize;
                const r0 = rm - triHeight / 2.0;
                const r1 = rm + triHeight / 2.0;

                if (spec.style?.align === 'right' && !xe) {
                    x0 -= markWidth;
                    x1 -= markWidth;
                    // xm -= markWidth;
                }

                let markToPoints: number[] = [];
                if (spec.mark === 'triangle-l') {
                    const p0 = cartesianToPolar(x1, trackWidth, r0, cx, cy, startAngle, endAngle);
                    const p1 = cartesianToPolar(x0, trackWidth, rm, cx, cy, startAngle, endAngle);
                    const p2 = cartesianToPolar(x1, trackWidth, r1, cx, cy, startAngle, endAngle);
                    const p3 = cartesianToPolar(x1, trackWidth, r0, cx, cy, startAngle, endAngle);
                    markToPoints = [p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y];
                } else if (spec.mark === 'triangle-r') {
                    const p0 = cartesianToPolar(x0, trackWidth, r0, cx, cy, startAngle, endAngle);
                    const p1 = cartesianToPolar(x1, trackWidth, rm, cx, cy, startAngle, endAngle);
                    const p2 = cartesianToPolar(x0, trackWidth, r1, cx, cy, startAngle, endAngle);
                    const p3 = cartesianToPolar(x0, trackWidth, r0, cx, cy, startAngle, endAngle);
                    markToPoints = [p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y];
                }

                const alphaTransition = tm.markVisibility(d, {
                    width: x1 - x0,
                    zoomLevel: trackInfo._xScale.invert(trackWidth) - trackInfo._xScale.invert(0)
                });
                const actualOpacity = Math.min(alphaTransition, opacity);

                // stroke
                g.lineStyle(
                    strokeWidth,
                    colorToHex(stroke),
                    // too narrow triangle's stroke is becoming too sharp
                    x1 - x0 > 2 ? actualOpacity : 0, // alpha
                    0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );

                g.beginFill(colorToHex(color), actualOpacity);
                g.drawPolygon(markToPoints);
                g.endFill();
            } else {
                let x0 = x ? x : xe - markWidth;
                let x1 = xe ? xe : x + markWidth;
                let xm = x0 + (x1 - x0) / 2.0;
                const ym = rowPosition + y;
                const y0 = rowPosition + y - triHeight / 2.0;
                const y1 = rowPosition + y + triHeight / 2.0;

                if (spec.style?.align === 'right' && !xe) {
                    x0 -= markWidth;
                    x1 -= markWidth;
                    xm -= markWidth;
                }

                const markToPoints: number[] = ({
                    'triangle-l': [x1, y0, x0, ym, x1, y1, x1, y0],
                    'triangle-r': [x0, y0, x1, ym, x0, y1, x0, y0],
                    'triangle-d': [x0, y0, x1, y0, xm, y1, x0, y0]
                } as any)[spec.mark as MarkType];

                const alphaTransition = tm.markVisibility(d, {
                    width: x1 - x0,
                    zoomLevel: trackInfo._xScale.invert(trackWidth) - trackInfo._xScale.invert(0)
                });
                const actualOpacity = Math.min(alphaTransition, opacity);

                // stroke
                g.lineStyle(
                    strokeWidth,
                    colorToHex(stroke),
                    // too narrow triangle's stroke is becoming too sharp
                    x1 - x0 > 2 ? actualOpacity : 0, // alpha
                    0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );

                g.beginFill(colorToHex(color), actualOpacity);
                g.drawPolygon(markToPoints);
                g.endFill();
            }
        });
    });
}
