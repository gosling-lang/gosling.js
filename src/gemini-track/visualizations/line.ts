import { scaleLinear } from 'd3';

export function drawLineCharts(HGC: any, trackInfo: any, tile: any, alt: boolean) {
    const graphics = tile.graphics;

    tile.drawnAtScale = trackInfo._xScale.copy();

    // we're setting the start of the tile to the current zoom level
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        trackInfo.tilesetInfo.tile_size
    );

    const matrix = tile.matrix;
    const trackHeight = trackInfo.dimensions[1];
    // const matrixDimensions = tile.tileData.shape;

    const valueToPixels = scaleLinear()
        .domain([0, trackInfo.maxAndMin.max])
        .range([0, trackHeight /* / matrixDimensions[0]*/]);

    for (let i = 0; i < matrix[0].length; i++) {
        // const intervals = trackHeight / matrixDimensions[0];
        // calculates placement for a line in each interval; we subtract 1 so we can see the last line clearly
        const linePlacement = trackHeight;
        // (i === matrix[0].length - 1) ?
        //     (intervals * i) + ((intervals * (i + 1) - (intervals * i))) - 1 :
        //     (intervals * i) + ((intervals * (i + 1) - (intervals * i)));
        graphics.lineStyle(1, trackInfo.colorHexMap[trackInfo.geminiModel.getColorRange(alt)[i]], 1);

        for (let j = 0; j < matrix.length; j++) {
            // 3070 or something
            const x = trackInfo._xScale(tileX + (j * tileWidth) / trackInfo.tilesetInfo.tile_size);
            const y = linePlacement - valueToPixels(matrix[j][i]);
            trackInfo.addSVGInfo(tile, x, y, trackInfo.geminiModel.getColorRange(alt)[i]);
            // move draw position back to the start at beginning of each line
            j === 0 ? graphics.moveTo(x, y) : graphics.lineTo(x, y);
        }
    }
}
