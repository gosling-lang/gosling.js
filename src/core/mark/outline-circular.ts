import { GeminiTrackModel } from '../gemini-track-model';

export function drawCircularOutlines(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* track size */
    const trackWidth = trackInfo.dimensions[0];
    const trackHeight = trackInfo.dimensions[1];
    // const tileSize = trackInfo.tilesetInfo.tile_size;
    // const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
    //     tile.tileData.zoomLevel,
    //     tile.tileData.tilePos,
    //     tileSize
    // );

    // EXPERIMENTAL PARAMETERS
    const innerRadius = spec.innerRadius ?? 220; // TODO: should default values be filled already
    const outerRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const ringWidth = outerRadius - innerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;
    const gapRadian = 0.04;

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

    /* render */
    const graphics = tile.graphics;

    graphics.lineStyle(
        1,
        colorToHex(spec.style?.outline ?? '#DBDBDB'),
        0.4, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.beginFill(colorToHex('white'), 0);
    graphics.moveTo(xToPos(0, outerRadius - ringWidth).x, xToPos(0, outerRadius - ringWidth).y);
    graphics.arc(cx, cy, outerRadius - ringWidth, xToDt(0), xToDt(trackWidth), true);
    graphics.arc(cx, cy, outerRadius, xToDt(trackWidth), xToDt(0), false);
    graphics.closePath();

    // outer line
    graphics.lineStyle(
        0.5,
        colorToHex('black'),
        0, // 1, // alpha
        0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.beginFill(colorToHex('white'), 0);
    graphics.moveTo(xToPos(0, outerRadius - 0.5).x, xToPos(0, outerRadius - 0.5).y);
    graphics.arc(cx, cy, outerRadius - 0.5, xToDt(0), xToDt(trackWidth), true);
    graphics.arc(cx, cy, outerRadius, xToDt(trackWidth), xToDt(0), false);
    graphics.closePath();

    // inner line
    // graphics.lineStyle(
    //     0.5,
    //     colorToHex('black'),
    //     1, // alpha
    //     0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    // );
    // graphics.beginFill(colorToHex('white'), 0);
    // graphics.moveTo(xToPos(0, innerRadius - 0.5).x, xToPos(0, innerRadius - 0.5).y);
    // graphics.arc(cx, cy, innerRadius - 0.5, xToDt(0), xToDt(trackWidth), true);
    // graphics.arc(cx, cy, innerRadius, xToDt(trackWidth), xToDt(0), false);
    // graphics.closePath();

    // slice on the top
    graphics.lineStyle(
        0.5,
        colorToHex('black'),
        0, // alpha
        0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.beginFill(colorToHex('white'), 1);
    graphics.moveTo(cx, cy);
    graphics.arc(cx, cy, outerRadius + 3, xToDt(0), xToDt(trackWidth), false);
    graphics.closePath();

    // center white hole
    graphics.lineStyle(
        1,
        colorToHex('#DBDBDB'),
        0, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.beginFill(colorToHex('white'), 1);
    graphics.drawCircle(cx, cy, innerRadius - 1);
}
