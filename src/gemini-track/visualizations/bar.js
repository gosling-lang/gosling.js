import { scaleLinear, scaleOrdinal, schemeCategory10, min, max, set } from 'd3';

export function drawMultipleBarCharts(HGC, obj, tile) {

    const { pixiRenderer } = HGC.services;

    const graphics = tile.graphics;

    tile.drawnAtScale = obj._xScale.copy();

    let localGraphics = new HGC.libraries.PIXI.Graphics();

    // we're setting the start of the tile to the current zoom level
    const { tileX, tileWidth } = obj.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        obj.tilesetInfo.tile_size
    );

    if (obj.options.barBorder) {
        localGraphics.lineStyle(1, 0x333333, 0.5, 0);
        tile.barBorders = true;
    }

    const data = tile.tabularData; // alternative data that will replace the `matrix`

    const matrixDimensions = tile.tileData.shape;
    const colorScale = obj.options.colorScale || scaleOrdinal(schemeCategory10);

    const trackHeight = obj.dimensions[1];
    const barWidth = obj._xScale(tileX + (tileWidth / obj.tilesetInfo.tile_size)) - obj._xScale(tileX);
    const tileSize = obj.tilesetInfo.tile_size;
    const uniqueCategories = Array.from(new Set(data.map(d => d['__N__'])));
    const rowHeight = trackHeight / uniqueCategories.length;

    const xScale = obj._xScale;
    const yScale = scaleLinear()
        .domain([0, max(data.map(d => d['__Q__']))])
        .range([0, rowHeight]);
    const cScale = scaleOrdinal(colorScale)
        .domain(uniqueCategories);

    data.forEach(d => {
        const category = d['__N__'];
        const value = d['__Q__'];
        const gposition = d['__G__'];

        const color = cScale(category);
        const x = xScale(tileX + (gposition * tileWidth / tileSize));
        const height = yScale(value);
        const y = (rowHeight) * (uniqueCategories.indexOf(category) + 1) - height;

        // pixi
        localGraphics.beginFill(obj.colorHexMap[color]);
        localGraphics.drawRect(x, y, barWidth, height);

        // svg
        obj.addSVGInfo(tile, x, y, barWidth, height, color);
    });

    const texture = pixiRenderer.generateTexture(localGraphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST);
    const sprite = new HGC.libraries.PIXI.Sprite(texture);
    sprite.width = xScale(tileX + tileWidth) - xScale(tileX);
    sprite.x = xScale(tileX);
    graphics.addChild(sprite);
}

export function drawStackedBarChart(HGC, obj, tile) {

    // Services
    const { pixiRenderer } = HGC.services;

    const matrix = obj.mapOriginalColors(obj.unFlatten(tile));

    const positiveMax = obj.maxAndMin.max;
    const negativeMax = obj.maxAndMin.min;

    // we're setting the start of the tile to the current zoom level
    const { tileX, tileWidth } = obj.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        obj.tilesetInfo.tile_size
    );

    let graphics = new HGC.libraries.PIXI.Graphics();
    const trackHeight = obj.dimensions[1];

    // get amount of trackHeight reserved for positive and for negative
    const unscaledHeight = positiveMax + (Math.abs(negativeMax));

    // fraction of the track devoted to positive values
    const positiveTrackHeight = (positiveMax * trackHeight) / unscaledHeight;

    // fraction of the track devoted to negative values
    const negativeTrackHeight = (Math.abs(negativeMax) * trackHeight) / unscaledHeight;

    let lowestY = obj.dimensions[1];

    const width = 10;

    // calls drawBackground in PixiTrack.js
    obj.drawBackground(matrix, graphics);

    // borders around each bar
    if (obj.options.barBorder) {
        graphics.lineStyle(1, 0x333333, 1, 0);
    }

    for (let j = 0; j < matrix.length; j++) {
        const x = (j * width);

        // draw positive values
        const posBars = matrix[j][0];
        const posScale = scaleLinear()
            .domain([0, positiveMax])
            .range([0, positiveTrackHeight]);

        let posStackedHeight = 0;
        for (let i = 0; i < posBars.length; i++) {
            const height = posScale(posBars[i].value);

            if (height === 0) continue;

            const y = positiveTrackHeight - (posStackedHeight + height);

            obj.addSVGInfo(tile, x, y, width, height, posBars[i].color);
            graphics.beginFill(obj.colorHexMap[posBars[i].color]);
            graphics.drawRect(x, y, width, height);

            posStackedHeight += height;

            if (lowestY > y) // TODO: when do we use this?
                lowestY = y;
        }

        // draw negative values, if there are any
        if (Math.abs(negativeMax) > 0) {
            const negative = matrix[j][1];
            const valueToPixelsNegative = scaleLinear()
                .domain([-Math.abs(negativeMax), 0])
                .range([negativeTrackHeight, 0]);
            let negativeStackedHeight = 0;
            for (let i = 0; i < negative.length; i++) {
                const height = valueToPixelsNegative(negative[i].value);
                const y = positiveTrackHeight + negativeStackedHeight;
                obj.addSVGInfo(tile, x, y, width, height, negative[i].color);
                graphics.beginFill(obj.colorHexMap[negative[i].color]);
                graphics.drawRect(x, y, width, height);
                negativeStackedHeight = negativeStackedHeight + height;
            }
        }
    }

    // vertical bars are drawn onto the graphics object
    // and a texture is generated from that
    const texture = pixiRenderer.generateTexture(
        graphics, HGC.libraries.PIXI.SCALE_MODES.NEAREST
    );
    const sprite = new HGC.libraries.PIXI.Sprite(texture);
    sprite.width = obj._xScale(tileX + tileWidth) - obj._xScale(tileX);
    sprite.x = obj._xScale(tileX);
    tile.sprite = sprite;
    tile.lowestY = lowestY;
    tile.graphics.addChild(tile.sprite);
}