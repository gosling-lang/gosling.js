import { GeminiTrackModel } from '../gemini-track-model';

export function drawBackground(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
    /* helper */
    const { colorToHex } = HGC.utils;

    // size and position
    const [l, t] = trackInfo.position;
    const [w, h] = trackInfo.dimensions;

    const g = tile.graphics;

    if (tm.spec().style?.background) {
        const bg = tm.spec().style?.background;
        // background
        g.lineStyle(
            1,
            colorToHex('white'),
            0, // alpha
            0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        g.beginFill(colorToHex(bg), 1);
        g.drawRect(l, t, w, h);
    }
}
