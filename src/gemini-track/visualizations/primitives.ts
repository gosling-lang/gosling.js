import * as d3 from 'd3';
import { group } from 'd3-array';
import { GeminiTrackModel } from '../../lib/gemini-track-model';
import { IsChannelDeep, getChannelRange } from '../../lib/gemini.schema';

export function drawPrimitiveMarks(HGC: any, trackInfo: any, tile: any, alt: boolean) {
    /**
     * TODO: Major Missing Things That We Need To Support Here
     * (1) Supporting vertical tracks
     * (2) Covering differet field type combinations, other than 1G, 1C, 1Q (e.g., multiple stacked bar charts)
     */

    /* spec */
    const geminiModel = trackInfo.geminiModel as GeminiTrackModel;
    const spec = geminiModel.spec(alt);

    /* data */
    const data = tile.tabularData as { [k: string]: number | string }[];

    /* essentials */
    const trackHeight = trackInfo.dimensions[1];
    const tileSize = trackInfo.tilesetInfo.tile_size;
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        tileSize
    );
    let xField: string | undefined;
    let yField: string | undefined;
    let colorField: string | undefined;
    let rowField: string | undefined;
    if (IsChannelDeep(spec.color)) {
        colorField = spec.color.field;
    }
    if (IsChannelDeep(spec.x)) {
        xField = spec.x.field;
    }
    if (IsChannelDeep(spec.y)) {
        yField = spec.y.field;
    }
    if (IsChannelDeep(spec.row)) {
        rowField = spec.row.field;
    }

    /* scales */
    const xScale = trackInfo._xScale;

    const DUMMY_COLOR = 'DUMMY_COLOR'; // if `color` is undefined, use only one color internally
    const colorRange = getChannelRange(spec, 'color');
    const colorCategories = colorField ? Array.from(new Set(data.map(d => d[colorField as string]))) : [DUMMY_COLOR];
    const cScale = d3
        .scaleOrdinal()
        .domain(colorCategories as string[])
        .range(colorRange);

    const DUMMY_ROW = 'DUMMY_ROW'; // if `row` is undefined, use only one row internally
    const rowCategories = rowField ? Array.from(new Set(data.map(d => d[rowField as string]))) : [DUMMY_ROW];
    const rowScale = d3
        .scaleBand()
        .domain(rowCategories as string[])
        .range([0, trackHeight]);

    // TODO: If no colorField and rowField, merge!

    tile.sprites = [];

    /* render */
    // stacked marks
    if ((spec.mark === 'bar' || spec.mark === 'area') && colorField && colorField !== xField && !rowField) {
        const rowGraphics = new HGC.libraries.PIXI.Graphics(); // only one row for stacked marks

        const pivotedData = group(data, d => d[xField as string]);
        const xKeys = [...pivotedData.keys()];
        const yExtent = [tile.extent.min, tile.extent.max];

        const rowHeight = trackHeight / rowCategories.length; // only one row in stacked bars

        const yScale = d3
            .scaleLinear()
            .domain(yExtent as number[])
            .range([0, rowHeight]);
        const barWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

        if (trackInfo.options.barBorder) {
            rowGraphics.lineStyle(1, 0x333333, 0.5, 0);
            tile.barBorders = true;
        }

        // TODO: we may want to align rows by values
        xKeys.forEach(k => {
            let prevYEnd = 0;
            pivotedData.get(k)?.forEach(d => {
                const R = (d[rowField as string] as string) ?? DUMMY_ROW;
                const C = d[colorField as string] as string;
                const Y = d[yField as string] as number;
                const X = d[xField as string] as number;

                const color = cScale(C);
                const x = xScale(tileX + X * (tileWidth / tileSize));
                const height = yScale(Y);
                const y = -height - prevYEnd + (rowScale(R) as number);

                prevYEnd += height;

                // pixi
                rowGraphics.beginFill(trackInfo.colorHexMap[color as string], 1);
                rowGraphics.drawRect(x, y, barWidth, height);

                // svg
                trackInfo.addSVGInfo(tile, x, y, barWidth, height, color);
            });
        });

        // add row graphics
        const texture = HGC.services.pixiRenderer.generateTexture(rowGraphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST);
        const sprite = new HGC.libraries.PIXI.Sprite(texture);

        sprite.width = xScale(tileX + tileWidth) - xScale(tileX);
        sprite.x = xScale(tileX);
        sprite.y = 0;

        tile.sprites.push({ sprite: sprite, scaleKey: DUMMY_ROW });
        tile.graphics.addChild(sprite);
    }
    // regular bars (no stacking)
    else {
        const yExtent = [tile.extent.min, tile.extent.max];

        const rowHeight = trackHeight / rowCategories.length;

        const yScale = d3
            .scaleLinear()
            .domain(yExtent as number[])
            .range([0, rowHeight]);
        const barWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

        // draw each row and each color starting from the left to the right
        rowCategories.forEach(R => {
            // we are separately drawing each row so that y scale can be shared across tiles
            const rowGraphics = new HGC.libraries.PIXI.Graphics();

            if (trackInfo.options.barBorder) {
                rowGraphics.lineStyle(1, 0x333333, 0.5, 0);
                tile.barBorders = true;
            }

            const rowPosition = rowScale(R as string) as number;

            colorCategories.forEach(C => {
                const colorStr = cScale(C as string);
                const colorHex = trackInfo.colorHexMap[colorStr as string];

                const areaPoints: number[] = []; // only used for `area` mark

                if (spec.mark === 'line') {
                    rowGraphics.lineStyle(1, colorHex, 1);
                } else if (spec.mark === 'area') {
                    rowGraphics.beginFill(colorHex, 1);
                }

                data.filter(d => {
                    // filter by row and color
                    return (
                        (!d[rowField as string] || d[rowField as string] === R) &&
                        (!d[colorField as string] || d[colorField as string] === C)
                    );
                })
                    // draw from left to right. important for line and area marks
                    .sort((d1, d2) => (d1[xField as string] as number) - (d2[xField as string] as number))
                    .forEach((d, i, array) => {
                        const yNumber = d[yField as string] as number;
                        const xNumber = d[xField as string] as number;

                        const x = xScale(tileX + xNumber * (tileWidth / tileSize));
                        const height = yScale(yNumber);
                        const y = -height + rowHeight;

                        if (spec.mark === 'bar') {
                            // pixi
                            rowGraphics.beginFill(colorHex, 1);
                            rowGraphics.drawRect(x, y, barWidth, height);

                            // svg
                            trackInfo.addSVGInfo(tile, x, y, barWidth, height, colorStr);
                        } else if (spec.mark === 'line') {
                            // TODO: fix the resolution issue
                            // pixi
                            if (i === 0) {
                                rowGraphics.moveTo(x, y);
                            } else {
                                rowGraphics.lineTo(x, y);
                            }

                            // svg
                            trackInfo.addSVGInfo(tile, x, y, colorStr);
                        } else if (spec.mark === 'area') {
                            if (i === 0) {
                                areaPoints.push(x, rowHeight);
                            }
                            areaPoints.push(x, y);
                            if (i === array.length - 1) {
                                areaPoints.push(x, rowHeight);
                                areaPoints.push(xScale(tileX), rowHeight); // close the polygon with the point at the start
                            }
                        }
                    });

                // draw polygon for `area` marks
                if (spec.mark === 'area') {
                    rowGraphics.drawPolygon(areaPoints);
                    rowGraphics.endFill();

                    // TODO: svg
                }
            });

            // add row graphics
            const texture = HGC.services.pixiRenderer.generateTexture(
                rowGraphics,
                HGC.libraries.PIXI.SCALE_MODES.NEAREST
            );
            const sprite = new HGC.libraries.PIXI.Sprite(texture);

            sprite.width = xScale(tileX + tileWidth) - xScale(tileX);
            sprite.x = xScale(tileX);
            sprite.y = rowPosition;

            tile.sprites.push({ sprite: sprite, scaleKey: R });
            tile.graphics.addChild(sprite);
        });
    }

    // used for rescaling tiles
    tile.rowScale = rowScale;
}

