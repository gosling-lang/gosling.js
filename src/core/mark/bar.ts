import { GoslingTrackModel } from '../gosling-track-model';
import { Channel } from '../gosling.schema';
import { group } from 'd3-array';
import { PIXIVisualProperty } from '../visual-property.schema';
import { IsChannelDeep, IsStackedMark, getValueUsingChannel } from '../gosling.schema.guards';
import { cartesianToPolar, valueToRadian } from '../utils/polar';

export function drawBar(HGC: any, trackInfo: any, tile: any, tm: GoslingTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = tm.data();

    /* track size */
    const trackWidth = trackInfo.dimensions[0];
    const trackHeight = trackInfo.dimensions[1];
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
    const xScale = tm.getChannelScale('x');
    const tileUnitWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* baseline */
    const baselineValue = IsChannelDeep(spec.y) ? spec.y?.baseline : undefined;
    const baselineY = tm.encodedValue('y', baselineValue) ?? 0;

    /* render */
    if (IsStackedMark(spec)) {
        // TODO: many parts in this scope are identical to the below `else` statement, so encaptulate this?
        const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics(); // only one row for stacked marks

        const genomicChannel = tm.getGenomicChannel();
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
                const color = tm.encodedPIXIProperty('color', d);
                const stroke = tm.encodedPIXIProperty('stroke', d);
                const strokeWidth = tm.encodedPIXIProperty('strokeWidth', d);
                const opacity = tm.encodedPIXIProperty('opacity', d);
                const y = tm.encodedPIXIProperty('y', d);

                const barWidth = tm.encodedPIXIProperty('width', d, { tileUnitWidth });
                const barStartX = tm.encodedPIXIProperty('x-start', d, { markWidth: barWidth });

                const alphaTransition = tm.markVisibility(d, {
                    width: barWidth,
                    zoomLevel: trackInfo._xScale.invert(trackWidth) - trackInfo._xScale.invert(0)
                });
                const actualOpacity = Math.min(alphaTransition, opacity);

                if (actualOpacity === 0 || barWidth <= 0 || y <= 0) {
                    // do not draw invisible marks
                    return;
                }

                rowGraphics.lineStyle(
                    strokeWidth,
                    colorToHex(stroke),
                    actualOpacity,
                    0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );

                if (circular) {
                    const farR = trackOuterRadius - ((rowHeight - prevYEnd) / trackHeight) * trackRingSize;
                    const nearR = trackOuterRadius - ((rowHeight - y - prevYEnd) / trackHeight) * trackRingSize;
                    const sPos = cartesianToPolar(barStartX, trackWidth, nearR, cx, cy, startAngle, endAngle);
                    const startRad = valueToRadian(barStartX, trackWidth, startAngle, endAngle);
                    const endRad = valueToRadian(barStartX + barWidth, trackWidth, startAngle, endAngle);

                    rowGraphics.beginFill(colorToHex(color), actualOpacity);
                    rowGraphics.moveTo(sPos.x, sPos.y);
                    rowGraphics.arc(cx, cy, nearR, startRad, endRad, true);
                    rowGraphics.arc(cx, cy, farR, endRad, startRad, false);
                    rowGraphics.closePath();
                } else {
                    rowGraphics.beginFill(colorToHex(color), opacity);
                    rowGraphics.drawRect(barStartX, rowHeight - y - prevYEnd, barWidth, y);
                }

                prevYEnd += y;
            });
        });
    } else {
        rowCategories.forEach(rowCategory => {
            // we are separately drawing each row so that y scale can be more effectively shared across tiles without rerendering from the bottom
            const rowGraphics = tile.graphics; //new HGC.libraries.PIXI.Graphics();
            const rowPosition = tm.encodedValue('row', rowCategory);

            data.filter(
                d =>
                    !getValueUsingChannel(d, spec.row as Channel) ||
                    (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
            ).forEach(d => {
                const color = tm.encodedPIXIProperty('color', d);
                const stroke = tm.encodedPIXIProperty('stroke', d);
                const strokeWidth = tm.encodedPIXIProperty('strokeWidth', d);
                const opacity = tm.encodedPIXIProperty('opacity');
                const y = tm.encodedPIXIProperty('y', d); // TODO: we could even retrieve a actual y position of bars

                const barWidth = tm.encodedPIXIProperty('width', d, { tileUnitWidth });
                const barStartX = tm.encodedPIXIProperty('x-start', d, { markWidth: barWidth });
                const barHeight = y - baselineY;

                const alphaTransition = tm.markVisibility(d, { width: barWidth });
                const actualOpacity = Math.min(alphaTransition, opacity);

                if (actualOpacity === 0 || barWidth === 0 || y === 0) {
                    // do not draw invisible marks
                    return;
                }

                rowGraphics.lineStyle(
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
                    const sPos = cartesianToPolar(barStartX, trackWidth, nearR, cx, cy, startAngle, endAngle);
                    const startRad = valueToRadian(barStartX, trackWidth, startAngle, endAngle);
                    const endRad = valueToRadian(barStartX + barWidth, trackWidth, startAngle, endAngle);

                    rowGraphics.beginFill(colorToHex(color), actualOpacity);
                    rowGraphics.moveTo(sPos.x, sPos.y);
                    rowGraphics.arc(cx, cy, nearR, startRad, endRad, true);
                    rowGraphics.arc(cx, cy, farR, endRad, startRad, false);
                    rowGraphics.closePath();
                } else {
                    rowGraphics.beginFill(colorToHex(color), opacity);
                    rowGraphics.drawRect(
                        barStartX,
                        rowPosition + rowHeight - barHeight - baselineY,
                        barWidth,
                        barHeight
                    );
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
