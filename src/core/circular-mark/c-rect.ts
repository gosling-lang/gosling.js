import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import { getValueUsingChannel } from '../gemini.schema.guards';
import { cartesianToPolar, valueToRadian } from '../utils/polar';

export function drawCircularRect(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
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
    const xScale = trackInfo._xScale;
    const tileUnitWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowRingSize = trackRingSize / rowCategories.length;

    // TODO: what if quantitative Y field is used?
    const yCategories = (tm.getChannelDomainArray('y') as string[]) ?? ['___SINGLE_Y_POSITION___'];
    const cellHeight = rowRingSize / yCategories.length;

    /* constant values */
    const strokeWidth = tm.encodedProperty('strokeWidth');
    const stroke = tm.encodedValue('stroke');

    /* render */
    const graphics = tile.graphics;
    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const x = tm.encodedProperty('x', d);
            const color = tm.encodedProperty('color', d);
            const opacity = tm.encodedProperty('opacity', d);
            const rectWidth = tm.encodedProperty('width', d, { markWidth: tileUnitWidth });
            const rectHeight = tm.encodedProperty('height', d, { markHeight: cellHeight });

            const alphaTransition = tm.markVisibility(d, { width: rectWidth });
            const actualOpacity = Math.min(alphaTransition, opacity);

            if (actualOpacity === 0 || rectHeight === 0 || rectWidth === 0) {
                // do not need to draw invisible objects
                return;
            }

            if (x + rectWidth < 0 || trackWidth < x) {
                // do not draw overflewed visual marks
                return;
            }

            // stroke
            graphics.lineStyle(
                strokeWidth,
                colorToHex(stroke),
                actualOpacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            // TODO: encaptulate this
            const farR = trackOuterRadius - (rowPosition / trackHeight) * trackRingSize;
            const nearR = trackOuterRadius - ((rowPosition / trackHeight) * trackRingSize + rectHeight);
            const sPos = cartesianToPolar(x, trackWidth, nearR, cx, cy);
            const startRad = valueToRadian(x, trackWidth);
            const endRad = valueToRadian(x + rectWidth, trackWidth);

            graphics.beginFill(colorToHex(color), actualOpacity);
            graphics.moveTo(sPos.x, sPos.y);
            graphics.arc(cx, cy, nearR, startRad, endRad, true);
            graphics.arc(cx, cy, farR, endRad, startRad, false);
            graphics.closePath();
        });
    });
}
