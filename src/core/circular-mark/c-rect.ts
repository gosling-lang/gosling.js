import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import { getValueUsingChannel } from '../gemini.schema.guards';

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

    // EXPERIMENTAL PARAMETERS
    const innerRadius = spec.innerRadius ?? 220; // TODO: should default values be filled already
    const outerRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const ringWidth = outerRadius - innerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;
    const gapRadian = 0.04;

    /* genomic scale */
    const xScale = trackInfo._xScale;
    const tileUnitWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = ringWidth / rowCategories.length;

    // TODO: what if quantitative Y field is used?
    const yCategories = (tm.getChannelDomainArray('y') as string[]) ?? ['___SINGLE_Y_POSITION___'];
    const cellHeight = rowHeight / yCategories.length;

    /* constant values */
    const strokeWidth = tm.encodedProperty('strokeWidth');
    const stroke = tm.encodedValue('stroke');

    // TODO: move the `polar.ts`
    const xToDt = (x: number) => {
        const safeX = Math.max(Math.min(trackWidth, x), 0);
        return (-safeX / trackWidth) * (Math.PI * 2 - gapRadian * 2) - Math.PI / 2.0 - gapRadian;
    };
    const xToPos = (x: number, r: number) => {
        return {
            x: cx + r * Math.cos(xToDt(x)),
            y: cy + r * Math.sin(xToDt(x))
        };
    };

    const graphics = tile.graphics;

    /* render */
    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const x = tm.encodedProperty('x', d);
            // const xe = tm.encodedProperty('xe', d);
            // const y = tm.encodedProperty('y', d);
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

            const longRadius = outerRadius - (rowPosition / 640) * ringWidth;
            const shortRadius = outerRadius - ((rowPosition / 640) * ringWidth + rectHeight);

            graphics.beginFill(colorToHex(color), actualOpacity);
            graphics.moveTo(xToPos(x, shortRadius).x, xToPos(x, shortRadius).y);
            graphics.arc(cx, cy, shortRadius, xToDt(x), xToDt(x + rectWidth), true);
            graphics.arc(cx, cy, longRadius, xToDt(x + rectWidth), xToDt(x), false);
            graphics.closePath();
        });
    });

    // outline
    graphics.lineStyle(
        1,
        colorToHex('#DBDBDB'),
        0.7, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.beginFill(colorToHex('white'), 0);
    graphics.moveTo(xToPos(0, outerRadius - ringWidth).x, xToPos(0, outerRadius - ringWidth).y);
    graphics.arc(cx, cy, outerRadius - ringWidth, xToDt(0), xToDt(trackWidth), true);
    graphics.arc(cx, cy, outerRadius, xToDt(trackWidth), xToDt(0), false);
    graphics.closePath();

    tile.graphics.lineStyle(
        0.5,
        colorToHex('black'),
        1, // alpha
        0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.beginFill(colorToHex('white'), 0);
    graphics.moveTo(xToPos(0, outerRadius - 0.5).x, xToPos(0, outerRadius - 0.5).y);
    graphics.arc(cx, cy, outerRadius - 0.5, xToDt(0), xToDt(trackWidth), true);
    graphics.arc(cx, cy, outerRadius, xToDt(trackWidth), xToDt(0), false);
    graphics.closePath();

    // center white hole
    // tile.graphics.lineStyle(
    //     1,
    //     colorToHex('#DBDBDB'),
    //     0.7, // alpha
    //     0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    // );
    // tile.graphics.beginFill(colorToHex('white'), 1);
    // tile.graphics.drawCircle(CX, CY, 250);
}
