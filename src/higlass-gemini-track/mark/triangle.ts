import { GeminiTrackModel } from '../../lib/gemini-track-model';
import { IsChannelDeep, getValueUsingChannel, Channel, MarkType } from '../../lib/gemini.schema';
// import { RESOLUTION } from '.';

export function drawTriangle(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
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
    const xScale = trackInfo._xScale;
    const markWidth = tm.encodedValue('size') ?? xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    // IsChannelDeep(spec.row) && spec.row.field
    //     ? Array.from(new Set(data.map(d => getValueUsingChannel(d, spec.row as Channel) as string)))
    //     : ['___SINGLE_ROW___']; // if `row` is undefined, use only one row internally

    const rowHeight = trackHeight / rowCategories.length;

    /* information for rescaling tiles */
    tile.rowScale = tm.getChannelScale('row');
    tile.spriteInfos = []; // sprites for individual rows or columns

    // TODO: what is quantitative Y field is used for heatmap?
    const yCategories =
        IsChannelDeep(spec.y) && spec.y.field
            ? Array.from(new Set(data.map(d => getValueUsingChannel(d, spec.y as Channel) as string)))
            : ['___SINGLE_Y_POSITION___']; // if `y` is undefined, use only one row internally
    const triHeight = tm.encodedValue('size') ?? rowHeight / yCategories.length;

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
            0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const xValue = getValueUsingChannel(d, spec.x as Channel) as number;
            const xeValue = getValueUsingChannel(d, spec.xe as Channel) as number;
            const yValue = getValueUsingChannel(d, spec.y as Channel) as string | number;
            const colorValue = getValueUsingChannel(d, spec.color as Channel) as string;

            const x = xScale(xValue);
            const xe = xScale(xeValue);
            const y = tm.encodedValue('y', yValue);
            const color = tm.encodedValue('color', colorValue);
            const opacity = tm.encodedValue('opacity');

            const x0 = x ? x : xe - markWidth;
            const x1 = xe ? xe : x + markWidth;
            const xm = x0 + (x1 - x0) / 2.0;
            const ym = rowPosition + y;
            const y0 = rowPosition + y - triHeight / 2.0;
            const y1 = rowPosition + y + triHeight / 2.0;

            const markToPoints = {
                'triangle-l': [x1, y0, x0, ym, x1, y1, x1, y0],
                'triangle-r': [x0, y0, x1, ym, x0, y1, x0, y0],
                'triangle-d': [x0, y0, x1, y0, xm, y1, x0, y0]
            };
            rowGraphics.beginFill(colorToHex(color), opacity);
            rowGraphics.drawPolygon((markToPoints as any)[spec.mark as MarkType]);
            rowGraphics.endFill();
        });

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
