import { GeminiTrackModel } from '../../core/gemini-track-model';
import { getValueUsingChannel, Channel } from '../../core/gemini.schema';
// import { RESOLUTION } from '.';

export function drawPoint(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = tm.data();

    /* track size */
    const trackHeight = trackInfo.dimensions[1];

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* information for rescaling tiles */
    tile.rowScale = tm.getChannelScale('row');
    tile.spriteInfos = []; // sprites for individual rows or columns

    /* constant values */
    const constantStrokeWidth = tm.visualProperty('strokeWidth');
    const constantStroke = tm.visualProperty('stroke');

    const graphics = tile.graphics;

    // stroke
    graphics.lineStyle(
        constantStrokeWidth,
        colorToHex(constantStroke),
        1, // alpha
        1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );

    /* render */
    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const cx = tm.visualProperty('x-center', d);
            const y = tm.visualProperty('y', d);
            const color = tm.visualProperty('color', d);
            const size = tm.visualProperty('size', d);
            const opacity = tm.visualProperty('opacity', d);

            // Don't draw invisible marks
            if (size === 0 || opacity === 0) return;

            graphics.beginFill(colorToHex(color), opacity);
            graphics.drawCircle(cx, rowPosition + rowHeight - y, size);
        });

        // Because simply scaling row graphics along y axis distort the shape of points, we do not convert graphics to sprites.
        // ...
    });
}