// deprecated
export function drawStackedBarChart(HGC: any, trackInfo: any, tile: any, alt: boolean) {
    const { pixiRenderer } = HGC.services;

    const matrix = trackInfo.mapOriginalColors(trackInfo.unFlatten(tile), alt);

    const positiveMax = trackInfo.maxAndMin.max;
    const negativeMax = trackInfo.maxAndMin.min;

    // we're setting the start of the tile to the current zoom level
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        trackInfo.tilesetInfo.tile_size
    );

    const graphics = new HGC.libraries.PIXI.Graphics();
    const trackHeight = trackInfo.dimensions[1];

    // get amount of trackHeight reserved for positive and for negative
    const unscaledHeight = positiveMax + Math.abs(negativeMax);

    // fraction of the track devoted to positive values
    const positiveTrackHeight = (positiveMax * trackHeight) / unscaledHeight;

    const width = 10;

    // calls drawBackground in PixiTrack.js
    trackInfo.drawBackground(matrix, graphics);

    // borders around each bar
    if (trackInfo.options.barBorder) {
        graphics.lineStyle(1, 0x333333, 1, 0);
    }

    matrix.forEach((row: any, j: number) => {
        const x = j * width;

        // draw positive values
        const posBars = row[0];
        const posScale = d3.scaleLinear().domain([0, positiveMax]).range([0, positiveTrackHeight]);

        let posStackedHeight = 0;
        posBars.forEach((posBar: any) => {
            const height = posScale(posBar.value);

            // if (height === 0) return;

            const y = positiveTrackHeight - (posStackedHeight + height);

            trackInfo.addSVGInfo(tile, x, y, width, height, posBar.color);
            graphics.beginFill(trackInfo.colorHexMap[posBar.color], 0.5);
            graphics.drawRect(x, y, width, height);

            posStackedHeight += height;
        });
    });

    const xScale = trackInfo._xScale;
    const texture = pixiRenderer.generateTexture(graphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST);
    const sprite = new HGC.libraries.PIXI.Sprite(texture);
    sprite.width = xScale(tileX + tileWidth) - xScale(tileX);
    sprite.x = xScale(tileX);
    // tile.sprite = sprite;

    tile.graphics.addChild(sprite);
}
