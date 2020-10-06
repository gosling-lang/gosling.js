import { GeminiTrackModel } from '../gemini-track-model';
import { IsChannelDeep } from '../gemini.schema.guards';

export function drawChartOutlines(HGC: any, trackInfo: any, tm: GeminiTrackModel) {
    /* helper */
    const { colorToHex } = HGC.utils;

    const graphics = trackInfo.pBorder; // use pBorder not to affected by zoomming

    // rect outline
    graphics.lineStyle(
        1,
        colorToHex('lightgray'),
        0.3, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.drawRect(trackInfo.position[0], trackInfo.position[1], trackInfo.dimensions[0], trackInfo.dimensions[1]);

    // outlines
    const x = tm.spec().x;
    if (IsChannelDeep(x) && x.axis === 'top') {
        graphics.lineStyle(
            1,
            colorToHex('black'),
            1, // alpha
            0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        // top
        graphics.moveTo(trackInfo.position[0], trackInfo.position[1]);
        graphics.lineTo(trackInfo.position[0] + trackInfo.dimensions[0], trackInfo.position[1]);

        // graphics.lineStyle(
        //     1,
        //     colorToHex('black'),
        //     1, // alpha
        //     1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        // );
        // // left
        // graphics.moveTo(trackInfo.position[0], trackInfo.position[1]);
        // graphics.lineTo(trackInfo.position[0], trackInfo.position[1] + trackInfo.dimensions[1]);
    }
}
