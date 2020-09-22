import { GeminiTrackModel } from '../../core/gemini-track-model';
import { getValueUsingChannel, Channel } from '../../core/gemini.schema';
// import { RESOLUTION } from '.';

export function drawLine(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = tm.data();

    /* track size */
    const trackHeight = trackInfo.dimensions[1];
    const tileSize = trackInfo.tilesetInfo.tile_size;
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        tileSize
    );

    /* genomic scale */
    const xScale = tm.getChannelScale('x');

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* color separation */
    const colorCategories = (tm.getChannelDomainArray('color') as string[]) ?? ['___SINGLE_COLOR___'];

    /* information for rescaling tiles */
    tile.rowScale = tm.getChannelScale('row');
    tile.spriteInfos = []; // sprites for individual rows or columns

    /* background */
    if (tm.encodedValue('background')) {
        tile.graphics.beginFill(colorToHex(tm.encodedValue('background')), 1);
        tile.graphics.drawRect(xScale(tileX), 0, xScale(tileX + tileWidth) - xScale(tileX), trackHeight);
    }

    /* render */
    rowCategories.forEach(rowCategory => {
        // we are separately drawing each row so that y scale can be more effectively shared across tiles without rerendering from the bottom
        const rowGraphics = tile.graphics;
        const rowPosition = tm.encodedValue('row', rowCategory);

        // line marks are drawn for each color
        colorCategories.forEach(colorCategory => {
            data.filter(
                d =>
                    (!getValueUsingChannel(d, spec.row as Channel) ||
                        (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory) &&
                    (!getValueUsingChannel(d, spec.color as Channel) ||
                        (getValueUsingChannel(d, spec.color as Channel) as string) === colorCategory)
            )
                .sort(
                    (d1, d2) =>
                        // draw from the left to right
                        (getValueUsingChannel(d1, spec.x as Channel) as number) -
                        (getValueUsingChannel(d2, spec.x as Channel) as number)
                )
                .forEach((d, i) => {
                    const x = tm.encodedProperty('x', d);
                    const y = tm.encodedProperty('y', d);
                    const size = tm.encodedProperty('size', d);
                    const color = tm.encodedProperty('color', d); // should be identical for a single line
                    const opacity = tm.encodedProperty('opacity', d);

                    rowGraphics.lineStyle(
                        size,
                        colorToHex(color),
                        opacity,
                        1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                    );

                    if (i === 0) {
                        rowGraphics.moveTo(x, rowPosition + rowHeight - y);
                    } else {
                        rowGraphics.lineTo(x, rowPosition + rowHeight - y);
                    }
                });
        });
    });
}
