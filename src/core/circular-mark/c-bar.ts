import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import { group } from 'd3-array';
import { IsChannelDeep, IsStackedMark, getValueUsingChannel } from '../gemini.schema.guards';
import { cartesianToPolar, valueToRadian } from '../utils/polar';

export function drawCircularBar(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
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
    const trackInnerRadius = spec.innerRadius ?? 220; // TODO: should default values be filled already
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    /* genomic scale */
    const xScale = tm.getChannelScale('x');
    const tileUnitWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* information for rescaling tiles */
    tile.rowScale = tm.getChannelScale('row');
    tile.spriteInfos = []; // sprites for individual rows or columns

    /* background */
    if (tm.encodedValue('background')) {
        tile.graphics.beginFill(colorToHex(tm.encodedValue('background')), 1);
        tile.graphics.drawRect(xScale(tileX), 0, xScale(tileX + tileWidth) - xScale(tileX), trackHeight);
    }

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
                const color = tm.encodedProperty('color', d);
                const stroke = tm.encodedProperty('stroke', d);
                const strokeWidth = tm.encodedProperty('strokeWidth', d);
                const opacity = tm.encodedProperty('opacity', d);
                const y = tm.encodedProperty('y', d);

                const barWidth = tm.encodedProperty('width', d, { tileUnitWidth });
                const barStartX = tm.encodedProperty('x-start', d, { markWidth: barWidth });

                const alphaTransition = tm.markVisibility(d, { width: barWidth });
                const actualOpacity = Math.min(alphaTransition, opacity);

                if (actualOpacity === 0 || barWidth <= 0 || y <= 0) {
                    // do not draw invisible marks
                    return;
                }

                // pixi
                rowGraphics.lineStyle(
                    strokeWidth,
                    colorToHex(stroke),
                    actualOpacity,
                    0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );

                // TODO: encaptulate this
                const farR = trackOuterRadius - ((rowHeight - prevYEnd) / trackHeight) * trackRingSize;
                const nearR = trackOuterRadius - ((rowHeight - y - prevYEnd) / trackHeight) * trackRingSize;
                const sPos = cartesianToPolar(barStartX, trackWidth, nearR, cx, cy);
                const startRad = valueToRadian(barStartX, trackWidth);
                const endRad = valueToRadian(barStartX + barWidth, trackWidth);

                rowGraphics.lineStyle(
                    strokeWidth,
                    colorToHex(stroke),
                    actualOpacity,
                    0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );
                rowGraphics.beginFill(colorToHex(color), actualOpacity);
                rowGraphics.moveTo(sPos.x, sPos.y);
                rowGraphics.arc(cx, cy, nearR, startRad, endRad, true);
                rowGraphics.arc(cx, cy, farR, endRad, startRad, false);
                rowGraphics.closePath();

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
                const color = tm.encodedProperty('color', d);
                const stroke = tm.encodedProperty('stroke', d);
                const strokeWidth = tm.encodedProperty('strokeWidth', d);
                const opacity = tm.encodedProperty('opacity');
                const y = tm.encodedProperty('y', d); // TODO: we could even retrieve a actual y position of bars

                const barWidth = tm.encodedProperty('width', d, { tileUnitWidth });
                const barStartX = tm.encodedProperty('x-start', d, { markWidth: barWidth });
                const barHeight = y - baselineY;

                const alphaTransition = tm.markVisibility(d, { width: barWidth });
                const actualOpacity = Math.min(alphaTransition, opacity);

                if (actualOpacity === 0 || barWidth === 0 || y === 0) {
                    // do not draw invisible marks
                    return;
                }

                // TODO: encaptulate this
                const farR =
                    trackOuterRadius -
                    ((rowPosition + rowHeight - barHeight - baselineY) / trackHeight) * trackRingSize;
                const nearR = trackOuterRadius - ((rowPosition + rowHeight - baselineY) / trackHeight) * trackRingSize;
                const sPos = cartesianToPolar(barStartX, trackWidth, nearR, cx, cy);
                const startRad = valueToRadian(barStartX, trackWidth);
                const endRad = valueToRadian(barStartX + barWidth, trackWidth);

                rowGraphics.lineStyle(
                    strokeWidth,
                    colorToHex(stroke),
                    actualOpacity,
                    0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );
                rowGraphics.beginFill(colorToHex(color), actualOpacity);
                rowGraphics.moveTo(sPos.x, sPos.y);
                rowGraphics.arc(cx, cy, nearR, startRad, endRad, true);
                rowGraphics.arc(cx, cy, farR, endRad, startRad, false);
                rowGraphics.closePath();
            });
        });
    }
}
