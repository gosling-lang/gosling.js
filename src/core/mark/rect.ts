import { GeminiTrackModel } from '../gemini-track-model';
import { getValueUsingChannel, Channel } from '../gemini.schema';
import { VisualProperty } from '../visual-property.schema';
// import { RESOLUTION } from '.';

export function drawRect(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
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
    const tileUnitWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* information for rescaling tiles */
    tile.rowScale = tm.getChannelScale('row');
    tile.spriteInfos = []; // sprites for individual rows or columns

    // TODO: what if quantitative Y field is used?
    const yCategories = (tm.getChannelDomainArray('y') as string[]) ?? ['___SINGLE_Y_POSITION___'];
    const cellHeight = rowHeight / yCategories.length;

    /* constant values */
    const strokeWidth = tm.encodedProperty('strokeWidth');
    const stroke = tm.encodedValue('stroke');

    /* render */
    rowCategories.forEach(rowCategory => {
        // we are separately drawing each row so that y scale can be more effectively shared across tiles without rerendering from the bottom
        const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics();
        const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const x = tm.encodedProperty('x', d);
            const y = tm.encodedProperty('y', d);
            const color = tm.encodedProperty('color', d);
            const opacity = tm.encodedProperty('opacity', d);
            const rectWidth = tm.encodedProperty('width', d, { markWidth: tileUnitWidth });
            const rectHeight = tm.encodedProperty('height', d, { markHeight: cellHeight });

            const alphaTransition = tm.markVisibility(d, { width: rectWidth });
            const actualOpacity = Math.min(alphaTransition, opacity);

            if (actualOpacity === 0 || rectHeight === 0 || rectWidth === 0) {
                // do not need to draw invisible objects
                return;
            }

            // stroke
            rowGraphics.lineStyle(
                strokeWidth,
                colorToHex(stroke),
                actualOpacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            rowGraphics.beginFill(colorToHex(color), actualOpacity);
            rowGraphics.drawRect(x, rowPosition + y - rectHeight / 2.0, rectWidth, rectHeight);
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

export function rectProperty(
    gm: GeminiTrackModel,
    propertyKey: VisualProperty,
    datum?: { [k: string]: string | number },
    additionalInfo?: {
        markHeight?: number;
        markWidth?: number;
    }
) {
    switch (propertyKey) {
        case 'width':
            return (
                // (1) size
                gm.visualPropertyByChannel('xe', datum)
                    ? gm.visualPropertyByChannel('xe', datum) - gm.visualPropertyByChannel('x', datum)
                    : // (2) unit mark height
                      additionalInfo?.markWidth
            );
        case 'height':
            return (
                // (1) size
                gm.visualPropertyByChannel('size', datum) ??
                // (2) unit mark height
                additionalInfo?.markHeight
            );
        default:
            return undefined;
    }
}
