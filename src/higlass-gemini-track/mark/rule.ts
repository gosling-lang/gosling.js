import { GeminiTrackModel } from '../../lib/gemini-track-model';
import { getValueUsingChannel, Channel } from '../../lib/gemini.schema';
// import { RESOLUTION } from '.';

export function drawRule(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
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

    /* information for rescaling tiles */
    tile.rowScale = tm.getChannelScale('row');
    tile.spriteInfos = []; // sprites for individual rows or columns

    // TODO: this should be supported
    // const yCategories =
    //     IsChannelDeep(spec.y) && spec.y.field
    //         ? Array.from(new Set(data.map(d => getValueUsingChannel(d, spec.y as Channel) as string)))
    //         : ['___SINGLE_Y_POSITION___']; // if `y` is undefined, use only one row internally
    // const cellHeight = rowHeight / yCategories.length;

    /* style */
    const dashed = spec.style?.dashed;
    const linePattern = spec.style?.linePattern;
    const curved = spec.style?.curve;

    /* render */
    rowCategories.forEach(rowCategory => {
        // we are separately drawing each row so that y scale can be more effectively shared across tiles without rerendering from the bottom
        const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics();
        const rowPosition = tm.encodedValue('row', rowCategory);

        // stroke
        // rowGraphics.lineStyle(
        //     tm.encodedValue('strokeWidth'),
        //     colorToHex(tm.encodedValue('stroke')),
        //     1, // alpha
        //     0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        // );

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

            // const size = tm.encodedValue('size');
            const color = tm.encodedValue('color', colorValue);
            const opacity = tm.encodedValue('opacity');
            // const rectHeight = size === undefined ? cellHeight : size;

            rowGraphics.lineStyle(
                tm.encodedValue('strokeWidth'),
                colorToHex(color),
                opacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            if (dashed) {
                const [dashSize, gapSize] = dashed;
                let curPos = x;

                do {
                    rowGraphics.moveTo(curPos, rowPosition + rowHeight - y);
                    rowGraphics.lineTo(curPos + dashSize, rowPosition + rowHeight - y);
                    curPos += dashSize + gapSize;
                } while (curPos < xe);
            } else {
                if (curved === undefined) {
                    rowGraphics.moveTo(x, rowPosition + rowHeight - y);
                    rowGraphics.lineTo(xe, rowPosition + rowHeight - y);
                } else if (curved === 'top') {
                    // TODO: to default value
                    const CURVE_HEIGHT = 2;
                    ///

                    const xm = x + (xe - x) / 2.0;

                    rowGraphics.moveTo(x, rowPosition + rowHeight - y + CURVE_HEIGHT / 2.0);
                    rowGraphics.lineTo(xm, rowPosition + rowHeight - y - CURVE_HEIGHT / 2.0);
                    rowGraphics.moveTo(xm, rowPosition + rowHeight - y - CURVE_HEIGHT / 2.0);
                    rowGraphics.lineTo(xe, rowPosition + rowHeight - y + CURVE_HEIGHT / 2.0);
                }
            }

            // TODO: do not support using pattern with curved
            if (linePattern) {
                const { type: pType, size: pSize } = linePattern;
                let curPos = x;

                rowGraphics.lineStyle(0);

                // TODO: to default value
                const PATTERN_GAP_SIZE = pSize * 2;
                ///

                do {
                    const x0 = curPos;
                    const x1 = curPos + pSize;
                    const ym = rowPosition + rowHeight - y;
                    const y0 = ym - pSize / 2.0;
                    const y1 = ym + pSize / 2.0;

                    rowGraphics.beginFill(colorToHex(color), opacity);
                    rowGraphics.drawPolygon(
                        pType === 'triangle-l' ? [x1, y0, x0, ym, x1, y1, x1, y0] : [x0, y0, x1, ym, x0, y1, x0, y0]
                    );
                    rowGraphics.endFill();
                    curPos += pSize + PATTERN_GAP_SIZE;
                } while (curPos < xe);
            }
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
