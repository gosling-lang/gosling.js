import { scaleLinear, scaleOrdinal, max } from 'd3';
import { GeminiTrackModel } from '../../lib/gemini-track-model';

export function drawBarChart(HGC: any, trackInfo: any, tile: any, alt: boolean) {
    /* spec */
    const geminiModel = trackInfo.geminiModel as GeminiTrackModel;

    /* data */
    const data = tile.tabularData as { [k: string]: number | string }[];

    /* encoding */
    const encodedFields = geminiModel.getEncodedFields(alt);

    const colorRange = geminiModel.getColorRange();
    const colorCategories = encodedFields['color'] ? Array.from(new Set(data.map(d => d[encodedFields['color']]))) : [];
    const rowCategories = encodedFields['row'] ? Array.from(new Set(data.map(d => d[encodedFields['row']]))) : [];

    const trackHeight = trackInfo.dimensions[1];
    const tileSize = trackInfo.tilesetInfo.tile_size;
    const rowHeight = trackHeight / rowCategories.length;
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        tileSize
    );

    const xScale = trackInfo._xScale;
    const yScale = scaleLinear()
        .domain([0, max(data.map(d => d['__Q__'] as any))])
        .range([0, rowHeight]);
    const cScale = scaleOrdinal()
        .domain(colorCategories as string[])
        .range(colorRange);
    const barWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    const localGraphics = new HGC.libraries.PIXI.Graphics();

    if (trackInfo.options.barBorder) {
        localGraphics.lineStyle(1, 0x333333, 0.5, 0);
        tile.barBorders = true;
    }

    data.forEach(d => {
        const category = d['__N__'] as string;
        const value = d['__Q__'] as number;
        const gposition = d['__G__'] as number;

        const color = cScale(category);
        const x = xScale(tileX + gposition * (tileWidth / tileSize));
        const height = yScale(value);
        const y = rowHeight * (rowCategories.indexOf(category) + 1) - height;

        // pixi
        localGraphics.beginFill(trackInfo.colorHexMap[color as string]);
        localGraphics.drawRect(x, y, barWidth, height);

        // svg
        trackInfo.addSVGInfo(tile, x, y, barWidth, height, color);
    });

    const { pixiRenderer } = HGC.services;
    const texture = pixiRenderer.generateTexture(localGraphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST);
    const sprite = new HGC.libraries.PIXI.Sprite(texture);
    sprite.width = xScale(tileX + tileWidth) - xScale(tileX);
    sprite.x = xScale(tileX);

    tile.graphics.addChild(sprite);
}

export function drawStackedBarChart(HGC: any, trackInfo: any, tile: any, alt: boolean) {
    // Services
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

    matrix.forEach((row: number[][], j: number) => {
        const x = j * width;

        // draw positive values
        const posBars = row[0];
        const posScale = scaleLinear().domain([0, positiveMax]).range([0, positiveTrackHeight]);

        let posStackedHeight = 0;
        posBars.forEach((posBar: any) => {
            const height = posScale(posBar.value);

            if (height === 0) return;

            const y = positiveTrackHeight - (posStackedHeight + height);

            trackInfo.addSVGInfo(tile, x, y, width, height, posBar.color);
            graphics.beginFill(trackInfo.colorHexMap[posBar.color]);
            graphics.drawRect(x, y, width, height);

            posStackedHeight += height;

            if (lowestY > y)
                // TODO: when do we use this?
                lowestY = y;
        });
    });

    // vertical bars are drawn onto the graphics object
    // and a texture is generated from that
    const texture = pixiRenderer.generateTexture(graphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST);
    const sprite = new HGC.libraries.PIXI.Sprite(texture);
    sprite.width = trackInfo._xScale(tileX + tileWidth) - trackInfo._xScale(tileX);
    sprite.x = trackInfo._xScale(tileX);
    tile.sprite = sprite;
    tile.lowestY = lowestY;

    tile.graphics.addChild(tile.sprite);
}
