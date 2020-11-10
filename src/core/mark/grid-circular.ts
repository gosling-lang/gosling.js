import { GeminiTrackModel } from '../gemini-track-model';
import { IsChannelDeep } from '../gemini.schema.guards';
import { cartesianToPolar } from '../utils/polar';

export function drawCircularGrid(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
    /* track spec */
    const spec = tm.spec();
    if (!IsChannelDeep(spec.row) || !spec.row.grid) {
        // we do not need to draw grid
        return;
    }

    return; // TODO: we do not support this yet

    /* helper */
    const { colorToHex } = HGC.utils;

    /* track size */
    const trackWidth = trackInfo.dimensions[1];
    const trackHeight = trackInfo.dimensions[1];
    const tileSize = trackInfo.tilesetInfo.tile_size;
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        tileSize
    );

    /* circular parameters */
    const trackInnerRadius = spec.innerRadius ?? 220; // TODO: should default values be filled already
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    /* genomic scale */
    const xScale = tm.getChannelScale('x');

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* render */
    const graphics = tile.graphics;

    const x = xScale(tileX);
    const x1 = xScale(tileX + tileWidth);

    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        graphics.lineStyle(
            1,
            colorToHex('lightgray'),
            1, // alpha
            1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );

        const r = trackOuterRadius - ((rowPosition + rowHeight) / trackHeight) * trackRingSize;
        const pos = cartesianToPolar(x, trackWidth, r, cx, cy, startAngle, endAngle);
        const pos1 = cartesianToPolar(x1, trackWidth, r, cx, cy, startAngle, endAngle);

        graphics.moveTo(pos.x, pos.y);
        graphics.lineTo(pos1.x, pos1.y);
    });
}
