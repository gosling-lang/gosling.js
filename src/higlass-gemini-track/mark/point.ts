import { GeminiTrackModel } from '../../lib/gemini-track-model';
import { IsChannelDeep, getValueUsingChannel, Channel } from '../../lib/gemini.schema';
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

    /* genomic scale */
    const xScale = trackInfo._xScale;

    /* row separation */
    const rowCategories =
        IsChannelDeep(spec.row) && spec.row.field
            ? Array.from(new Set(data.map(d => getValueUsingChannel(d, spec.row as Channel) as string)))
            : ['___SINGLE_ROW___']; // if `row` is undefined, use only one row internally

    const rowHeight = trackHeight / rowCategories.length;

    /* information for rescaling tiles */
    tile.rowScale = tm.getChannelScale('row');
    tile.spriteInfos = []; // sprites for individual rows or columns

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
            1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const xValue = getValueUsingChannel(d, spec.x as Channel) as number;
            const yValue = getValueUsingChannel(d, spec.y as Channel) as string | number;
            const colorValue = getValueUsingChannel(d, spec.color as Channel) as string;
            const sizeValue = getValueUsingChannel(d, spec.size as Channel) as number;

            const x = xScale(xValue);
            const y = tm.encodedValue('y', yValue);
            const color = tm.encodedValue('color', colorValue);
            const size = tm.encodedValue('size', sizeValue);
            const opacity = tm.encodedValue('opacity');

            // don't draw zero values
            // TODO: this should be included in the users' spec
            if (yValue === 0 || size === 0 || opacity === 0) return;

            rowGraphics.beginFill(colorToHex(color), opacity);
            rowGraphics.drawCircle(x, rowPosition + rowHeight - y, size);
        });

        // Because simply scaling row graphics along y axis distort the shape of points,
        // we do not convert graphics to sprites.

        // add graphics of this row
        // const texture = HGC.services.pixiRenderer.generateTexture(
        //     rowGraphics,
        //     HGC.libraries.PIXI.SCALE_MODES.NEAREST,
        //     RESOLUTION
        // );
        // const sprite = new HGC.libraries.PIXI.Sprite(texture);

        // sprite.width = xScale(tileX + tileWidth) - xScale(tileX);
        // sprite.x = xScale(tileX);
        // sprite.y = rowPosition;
        // sprite.height = rowHeight;

        // tile.spriteInfos.push({ sprite: sprite, scaleKey: rowCategory });
        // tile.graphics.addChild(sprite);
    });
}
