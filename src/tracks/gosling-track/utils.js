import { tileProxy } from '@higlass/services';

/**
 * Calculate the current zoom level for a 1D track
 *
 * @param  {object} tilesetInfo The tileset info for the track. Should contain
 *                              min_pos and max_pos arrays, each of which has one
 *                              value which stores the minimum and maximum data
 *                              positions respectively.
 * @param  {function} xScale      The current D3 scale function for the track.
 * @param  {number} maxZoom     The maximum zoom level allowed by the track.
 * @return {number}                The current zoom level of the track.
 */
const calculate1DZoomLevel = (tilesetInfo, xScale, maxZoom) => {
    if (typeof maxZoom === 'undefined') {
        maxZoom = Number.MAX_SAFE_INTEGER;
    }
    // offset by 2 because 1D tiles are more dense than 2D tiles
    // 1024 points per tile vs 256 for 2D tiles
    if (tilesetInfo.resolutions) {
        const zoomIndexX = tileProxy.calculateZoomLevelFromResolutions(tilesetInfo.resolutions, xScale);

        return zoomIndexX;
    }

    // the tileProxy calculateZoomLevel function only cares about the
    // difference between the minimum and maximum position
    const xZoomLevel = tileProxy.calculateZoomLevel(
        xScale,
        tilesetInfo.min_pos[0],
        tilesetInfo.max_pos[0],
        tilesetInfo.bins_per_dimension || tilesetInfo.tile_size
    );

    const zoomLevel = Math.min(xZoomLevel, maxZoom);
    return Math.max(zoomLevel, 0);
};

/**
 * Calculate which tiles should be visible given a track's
 * scale.
 *
 * @param  {object} tilesetInfo The track's tileset info, containing either the `resolutions`
 *                              list or min_pos and max_pos arrays
 * @param  {function} scale     The track's D3 scale function.
 * @return {array}             A list of visible tiles (e.g. [[1,0],[1,1]])
 */
export const calculate1DVisibleTiles = (tilesetInfo, scale) => {
    // if we don't know anything about this dataset, no point
    // in trying to get tiles
    if (!tilesetInfo) {
        return [];
    }

    // calculate the zoom level given the scales and the data bounds
    const zoomLevel = calculate1DZoomLevel(tilesetInfo, scale, tilesetInfo.max_zoom);

    if (tilesetInfo.resolutions) {
        const sortedResolutions = tilesetInfo.resolutions.map(x => +x).sort((a, b) => b - a);

        const xTiles = tileProxy.calculateTilesFromResolution(
            sortedResolutions[zoomLevel],
            scale,
            tilesetInfo.min_pos[0],
            tilesetInfo.max_pos[0]
        );

        const tiles = xTiles.map(x => [zoomLevel, x]);

        return tiles;
    }

    // x doesn't necessary mean 'x' axis, it just refers to the relevant axis
    // (x if horizontal, y if vertical)
    const xTiles = tileProxy.calculateTiles(
        zoomLevel,
        scale,
        tilesetInfo.min_pos[0],
        tilesetInfo.max_pos[0],
        tilesetInfo.max_zoom,
        tilesetInfo.max_width
    );

    const tiles = xTiles.map(x => [zoomLevel, x]);
    return tiles;
};
