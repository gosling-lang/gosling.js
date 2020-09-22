import { GeminiTrackModel } from '../../core/gemini-track-model';
import { IsChannelDeep, getValueUsingChannel, Channel, IsStackedMark } from '../../core/gemini.schema';
import { group } from 'd3-array';
import { VisualProperty } from '../../core/visual-property.schema';
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
    const xScale = tm.getChannelScale('x');
    const tileUnitWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* information for rescaling tiles */
    tile.rowScale = tm.getChannelScale('row');
    tile.spriteInfos = []; // sprites for individual rows or columns

    /* background */
    if (tm.encodedValue('background')) {
        tile.graphics.beginFill(colorToHex(tm.encodedValue('background')), 1);
        tile.graphics.drawRect(xScale(tileX), 0, xScale(tileX + tileWidth) - xScale(tileX), trackHeight);
    }

    /* baseline */
    const baselineValue = IsChannelDeep(spec.y) ? spec.y?.baseline : undefined;
    const baselineY = tm.encodedValue('y', baselineValue) ?? 0;

    /* render */
    if (IsStackedMark(spec)) {
        // TODO: many parts in this scope are identical to the below `else` statement, so encaptulate this?
        const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics(); // only one row for stacked marks

        const genomicChannel = tm.getGenomicChannel();
        if (!genomicChannel || !genomicChannel.field) {
            console.warn('Genomic field is not provided in the specification');
            return;
        }
        const pivotedData = group(data, d => d[genomicChannel.field as string]);
        const xKeys = [...pivotedData.keys()];

        // TODO: users may want to align rows by values
        xKeys.forEach(k => {
            let prevYEnd = 0;
            pivotedData.get(k)?.forEach(d => {
                const color = tm.encodedProperty('color', d);
                const stroke = tm.encodedProperty('stroke', d);
                const strokeWidth = tm.encodedProperty('strokeWidth', d);
                const opacity = tm.encodedProperty('opacity', d);
                const y = tm.encodedProperty('y', d);

                const barWidth = tm.encodedProperty('width', d, { tileUnitWidth });
                const barStartX = tm.encodedProperty('x-start', d, { markWidth: barWidth });

                // pixi
                rowGraphics.lineStyle(
                    strokeWidth,
                    colorToHex(stroke),
                    1, // alpha
                    1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );
                rowGraphics.beginFill(colorToHex(color), opacity);
                rowGraphics.drawRect(barStartX, rowHeight - y - prevYEnd, barWidth, y);

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

            data.filter(
                d =>
                    !getValueUsingChannel(d, spec.row as Channel) ||
                    (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
            ).forEach(d => {
                const color = tm.encodedProperty('color', d);
                const stroke = tm.encodedProperty('stroke', d);
                const strokeWidth = tm.encodedProperty('strokeWidth', d);
                const opacity = tm.encodedProperty('opacity');
                const y = tm.encodedProperty('y', d); // TODO: we could even retrieve a actual y position of bars

                const barWidth = tm.encodedProperty('width', d, { tileUnitWidth });
                const barStartX = tm.encodedProperty('x-start', d, { markWidth: barWidth });
                const barHeight = y - baselineY;

                // pixi
                rowGraphics.lineStyle(
                    strokeWidth,
                    colorToHex(stroke),
                    1, // alpha
                    1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );
                rowGraphics.beginFill(colorToHex(color), opacity);
                rowGraphics.drawRect(barStartX, rowPosition + rowHeight - barHeight - baselineY, barWidth, barHeight);
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

export function barProperty(
    gm: GeminiTrackModel,
    propertyKey: VisualProperty,
    datum?: { [k: string]: string | number },
    additionalInfo?: {
        tileUnitWidth?: number;
        markWidth?: number;
    }
) {
    // priority of channels
    switch (propertyKey) {
        case 'width':
            return (
                // (1) size
                gm.visualPropertyByChannel('size', datum) ??
                // (2) x1 - x
                (gm.visualPropertyByChannel('x1', datum)
                    ? gm.visualPropertyByChannel('x1', datum) - gm.visualPropertyByChannel('x', datum)
                    : // (3) unit size of tile
                      additionalInfo?.tileUnitWidth)
            );
        case 'x-start':
            if (!additionalInfo?.markWidth) {
                // `markWidth` is required
                return;
            }
            return (
                // (1) x + (x1 - x - barWidth) / 2.0
                gm.visualPropertyByChannel('x1', datum)
                    ? (gm.visualPropertyByChannel('x1', datum) +
                          gm.visualPropertyByChannel('x', datum) -
                          additionalInfo?.markWidth) /
                          2.0
                    : // (2) x - barWidth / 2.0
                      gm.visualPropertyByChannel('x', datum) - additionalInfo?.markWidth / 2.0
            );
        default:
            return undefined;
    }
}
