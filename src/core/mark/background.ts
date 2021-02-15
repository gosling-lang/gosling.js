import { isUndefined } from 'lodash';
import { GoslingTrackModel } from '../gosling-track-model';
import colorToHex from '../utils/color-to-hex';

export function drawBackground(HGC: any, trackInfo: any, tile: any, tm: GoslingTrackModel) {
    // size and position
    const [l, t] = trackInfo.position;
    const [w, h] = trackInfo.dimensions;

    // refer to https://github.com/higlass/higlass/blob/f82c0a4f7b2ab1c145091166b0457638934b15f3/app/scripts/PixiTrack.js#L129
    const g = trackInfo.pBackground;

    if (tm.spec().style?.background) {
        g.clear();

        const bg = tm.spec().style?.background ?? 'white';
        const alpha = isUndefined(tm.spec().style?.backgroundOpacity) ? 1 : tm.spec().style?.backgroundOpacity;
        // background
        g.lineStyle(
            1,
            colorToHex('white'),
            0, // alpha
            0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        g.beginFill(colorToHex(bg), alpha);
        g.drawRect(l, t, w, h);
    }
}
