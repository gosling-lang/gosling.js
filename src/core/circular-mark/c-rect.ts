import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import { getValueUsingChannel } from '../gemini.schema.guards';
import { VisualProperty } from '../visual-property.schema';

export function drawCircularRect(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
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

    // EXPERIMENTAL PARAMETERS
    const RADIUS = 280;
    const ENTRANCE_PADDING = 0.04;
    const xMax = 640;
    const CX = 600 / 2.0;
    const CY = CX;
    const xToDt = (x: number) => {
        return (-x / xMax) * (Math.PI * 2 - ENTRANCE_PADDING * 2) - Math.PI / 2.0 - ENTRANCE_PADDING;
    };

    /* render */
    rowCategories.forEach(rowCategory => {
        // we are separately drawing each row so that y scale can be more effectively shared across tiles without rerendering from the bottom
        const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics();
        // const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const x = tm.encodedProperty('x', d);
            // const y = tm.encodedProperty('y', d);
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

            if (x + rectWidth < 0 || xMax < x) {
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
            rowGraphics.moveTo(CX, CY);
            rowGraphics.arc(CX, CY, RADIUS, xToDt(x), xToDt(x + rectWidth), true);
            rowGraphics.closePath();
        });
    });

    // outline
    tile.graphics.lineStyle(
        1,
        colorToHex('black'),
        1, // alpha
        0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    tile.graphics.beginFill(colorToHex('white'), 0);
    tile.graphics.drawCircle(CX, CY, RADIUS);

    // center white hole
    tile.graphics.lineStyle(
        1,
        colorToHex('#DBDBDB'),
        0.7, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    tile.graphics.beginFill(colorToHex('white'), 1);
    tile.graphics.drawCircle(CX, CY, 250);

    // entrance of the circular layout
    tile.graphics.lineStyle(
        2,
        colorToHex('black'),
        0, // alpha
        0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    tile.graphics.beginFill(colorToHex('white'), 1);
    tile.graphics.moveTo(CX, CY);
    tile.graphics.arc(CX, CY, RADIUS + 6, -Math.PI / 2.0 - ENTRANCE_PADDING, -Math.PI / 2.0 + ENTRANCE_PADDING);
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
