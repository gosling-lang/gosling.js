import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import { getValueUsingChannel } from '../gemini.schema.guards';

export function drawLink(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = tm.data();

    /* track size */
    const trackHeight = trackInfo.dimensions[1];
    // const tileSize = trackInfo.tilesetInfo.tile_size;
    // const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
    //     tile.tileData.zoomLevel,
    //     tile.tileData.tilePos,
    //     tileSize
    // );

    /* genomic scale */
    const xScale = trackInfo._xScale;
    // const barWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    // TODO: what is quantitative Y field is used for heatmap?
    // const yCategories =
    //     IsChannelDeep(spec.y) && spec.y.field
    //         ? Array.from(new Set(data.map(d => getValueUsingChannel(d, spec.y as Channel) as string)))
    //         : ['___SINGLE_Y_POSITION___']; // if `y` is undefined, use only one row internally
    // const cellHeight = rowHeight / yCategories.length;

    /* render */
    rowCategories.forEach(rowCategory => {
        // we are separately drawing each row so that y scale can be more effectively shared across tiles without rerendering from the bottom
        const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics();
        const rowPosition = tm.encodedValue('row', rowCategory);

        // stroke
        rowGraphics.lineStyle(
            tm.encodedValue('strokeWidth'),
            colorToHex(tm.encodedValue('stroke')),
            1, // alpha
            0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const xValue = getValueUsingChannel(d, spec.x as Channel) as number;
            const xeValue = getValueUsingChannel(d, spec.xe as Channel) as number;
            const x1Value = getValueUsingChannel(d, spec.x1 as Channel) as number;
            const x1eValue = getValueUsingChannel(d, spec.x1e as Channel) as number;
            // const yValue = getValueUsingChannel(d, spec.y as Channel) as string | number;
            // TODO: support y1, y1e
            const colorValue = getValueUsingChannel(d, spec.color as Channel) as string;

            const x = xScale(xValue);
            const xe = xScale(xeValue);
            const x1 = xScale(x1Value);
            const x1e = xScale(x1eValue);
            // const y = tm.encodedValue('y', yValue);

            // const size = tm.encodedValue('size');
            const color = tm.encodedValue('color', colorValue);
            const opacity = tm.encodedValue('opacity');
            // const rectHeight = size === undefined ? cellHeight : size;

            if (x1Value !== undefined && x1eValue !== undefined && xValue !== x1Value && xeValue !== x1eValue) {
                rowGraphics.beginFill(colorToHex(color), opacity);
                rowGraphics.moveTo(x, rowPosition + rowHeight);
                rowGraphics.lineTo(x1, rowPosition + rowHeight);
                rowGraphics.bezierCurveTo(
                    x1 + (xe - x1) / 3.0,
                    // rowPosition + (x1 - x),
                    rowPosition + rowHeight - (xe - x1) / 2.0, //Math.min(rowHeight - (x1 - x), (xe - x1) / 2.0),
                    x1 + ((xe - x1) / 3.0) * 2,
                    // rowPosition + (x1 - x),
                    rowPosition + rowHeight - (xe - x1) / 2.0, //Math.min(rowHeight - (x1 - x), (xe - x1) / 2.0),
                    xe,
                    rowPosition + rowHeight
                );
                rowGraphics.lineTo(x1e, rowPosition + rowHeight);
                rowGraphics.bezierCurveTo(
                    x + ((x1e - x) / 3.0) * 2,
                    // rowPosition,
                    rowPosition + rowHeight - (x1e - x) / 2.0, //Math.min(rowHeight, (x1e - x) / 2.0),
                    x + (x1e - x) / 3.0,
                    // rowPosition,
                    rowPosition + rowHeight - (x1e - x) / 2.0, //Math.min(rowHeight, (x1e - x) / 2.0),
                    x,
                    rowPosition + rowHeight
                );
                rowGraphics.endFill();
            } else {
                rowGraphics.moveTo(x, rowPosition + rowHeight);
                rowGraphics.bezierCurveTo(
                    x + (xe - x) / 3.0,
                    // rowPosition,
                    rowPosition + rowHeight - Math.min(rowHeight, (xe - x) / 2.0),
                    x + ((xe - x) / 3.0) * 2,
                    // rowPosition,
                    rowPosition + rowHeight - Math.min(rowHeight, (xe - x) / 2.0),
                    xe,
                    rowPosition + rowHeight
                );
            }
        });
    });
}
