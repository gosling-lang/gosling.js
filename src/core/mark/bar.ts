import { GoslingTrackModel } from '../gosling-track-model';
import { Channel } from '../gosling.schema';
import { group } from 'd3-array';
import { PIXIVisualProperty } from '../visual-property.schema';
import { IsChannelDeep, IsStackedMark, getValueUsingChannel, getChannelField } from '../gosling.schema.guards';
import { cartesianToPolar, valueToRadian } from '../utils/polar';
import colorToHex from '../utils/color-to-hex';
import { TooltipData, TOOLTIP_MOUSEOVER_MARGIN as G } from '../../gosling-tooltip';

export function drawBar(trackInfo: any, tile: any, model: GoslingTrackModel) {
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
    const baselineValue = IsChannelDeep(spec.encoding.y) ? spec.encoding.y?.baseline : undefined;
    const staticBaseY = model.encodedValue('y', baselineValue) ?? 0;

    /* render */
    const g = tile.graphics;
    if (IsStackedMark(spec)) {
        // TODO: many parts in this scope are identical to the below `else` statement, so encaptulate this?
        // const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics(); // only one row for stacked marks

        const genomicChannel = model.getGenomicChannel();
        const genomicField = getChannelField(genomicChannel);
        if (!genomicChannel || !genomicField) {
            console.warn('Genomic field is not provided in the specification');
            return;
        }
        const pivotedData = group(data, d => d[genomicField]);
        const xKeys = [...pivotedData.keys()];

        // TODO: users may want to align rows by values
        xKeys.forEach(k => {
            let prevYEnd = 0;
            pivotedData.get(k)?.forEach(d => {
                const color = model.encodedPIXIProperty('color', d);
                const stroke = model.encodedPIXIProperty('stroke', d);
                const strokeWidth = model.encodedPIXIProperty('strokeWidth', d);
                const opacity = model.encodedPIXIProperty('opacity', d);
                const y = model.encodedPIXIProperty('y', d);

                const barWidth = model.encodedPIXIProperty('width', d, { tileUnitWidth });

                const xs = model.encodedPIXIProperty('x-start', d, { markWidth: barWidth });
                const xe = xs + barWidth;

                const alphaTransition = model.markVisibility(d, { width: barWidth, zoomLevel });
                const actualOpacity = Math.min(alphaTransition, opacity);

                if (actualOpacity === 0 || barWidth <= 0 || y <= 0) {
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
                    const farR = trackOuterRadius - ((rowHeight - prevYEnd) / trackHeight) * trackRingSize;
                    const nearR = trackOuterRadius - ((rowHeight - y - prevYEnd) / trackHeight) * trackRingSize;

                    const sPos = cartesianToPolar(xs, trackWidth, nearR, cx, cy, startAngle, endAngle);
                    const startRad = valueToRadian(xs, trackWidth, startAngle, endAngle);
                    const endRad = valueToRadian(xs + barWidth, trackWidth, startAngle, endAngle);

                    g.beginFill(colorToHex(color), actualOpacity);
                    g.moveTo(sPos.x, sPos.y);
                    g.arc(cx, cy, nearR, startRad, endRad, true);
                    g.arc(cx, cy, farR, endRad, startRad, false);
                    g.closePath();
                } else {
                    const ys = rowHeight - y - prevYEnd;
                    const barHeight = y;

                    g.beginFill(colorToHex(color), actualOpacity);
                    g.drawRect(xs, rowHeight - y - prevYEnd, barWidth, y);

                    /* Tooltip data */
                    if (spec.tooltip) {
                        trackInfo.tooltips.push({
                            datum: d,
                            isMouseOver: (x: number, y: number) =>
                                xs - G < x && x < xe + G && ys - G < y && y < ys + barHeight + G,
                            markInfo: { x: xs, y: ys, width: barWidth, height: barHeight, type: 'bar' }
                        } as TooltipData);
                    }
                }

                prevYEnd += y;
            });
        });
    } else {
        rowCategories.forEach(rowCategory => {
            const rowPosition = model.encodedValue('row', rowCategory);

            data.filter(d => {
                const rowValue = getValueUsingChannel(d, spec.encoding.row as Channel);
                return !rowValue || rowValue === rowCategory;
            }).forEach(d => {
                const color = model.encodedPIXIProperty('color', d);
                const stroke = model.encodedPIXIProperty('stroke', d);
                const strokeWidth = model.encodedPIXIProperty('strokeWidth', d);
                const opacity = model.encodedPIXIProperty('opacity', d);
                let y = model.encodedPIXIProperty('y', d);
                let ye = model.encodedPIXIProperty('y', d, { fieldKey: 'endField' });

                if (typeof ye !== 'undefined') {
                    // make sure `ye` is a larger range value
                    [y, ye] = [y, ye].sort();
                }

                const barWidth = model.encodedPIXIProperty('width', d, { tileUnitWidth });
                const xLeft = model.encodedPIXIProperty('x-start', d, { markWidth: barWidth });
                const xRight = xLeft + barWidth;

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

                    const sPos = cartesianToPolar(xLeft, trackWidth, nearR, cx, cy, startAngle, endAngle);
                    const startRad = valueToRadian(xLeft, trackWidth, startAngle, endAngle);
                    const endRad = valueToRadian(xLeft + barWidth, trackWidth, startAngle, endAngle);

                    g.beginFill(colorToHex(color), actualOpacity);
                    g.moveTo(sPos.x, sPos.y);
                    g.arc(cx, cy, nearR, startRad, endRad, true);
                    g.arc(cx, cy, farR, endRad, startRad, false);
                    g.closePath();
                } else {
                    g.beginFill(colorToHex(color), actualOpacity);
                    g.drawRect(xLeft, yTop, barWidth, yBottom - yTop);

                    /* Tooltip data */
                    if (spec.tooltip) {
                        const barHeight = yBottom - yTop;
                        trackInfo.tooltips.push({
                            datum: d,
                            isMouseOver: (x: number, y: number) =>
                                xLeft - G < x && x < xRight + G && yTop - G < y && y < yBottom + G,
                            markInfo: { x: xLeft, y: yTop, width: barWidth, height: barHeight, type: 'bar' }
                        } as TooltipData);
                    }
                }
            });
        });
    }
}

export function barProperty(
    gm: GoslingTrackModel,
    propertyKey: PIXIVisualProperty,
    datum?: { [k: string]: string | number },
    additionalInfo?: {
        tileUnitWidth?: number;
        markWidth?: number;
    }
) {
    const x = gm.visualPropertyByChannel('x', datum);
    const xe = gm.visualPropertyByChannel('x', datum, 'endField');
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
