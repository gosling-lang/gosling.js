import { GeminiTrackModel } from '../../core/gemini-track-model';
import { getValueUsingChannel, Channel } from '../../core/gemini.schema';
import { VisualProperty } from '../../core/visual-property.schema';
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
    const constantStrokeWidth = tm.encodedProperty('strokeWidth');
    const constantStroke = tm.encodedProperty('stroke');

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
            const cx = tm.encodedProperty('x-center', d);
            const y = tm.encodedProperty('y', d);
            const color = tm.encodedProperty('color', d);
            const size = tm.encodedProperty('size', d);
            const opacity = tm.encodedProperty('opacity', d);

            // Don't draw invisible marks
            if (size === 0 || opacity === 0) return;

            graphics.beginFill(colorToHex(color), opacity);
            graphics.drawCircle(cx, rowPosition + rowHeight - y, size);
        });

        // Because simply scaling row graphics along y axis distort the shape of points, we do not convert graphics to sprites.
        // ...
    });
}

export function pointProperty(
    gm: GeminiTrackModel,
    propertyKey: VisualProperty,
    datum?: { [k: string]: string | number }
) {
    // priority of channels
    switch (propertyKey) {
        case 'x-center':
            return (
                // (1) x + (x1 - x) / 2.0
                gm.visualPropertyByChannel('x1', datum)
                    ? (gm.visualPropertyByChannel('x1', datum) + gm.visualPropertyByChannel('x', datum)) / 2.0
                    : // (2) x
                      gm.visualPropertyByChannel('x', datum)
            );
        default:
            return undefined;
    }
}
