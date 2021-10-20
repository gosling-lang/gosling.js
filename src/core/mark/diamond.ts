import { GoslingTrackModel } from '../gosling-track-model';
import { Channel } from '../gosling.schema';
import { PIXIVisualProperty } from '../visual-property.schema';
import { IsChannelDeep, getValueUsingChannel } from '../gosling.schema.guards';
import { cartesianToPolar } from '../utils/polar';
import colorToHex from '../utils/color-to-hex';

export function drawDiamond(trackInfo: any, tile: any, model: GoslingTrackModel) {
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
    const tileSize = trackInfo.tilesetInfo.tile_size;
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(tile.gos.zoomLevel, tile.gos.tilePos, tileSize);
    const zoomLevel =
        (model.getChannelScale('x') as any).invert(trackWidth) - (model.getChannelScale('x') as any).invert(0);

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
    const xScale = model.getChannelScale('x');
    const tileUnitWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories = (model.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* baseline */
    const baselineValue = IsChannelDeep(spec.y) ? spec.y?.baseline : undefined;
    const staticBaseY = model.encodedValue('y', baselineValue) ?? 0;

    /* render */
    const g = tile.graphics;
    rowCategories.forEach(rowCategory => {
        const rowPosition = model.encodedValue('row', rowCategory);

        data.filter(d => {
            const rowValue = getValueUsingChannel(d, spec.row as Channel);
            return !rowValue || rowValue === rowCategory;
        }).forEach(d => {
            const color = model.encodedPIXIProperty('color', d);
            const stroke = model.encodedPIXIProperty('stroke', d);
            const strokeWidth = model.encodedPIXIProperty('strokeWidth', d);
            const opacity = model.encodedPIXIProperty('opacity');
            let y = model.encodedPIXIProperty('y', d);
            let ye = model.encodedPIXIProperty('ye', d);

            if (typeof ye !== 'undefined') {
                // make sure `ye` is a larger range value
                [y, ye] = [y, ye].sort();
            }

            const barWidth = model.encodedPIXIProperty('width', d, { tileUnitWidth });
            const xLeft = model.encodedPIXIProperty('x-start', d, { markWidth: barWidth });
            // const xRight = xLeft + barWidth;

            let yTop: number, yBottom: number;
            if (typeof ye === 'undefined') {
                yTop = rowPosition + rowHeight - staticBaseY - y;
                yBottom = rowPosition + rowHeight - staticBaseY;
            } else {
                yTop = rowPosition + rowHeight - ye;
                yBottom = rowPosition + rowHeight - y;
            }

            const alphaTransition = model.markVisibility(d, { width: barWidth, zoomLevel });
            const actualOpacity = Math.min(alphaTransition, opacity);

            if (actualOpacity === 0 || barWidth === 0 || y === 0) {
                // do not draw invisible marks
                return;
            }

            g.lineStyle(
                strokeWidth,
                colorToHex(stroke),
                actualOpacity,
                0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            if (circular) {
                const farR = trackOuterRadius - (yTop / trackHeight) * trackRingSize;
                const nearR = trackOuterRadius - (yBottom / trackHeight) * trackRingSize;
                const midR = (farR + nearR) / 2.0;

                const p0 = cartesianToPolar(xLeft + barWidth / 2.0, trackWidth, farR, cx, cy, startAngle, endAngle);
                const p1 = cartesianToPolar(xLeft + barWidth, trackWidth, midR, cx, cy, startAngle, endAngle);
                const p2 = cartesianToPolar(xLeft + barWidth / 2.0, trackWidth, nearR, cx, cy, startAngle, endAngle);
                const p3 = cartesianToPolar(xLeft, trackWidth, midR, cx, cy, startAngle, endAngle);

                g.beginFill(colorToHex(color), actualOpacity);
                g.drawPolygon([p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p0.x, p0.y]);
                g.closePath();
            } else {
                g.beginFill(colorToHex(color), actualOpacity);
                g.drawPolygon([
                    xLeft + barWidth / 2.0,
                    yTop,
                    xLeft + barWidth,
                    (yTop + yBottom) / 2.0,
                    xLeft + barWidth / 2.0,
                    yBottom,
                    xLeft,
                    (yTop + yBottom) / 2.0,
                    xLeft + barWidth / 2.0,
                    yTop
                ]);
                g.endFill();

                /* Tooltip data */
                // if (spec.tooltip) {
                //     const barHeight = yBottom - yTop;
                //     trackInfo.tooltips.push({
                //         datum: d,
                //         isMouseOver: (x: number, y: number) =>
                //             xLeft - G < x && x < xRight + G && yTop - G < y && y < yBottom + G,
                //         markInfo: { x: xLeft, y: yTop, width: barWidth, height: barHeight, type: 'bar' }
                //     } as TooltipData);
                // }
            }
        });
    });
}

export function diamondProperty(
    gm: GoslingTrackModel,
    propertyKey: PIXIVisualProperty,
    datum?: { [k: string]: string | number },
    additionalInfo?: {
        tileUnitWidth?: number;
        markWidth?: number;
    }
) {
    const x = gm.visualPropertyByChannel('x', datum);
    const xe = gm.visualPropertyByChannel('xe', datum);
    const size = gm.visualPropertyByChannel('size', datum);
    switch (propertyKey) {
        case 'width':
            return size ?? (xe ? xe - x : additionalInfo?.tileUnitWidth);
        case 'x-start':
            if (!additionalInfo?.markWidth) {
                // `markWidth` is required
                return undefined;
            }
            return xe ? (x + xe - additionalInfo?.markWidth) / 2.0 : x - additionalInfo?.markWidth / 2.0;
        default:
            return undefined;
    }
}
