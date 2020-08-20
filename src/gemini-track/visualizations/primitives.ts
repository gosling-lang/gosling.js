import * as d3 from 'd3';
import { group } from 'd3-array';
import { GeminiTrackModel } from '../../lib/gemini-track-model';
import { IsChannelDeep, getChannelRange, FieldType } from '../../lib/gemini.schema';

export function drawPrimitiveMarks(HGC: any, trackInfo: any, tile: any, alt: boolean) {
    /**
     * TODO: Major Missing Things That We Need To Support Here
     * (1) Supporting vertical tracks
     * (2) Covering differet field type combinations, other than 1G, 1C, 1Q (e.g., multiple stacked bar charts)
     * (3) Get opacity of marks
     * (4) Draw axis for individual rows
     * (5) Misconnection between tiles (e.g., lines)
     * (6) Differentiate categorical colors from quantitative colors
     * (7) SVG support
     * (8) Layering multiple tracks
     * (9) Genomic coordinates on both x and y axes
     * (10) Tooltip
     * (11) Legends
     */

    /* helper */
    const { colorToHex } = HGC.utils;

    /* spec */
    const geminiModel = trackInfo.geminiModel as GeminiTrackModel;
    const spec = geminiModel.spec(alt);

    /* data */
    const data = tile.tabularData as { [k: string]: number | string }[];

    /* essentials */
    const RESOLUTION = 4;
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
    let colorFieldType: FieldType | undefined;
    let rowField: string | undefined;
    if (IsChannelDeep(spec.color)) {
        colorField = spec.color.field;
    }
    if (IsChannelDeep(spec.color)) {
        colorFieldType = spec.color.type;
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
    const colorCategories =
        // if the type of a color field is `quantitative`, we do not use this information
        colorField && colorFieldType === 'nominal'
            ? Array.from(new Set(data.map(d => d[colorField as string])))
            : [DUMMY_COLOR];
    const colorScale =
        colorFieldType === 'nominal'
            ? d3
                  .scaleOrdinal()
                  .domain(colorCategories as string[])
                  .range(colorRange)
            : d3.scaleSequential(d3.interpolateViridis).domain([tile.extent.color.min, tile.extent.color.max]); // TODO:

    const DUMMY_ROW = 'DUMMY_ROW'; // if `row` is undefined, use only one row internally
    const rowCategories = rowField ? Array.from(new Set(data.map(d => d[rowField as string]))) : [DUMMY_ROW];
    const rowScale = d3
        .scaleBand()
        .domain(rowCategories as string[])
        .range([0, trackHeight]);

    tile.rowScale = rowScale; // used for rescaling tiles
    tile.sprites = []; // sprites for individual rows

    // TODO: If no colorField and rowField, merge!

    /* render */
    // stacked marks, requiring to group data by categories contained in a `color` field
    if (
        (spec.mark === 'bar' || spec.mark === 'area') &&
        colorField &&
        colorField !== xField &&
        colorFieldType === 'nominal' &&
        !rowField
    ) {
        const rowGraphics = new HGC.libraries.PIXI.Graphics(); // only one row for stacked marks

        const pivotedData = group(data, d => d[xField as string]);
        const xKeys = [...pivotedData.keys()];
        const yExtent = [tile.extent.y.min, tile.extent.y.max];

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

        // TODO: users may want to align rows by values
        xKeys.forEach(k => {
            let prevYEnd = 0;
            pivotedData.get(k)?.forEach(d => {
                const R = (d[rowField as string] as string) ?? DUMMY_ROW;
                const C =
                    colorFieldType === 'nominal'
                        ? (d[colorField as string] as string)
                        : (d[colorField as string] as number);
                const Y = d[yField as string] as number;
                const X = d[xField as string] as number;

                const colorStr =
                    colorFieldType === 'nominal'
                        ? (colorScale as d3.ScaleOrdinal<string, any>)(C as string)
                        : (colorScale as d3.ScaleSequential<string>)(C as number);
                const colorHex = colorToHex(colorStr);
                const x = xScale(tileX + X * (tileWidth / tileSize));
                const height = yScale(Y);
                const y = -height - prevYEnd + (rowScale(R) as number);

                prevYEnd += height;

                // pixi
                rowGraphics.beginFill(colorHex, 1);
                rowGraphics.drawRect(x, y, barWidth, height);

                // svg
                trackInfo.addSVGInfo(tile, x, y, barWidth, height, colorStr);
            });
        });

        // add row graphics
        const texture = HGC.services.pixiRenderer.generateTexture(
            rowGraphics,
            HGC.libraries.PIXI.SCALE_MODES.NEAREST,
            RESOLUTION
        );
        const sprite = new HGC.libraries.PIXI.Sprite(texture);

        sprite.width = xScale(tileX + tileWidth) - xScale(tileX);
        sprite.x = xScale(tileX);
        sprite.y = 0;
        sprite.height = rowHeight;

        tile.sprites.push({ sprite: sprite, scaleKey: DUMMY_ROW });
        tile.graphics.addChild(sprite);
    }
    // regular bars, which means marks are not stacked
    else {
        const yExtent = [tile.extent.y.min, tile.extent.y.max];

        const rowHeight = trackHeight / rowCategories.length;

        const yScale = d3
            .scaleLinear()
            .domain(yExtent as number[])
            .range([0, rowHeight]);
        const barWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

        // draw each row and each color starting from the left to the right
        // this is neccesary for line and area charts
        rowCategories.forEach(rowCategory => {
            // we are separately drawing each row so that y scale can be shared across tiles
            const rowGraphics = new HGC.libraries.PIXI.Graphics();

            if (trackInfo.options.barBorder) {
                rowGraphics.lineStyle(1, 0x333333, 0.5, 0);
                tile.barBorders = true;
            }

            const rowPosition = rowScale(rowCategory as string) as number;

            colorCategories.forEach(colorCategory => {
                const cColorStr =
                    colorFieldType === 'nominal'
                        ? (colorScale as d3.ScaleOrdinal<string, any>)(colorCategory as string)
                        : undefined;
                const cColorHex = cColorStr ? colorToHex(cColorStr) : undefined;

                const areaPoints: number[] = []; // only used for `area` mark

                if (spec.mark === 'line') {
                    rowGraphics.lineStyle(1, cColorHex, 1);
                } else if (spec.mark === 'area') {
                    rowGraphics.beginFill(cColorHex, 1);
                }

                data.filter(d => {
                    // filter by row and color
                    return (
                        (!d[rowField as string] || d[rowField as string] === rowCategory) &&
                        // we do not need to filter data by a `color` field when it is a `quantitative` type
                        (colorFieldType !== 'nominal' ||
                            !d[colorField as string] ||
                            d[colorField as string] === colorCategory)
                    );
                })
                    // draw from left to right. important for line and area marks
                    .sort((d1, d2) => (d1[xField as string] as number) - (d2[xField as string] as number))
                    .forEach((d, i, array) => {
                        const yNumber = d[yField as string] as number;
                        const xNumber = d[xField as string] as number;
                        const colorNumber = d[colorField as string] as number;

                        const x = xScale(tileX + xNumber * (tileWidth / tileSize));
                        const height = yScale(yNumber);
                        const y = -height + rowHeight;
                        const colorHex = cColorHex
                            ? cColorHex
                            : colorToHex((colorScale as d3.ScaleSequential<string>)(colorNumber));

                        // we could move this part to a separate function
                        if (spec.mark === 'bar') {
                            // pixi
                            rowGraphics.beginFill(colorHex, 1); // this could be moved to the outside of this iteration
                            rowGraphics.drawRect(x, y, barWidth, height);

                            // svg
                            trackInfo.addSVGInfo(tile, x, y, barWidth, height, cColorStr);
                        } else if (spec.mark === 'line') {
                            // TODO: fix the resolution issue
                            // pixi
                            if (i === 0) {
                                rowGraphics.moveTo(x, y);
                            } else {
                                rowGraphics.lineTo(x, y);
                            }

                            // svg
                            trackInfo.addSVGInfo(tile, x, y, cColorStr);
                        } else if (spec.mark === 'area') {
                            if (i === 0) {
                                areaPoints.push(x, rowHeight);
                            }
                            areaPoints.push(x, y);
                            if (i === array.length - 1) {
                                areaPoints.push(x, rowHeight);
                                areaPoints.push(xScale(tileX), rowHeight); // close the polygon with the point at the start
                            }
                        } else if (spec.mark === 'point') {
                            rowGraphics.beginFill(colorHex, 0.6);
                            rowGraphics.drawCircle(x, y, 2);
                        } else if (spec.mark === 'rect') {
                            rowGraphics.beginFill(colorHex, 1);
                            rowGraphics.drawRect(x, 0, barWidth, rowHeight);
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
                HGC.libraries.PIXI.SCALE_MODES.NEAREST,
                RESOLUTION
            );
            const sprite = new HGC.libraries.PIXI.Sprite(texture);

            sprite.width = xScale(tileX + tileWidth) - xScale(tileX);
            sprite.x = xScale(tileX);
            sprite.y = rowPosition;
            sprite.height = rowHeight / RESOLUTION;

            tile.sprites.push({ sprite: sprite, scaleKey: rowCategory });
            tile.graphics.addChild(sprite);
        });
    }
}
