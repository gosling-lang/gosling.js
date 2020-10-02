import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import * as d3 from 'd3';
import { group } from 'd3-array';
import { IsStackedMark, getValueUsingChannel } from '../gemini.schema.guards';

// TODO: fill the white gap betwee tiles.
/**
 * Draw area marks
 */
export function drawArea(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = tm.data();

    /* track size */
    const trackHeight = trackInfo.dimensions[1];
    const tileSize = trackInfo.tilesetInfo.tile_size;
    const { tileX } = trackInfo.getTilePosAndDimensions(tile.tileData.zoomLevel, tile.tileData.tilePos, tileSize);

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

    /* constant values */
    const constantOpacity = tm.encodedProperty('opacity');
    const constantStrokeWidth = tm.encodedProperty('strokeWidth');
    const constantStroke = tm.encodedProperty('stroke');

    /* render */
    if (IsStackedMark(spec)) {
        // TODO: many parts in this scope are identical as the below `else` statement, so encaptulate this?
        const rowGraphics = tile.graphics; //new HGC.libraries.PIXI.Graphics(); // only one row for stacked marks

        const genomicChannel = tm.getGenomicChannel();
        if (!genomicChannel || !genomicChannel.field) {
            console.warn('Genomic field is not provided in the specification');
            return;
        }
        const pivotedData = group(data, d => d[genomicChannel.field as string]);
        const genomicPosCategories = [...pivotedData.keys()]; // TODO: make sure to be sorted from left to right or top to bottom

        // stroke
        rowGraphics.lineStyle(
            constantStrokeWidth,
            colorToHex(constantStroke),
            constantOpacity,
            1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );

        const prevYEndByGPos: { [k: string]: number } = {};

        // TODO: we can have a multiple rows when color and row are mapped with different fields
        // are marks are drawn for each color
        colorCategories.forEach(colorCategory => {
            // we have two sets of points since we need to draw the bottom line as well
            const areaPointsTop: number[][] = [];
            const areaPointsBottom: number[][] = [];

            // TODO: users may want to align rows by values
            genomicPosCategories.forEach((genomicPosCategory, i, array) => {
                pivotedData
                    .get(genomicPosCategory)
                    ?.filter(d => getValueUsingChannel(d, spec.color as Channel) === colorCategory)
                    ?.forEach(d => {
                        const xValue = +genomicPosCategory;

                        const x = xScale(xValue);
                        const y = d3.max([tm.encodedProperty('y', d), 0]); // make should not to overflow

                        if (i === 0) {
                            // start position of the polygon
                            areaPointsTop.push([x, rowHeight]); // TODO: confirm if this is correct
                            areaPointsBottom.push([x, rowHeight]);
                        }

                        if (typeof prevYEndByGPos[genomicPosCategory] === 'undefined') {
                            prevYEndByGPos[genomicPosCategory] = 0;
                        }

                        areaPointsTop.push([x, rowHeight - y - prevYEndByGPos[genomicPosCategory]]);
                        areaPointsBottom.push([x, rowHeight - prevYEndByGPos[genomicPosCategory]]);

                        if (i === array.length - 1) {
                            // end position of the polygon
                            areaPointsTop.push([x, rowHeight]);
                            areaPointsBottom.push([x, rowHeight]);
                        }

                        prevYEndByGPos[genomicPosCategory] += y;
                    });
            });
            const color = tm.encodedValue('color', colorCategory);
            rowGraphics.beginFill(colorToHex(color), constantOpacity);
            rowGraphics.drawPolygon([
                ...areaPointsTop.reduce((a, b) => a.concat(b)),
                ...areaPointsBottom.reverse().reduce((a, b) => a.concat(b))
            ]);
            rowGraphics.endFill();
        });

        // Temporally, we do not convert graphics to sprite until we find a general way
        // to share global scales across tiles.

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
                constantStrokeWidth,
                colorToHex(constantStroke),
                constantOpacity,
                1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            // area marks are drawn for each color
            colorCategories.forEach(colorCategory => {
                const areaPoints: number[] = [];

                data.filter(
                    d =>
                        (typeof getValueUsingChannel(d, spec.row as Channel) === 'undefined' ||
                            (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory) &&
                        (typeof getValueUsingChannel(d, spec.color as Channel) === 'undefined' ||
                            (getValueUsingChannel(d, spec.color as Channel) as string) === colorCategory)
                ).forEach((d, i, array) => {
                    // TODO: this should be included in the `encodedValue` functions
                    // make should not to overflow when using use-defined `domain`
                    const y = d3.min([d3.max([tm.encodedProperty('y', d), 0]), rowHeight]);
                    const x = tm.encodedProperty('x', d);

                    if (i === 0) {
                        // start position of the polygon
                        areaPoints.push(x, rowPosition + rowHeight);
                    }

                    areaPoints.push(x, rowPosition + rowHeight - y);

                    if (i === array.length - 1) {
                        // close the polygon with a point at the start
                        const startX = xScale(tileX);
                        areaPoints.push(x, rowPosition + rowHeight);
                        areaPoints.push(startX, rowPosition + rowHeight);
                    }
                });

                const color = tm.encodedValue('color', colorCategory);
                rowGraphics.beginFill(colorToHex(color), constantOpacity);
                rowGraphics.drawPolygon(areaPoints);
                rowGraphics.endFill();
            });

            // Temporally, we do not convert graphics to sprite until we find a general way
            // to share global scales across tiles.

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
