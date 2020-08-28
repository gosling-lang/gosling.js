import { GeminiTrackModel } from '../../lib/gemini-track-model';
import { IsChannelDeep, getValueUsingChannel, Channel, IsStackedMark } from '../../lib/gemini.schema';
import { group } from 'd3-array';
// import { RESOLUTION } from '.';

export function drawBar(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
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
    const barWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories =
        IsChannelDeep(spec.row) && spec.row.field
            ? Array.from(new Set(data.map(d => getValueUsingChannel(d, spec.row as Channel) as string)))
            : ['___SINGLE_ROW___']; // if `row` is undefined, use only one row internally

    const rowHeight = trackHeight / rowCategories.length;

    /* information for rescaling tiles */
    tile.rowScale = tm.getChannelScale('row');
    tile.spriteInfos = []; // sprites for individual rows or columns

    /* background */
    if (tm.encodedValue('background')) {
        tile.graphics.beginFill(colorToHex(tm.encodedValue('background')), 1);
        tile.graphics.drawRect(xScale(tileX), 0, xScale(tileX + tileWidth) - xScale(tileX), trackHeight);
    }

    /* render */
    if (IsStackedMark(spec)) {
        // TODO: many parts in this scope are identical as the below `else` statement, so encaptulate this?
        const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics(); // only one row for stacked marks

        const genomicChannel = tm.getGenomicChannel();
        if (!genomicChannel || !genomicChannel.field) {
            console.warn('Genomic field is not provided in the specification');
            return;
        }
        const pivotedData = group(data, d => d[genomicChannel.field as string]);
        const xKeys = [...pivotedData.keys()];

        // stroke
        rowGraphics.lineStyle(
            tm.encodedValue('strokeWidth'),
            colorToHex(tm.encodedValue('stroke')),
            1, // alpha
            1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );

        // TODO: users may want to align rows by values
        xKeys.forEach(k => {
            let prevYEnd = 0;
            pivotedData.get(k)?.forEach(d => {
                const xValue = getValueUsingChannel(d, spec.x as Channel) as number;
                const yValue = getValueUsingChannel(d, spec.y as Channel) as string | number;
                const colorValue = getValueUsingChannel(d, spec.color as Channel) as string;

                const x = xScale(xValue);
                const y = tm.encodedValue('y', yValue);
                const color = tm.encodedValue('color', colorValue);
                const opacity = tm.encodedValue('opacity');

                // pixi
                rowGraphics.beginFill(colorToHex(color), opacity);
                rowGraphics.drawRect(x - barWidth / 2.0, rowHeight - y - prevYEnd, barWidth, y);

                // svg
                trackInfo.addSVGInfo(tile, x - barWidth / 2.0, rowHeight - y - prevYEnd, barWidth, y, color);

                prevYEnd += y;
            });
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
        // sprite.y = 0;
        // sprite.height = rowHeight;

        // tile.spriteInfos.push({ sprite: sprite, scaleKey: undefined });
        // tile.graphics.addChild(sprite);
    } else {
        rowCategories.forEach(rowCategory => {
            // we are separately drawing each row so that y scale can be more effectively shared across tiles without rerendering from the bottom
            const rowGraphics = tile.graphics; //new HGC.libraries.PIXI.Graphics();
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

                const x = xScale(xValue);
                const y = tm.encodedValue('y', yValue);
                const color = tm.encodedValue('color', colorValue);
                const opacity = tm.encodedValue('opacity');

                // pixi
                rowGraphics.beginFill(colorToHex(color), opacity);
                rowGraphics.drawRect(x - barWidth / 2.0, rowHeight + rowPosition - y, barWidth, y);

                // svg
                trackInfo.addSVGInfo(tile, x - barWidth / 2.0, rowHeight + rowPosition - y, barWidth, y, color);
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
}
