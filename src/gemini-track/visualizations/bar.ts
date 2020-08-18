import * as d3 from 'd3';
import { group } from 'd3-array';
import { GeminiTrackModel } from '../../lib/gemini-track-model';
import { IsChannelDeep } from '../../lib/gemini.schema'

export function drawBars(HGC: any, trackInfo: any, tile: any, alt: boolean) {
    /* spec */
    const geminiModel = trackInfo.geminiModel as GeminiTrackModel;
    const spec = geminiModel.spec(alt);

    /* data */
    const data = tile.tabularData as { [k: string]: number | string }[];

    /* renderer */
    const localGraphics = new HGC.libraries.PIXI.Graphics();

    /* essentials */
    const trackHeight = trackInfo.dimensions[1];
    const tileSize = trackInfo.tilesetInfo.tile_size;
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        tileSize
    );
    let xField  : string | undefined, yField  : string | undefined, colorField : string | undefined, rowField  : string | undefined;
    if(IsChannelDeep(spec.color)) {
        colorField = spec.color.field;
    }
    if(IsChannelDeep(spec.x)) {
        xField = spec.x.field;
    }
    if(IsChannelDeep(spec.y)) {
        yField = spec.y.field;
    }
    if(IsChannelDeep(spec.row)) {
        rowField = spec.row.field;
    }

    /* scales */
    const xScale = trackInfo._xScale;

    const colorRange = geminiModel.getChannelRange('color', alt);
    const colorCategories = colorField ? Array.from(new Set(data.map(d => d[colorField as string]))) : [];
    const cScale = d3.scaleOrdinal().range(colorRange);
    if(colorField) {
        cScale.domain(colorCategories as string[]);
    }

    const DUMMY_ROW = 'DUMMY_ROW'; // if `row` is undefined, use only one row internally
    const rowCategories = rowField ? Array.from(new Set(data.map(d => d[rowField as string]))) : [ DUMMY_ROW ];
    const rowScale = d3.scaleBand()
        .domain(rowCategories as string[])
        .range([0, trackHeight])

    // TODO: If no colorField and rowField, merge!

    /* render */
    // stacked bars
    if(colorField && colorField !== xField && !rowField) {
        const pivotedData = group(data, d => d[xField as string]);
        const xKeys = [ ...pivotedData.keys()];
        const yBaseline = 0; // TODO: we can support none-zero base line
        const yMax = d3.max(xKeys.map(d => d3.sum(
            (pivotedData.get(d) as any).map((_d: any) => _d[yField as string]))) as number[]
        );
        const yExtent = [yBaseline, yMax];

        const rowHeight = trackHeight / 1; // only one row in stacked bars

        const yScale = d3.scaleLinear()
            .domain(yExtent as number[])
            .range([0, rowHeight]);
        const barWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);
    
        if (trackInfo.options.barBorder) {
            localGraphics.lineStyle(1, 0x333333, 0.5, 0);
            tile.barBorders = true;
        }
    
        xKeys.forEach(k => {
            let prevYEnd = 0;
            pivotedData.get(k)?.forEach(d => {
                const R = d[rowField as string] as string ?? DUMMY_ROW;
                const C = d[colorField as string] as string;
                const Y = d[yField as string] as number;
                const X = d[xField as string] as number;
        
                const color = cScale(C);
                const x = xScale(tileX + X * (tileWidth / tileSize));
                const height = yScale(Y);
                const y = -height - prevYEnd + (rowScale(R) as number);

                prevYEnd += height;
                
                // pixi
                localGraphics.beginFill(trackInfo.colorHexMap[color as string], 0.5);
                localGraphics.drawRect(x, y, barWidth, height);
        
                // svg
                trackInfo.addSVGInfo(tile, x, y, barWidth, height, color);
            });
        });
    }
    // regular bars (no stacking)
    else {
        const yBaseline = 0; // TODO: we can support none-zero base line
        const yMax = d3.max(data.map(d => d[yField as string] as number));
        const yExtent = [yBaseline, yMax];

        const rowHeight = trackHeight / rowCategories.length;
    
        const yScale = d3.scaleLinear()
            .domain(yExtent as number[])
            .range([0, rowHeight]);
        const barWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);
    
        if (trackInfo.options.barBorder) {
            localGraphics.lineStyle(1, 0x333333, 0.5, 0);
            tile.barBorders = true;
        }
    
        data.forEach(d => {
            const R = d[rowField as string] as string ?? DUMMY_ROW;
            const C = d[colorField as string] as string;
            const Y = d[yField as string] as number;
            const X = d[xField as string] as number;
    
            const color = cScale(C);
            const x = xScale(tileX + X * (tileWidth / tileSize));
            const height = yScale(Y);
            const y = -height + (rowScale(R) as number);
    
            // pixi
            localGraphics.beginFill(trackInfo.colorHexMap[color as string], 0.5);
            localGraphics.drawRect(x, y, barWidth, height);
    
            // svg
            trackInfo.addSVGInfo(tile, x, y, barWidth, height, color);
        });
    }

    const texture = HGC.services.pixiRenderer.generateTexture(localGraphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST);
    const sprite = new HGC.libraries.PIXI.Sprite(texture);

    sprite.width = xScale(tileX + tileWidth) - xScale(tileX);
    sprite.x = xScale(tileX);

    tile.graphics.addChild(sprite);
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

    let lowestY = trackInfo.dimensions[1];

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

            if (lowestY > y)
                // TODO: when do we use this?
                lowestY = y;
        });
    });

    const xScale = trackInfo._xScale;
    const texture = pixiRenderer.generateTexture(graphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST);
    const sprite = new HGC.libraries.PIXI.Sprite(texture);
    sprite.width = xScale(tileX + tileWidth) - xScale(tileX);
    sprite.x = xScale(tileX);
    // tile.sprite = sprite;
    tile.lowestY = lowestY;

    tile.graphics.addChild(sprite);
}
