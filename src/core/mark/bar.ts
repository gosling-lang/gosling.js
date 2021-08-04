import { GoslingTrackModel } from '../gosling-track-model';
import { Channel } from '../gosling.schema';
import { group } from 'd3-array';
import { PIXIVisualProperty } from '../visual-property.schema';
import { IsChannelDeep, IsStackedMark, getValueUsingChannel } from '../gosling.schema.guards';
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
    const baselineValue = IsChannelDeep(spec.y) ? spec.y?.baseline : undefined;
    const baselineY = model.encodedValue('y', baselineValue) ?? 0;

    /* render */
    const g = tile.graphics;
    if (IsStackedMark(spec)) {
        // TODO: many parts in this scope are identical to the below `else` statement, so encaptulate this?
        // const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics(); // only one row for stacked marks

        const genomicChannel = model.getGenomicChannel();
        if (!genomicChannel || !genomicChannel.field) {
            console.warn('Genomic field is not provided in the specification');
            return;
        }
        const pivotedData = group(data, d => d[genomicChannel.field as string]);
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
            // we are separately drawing each row so that y scale can be more effectively shared across tiles without rerendering from the bottom
            // const g = tile.graphics; //new HGC.libraries.PIXI.Graphics();
            const rowPosition = model.encodedValue('row', rowCategory);

            data.filter(d => {
                const rowValue = getValueUsingChannel(d, spec.row as Channel);
                return !rowValue || rowValue === rowCategory;
            }).forEach(d => {
                const color = model.encodedPIXIProperty('color', d);
                const stroke = model.encodedPIXIProperty('stroke', d);
                const strokeWidth = model.encodedPIXIProperty('strokeWidth', d);
                const opacity = model.encodedPIXIProperty('opacity');
                const y = model.encodedPIXIProperty('y', d); // TODO: we could even retrieve a actual y position of bars

                const barWidth = model.encodedPIXIProperty('width', d, { tileUnitWidth });
                const xs = model.encodedPIXIProperty('x-start', d, { markWidth: barWidth });
                const barHeight = y - baselineY;
                const ys = rowPosition + rowHeight - barHeight - baselineY;
                const xe = xs + barWidth;

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
                    const farR =
                        trackOuterRadius -
                        ((rowPosition + rowHeight - barHeight - baselineY) / trackHeight) * trackRingSize;
                    const nearR =
                        trackOuterRadius - ((rowPosition + rowHeight - baselineY) / trackHeight) * trackRingSize;

                    const sPos = cartesianToPolar(xs, trackWidth, nearR, cx, cy, startAngle, endAngle);
                    const startRad = valueToRadian(xs, trackWidth, startAngle, endAngle);
                    const endRad = valueToRadian(xs + barWidth, trackWidth, startAngle, endAngle);

                    g.beginFill(colorToHex(color), actualOpacity);
                    g.moveTo(sPos.x, sPos.y);
                    g.arc(cx, cy, nearR, startRad, endRad, true);
                    g.arc(cx, cy, farR, endRad, startRad, false);
                    g.closePath();
                } else {
                    g.beginFill(colorToHex(color), actualOpacity);
                    g.drawRect(xs, rowPosition + rowHeight - barHeight - baselineY, barWidth, barHeight);

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
