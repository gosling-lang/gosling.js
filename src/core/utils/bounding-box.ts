import { GeminiSpec, Track } from '../gemini.schema';
import { DEFAULT_TRACK_HEIGHT, DEFAULT_TRACK_WIDTH } from '../layout/defaults';
import { resolveSuperposedTracks } from '../utils/superpose';

export interface Size {
    width: number;
    height: number;
}

/**
 * Position information of each track.
 */
export interface BoundingBox extends Size {
    x: number;
    y: number;
}

/**
 * Relative positioning of views, used in HiGlass view configs as `layout`.
 */
export interface RelativePosition {
    w: number;
    h: number;
    x: number;
    y: number;
}

/**
 * Track information for its arrangement.
 */
export interface TrackInfo {
    track: Track;
    boundingBox: BoundingBox;
    layout: RelativePosition;
}

export function visualizationSize(spec: GeminiSpec, isTrackLevel?: boolean): Size {
    if (spec.layout?.gap && spec.layout?.gap !== 0) {
        // this function only uses the spec that the gap is already processed
        return { width: 0, height: 0 };
    }

    if (spec.width && spec.height && !isTrackLevel) {
        // Both the width and height are defined in the root-level of the spec, so just return them.
        return spec as Size;
    }

    // Total number of cells in the tabular layout
    const numCells = spec.tracks.map(t => (typeof t.span === 'number' ? t.span : 1)).reduce((a, b) => a + b, 0);

    const wrap: number = spec.layout?.wrap ?? 999;

    // Number of columns and rows
    let numCols = 0;
    let numRows = 0;
    if (spec.layout?.direction === 'horizontal') {
        numRows = Math.ceil(numCells / wrap);
        numCols = Math.min(wrap, numCells);
    } else {
        // by default, vertical
        numCols = Math.ceil(numCells / wrap);
        numRows = Math.min(wrap, numCells);
    }

    // Size of columns and rows
    const colSizes = Array(numCols).fill(0);
    const rowSizes = Array(numRows).fill(0);

    // Iterate tracks to determine the size of columns and rows. We use the largest size of tracks that belongs to each column/row.
    let colI = 0;
    let rowI = 0;
    spec.tracks.forEach(track => {
        const span = typeof track.span === 'number' ? track.span : 1;

        const trackWidth = (resolveSuperposedTracks(track)[0].width as number) ?? DEFAULT_TRACK_WIDTH;
        const trackHeight = (resolveSuperposedTracks(track)[0].height as number) ?? DEFAULT_TRACK_HEIGHT;

        const unitWidth = trackWidth / span;
        const unitHeight = trackHeight / span;

        if (spec.layout?.direction === 'horizontal') {
            if (rowSizes[rowI] < trackHeight) {
                rowSizes[rowI] = trackHeight;
            }

            Array(span)
                .fill(0)
                .forEach((s, i) => {
                    if (colSizes[colI + i] < unitWidth) {
                        colSizes[colI + i] = unitWidth;
                    }
                });

            colI += span;

            if (colI >= numCols) {
                colI = 0;
                rowI++;
            }
        } else {
            rowI += span;

            // by default, vertical direction
            if (colSizes[colI] < trackWidth) {
                colSizes[colI] = trackWidth;
            }
            Array(span)
                .fill(0)
                .forEach(() => {
                    if (rowSizes[rowI] < unitHeight) {
                        rowSizes[rowI] = unitHeight;
                    }
                });

            if (rowI >= numRows) {
                rowI = 0;
                colI++;
            }
        }
    });

    const cumWidth = colSizes.reduce((a, b) => a + b, 0);
    const cumHeight = rowSizes.reduce((a, b) => a + b, 0);

    // console.log(colSizes, rowSizes);

    return {
        width: isTrackLevel ? cumWidth : spec.width ?? cumWidth,
        height: isTrackLevel ? cumHeight : spec.height ?? cumHeight
    };
}

/**
 * Width and height of the entire visualization
 * @param spec
 */
export function getEntireBoundingBox(spec: GeminiSpec, isTrackLevel?: boolean): Size {
    if (spec.width && spec.height && !isTrackLevel) {
        // Both the width and height are defined in the root-level of the spec, so just return them.
        return spec as Size;
    }

    const wrap: number = spec.layout?.wrap ?? 999;

    // Total number of cells in the tabular layout
    const numCells = spec.tracks.map(t => (typeof t.span === 'number' ? t.span : 1)).reduce((a, b) => a + b, 0);

    // Number of columns and rows
    let numCols = 0;
    let numRows = 0;
    if (spec.layout?.direction === 'horizontal') {
        numRows = Math.ceil(numCells / wrap);
        numCols = Math.min(wrap, numCells);
    } else {
        // by default, vertical
        numCols = Math.ceil(numCells / wrap);
        numRows = Math.min(wrap, numCells);
    }

    // Consider gaps between tracks
    const gap: number = spec.layout?.gap ?? 0;
    if (gap !== 0) {
        // If `gap` is not zero, we add empty tracks between regular tracks.
        numRows += numRows - 1;
        numCols += numCols - 1;
    }

    // Size of columns and rows
    const colSizes = Array(numCols).fill(0);
    const rowSizes = Array(numRows).fill(0);

    // Iterate tracks to determine the size of columns and rows. We use the largest size of tracks that belongs to each column/row.
    let colI = 0;
    let rowI = 0;
    spec.tracks.forEach((track, i) => {
        const span = typeof track.span === 'number' ? track.span : 1;

        const trackWidth = (resolveSuperposedTracks(track)[0].width as number) ?? DEFAULT_TRACK_WIDTH;
        const trackHeight = (resolveSuperposedTracks(track)[0].height as number) ?? DEFAULT_TRACK_HEIGHT;

        const unitWidth = trackWidth / span;
        const unitHeight = trackHeight / span;

        if (spec.layout?.direction === 'horizontal') {
            if (rowSizes[rowI] < trackHeight) {
                rowSizes[rowI] = trackHeight;
            }

            Array(span)
                .fill(0)
                .forEach((s, j) => {
                    if (colSizes[colI + j * 2] < unitWidth) {
                        colSizes[colI + j * 2] = unitWidth;
                    }
                });

            colI += span;

            if (gap !== 0 && spec.tracks.length > i + 1) {
                if (colSizes[colI] < gap) {
                    colSizes[colI] = gap;
                }
                colI++;
            }

            if (colI >= numCols) {
                colI = 0;
                rowI++;

                if (gap !== 0 && spec.tracks.length > i + 1) {
                    if (rowSizes[rowI] < gap) {
                        rowSizes[rowI] = gap;
                    }
                    rowI++;
                }
            }
        } else {
            rowI += span;

            // by default, vertical direction
            if (colSizes[colI] < trackWidth) {
                colSizes[colI] = trackWidth;
            }
            Array(span)
                .fill(0)
                .forEach(() => {
                    if (rowSizes[rowI] < unitHeight) {
                        rowSizes[rowI] = unitHeight;
                    }
                });

            if (gap !== 0 && spec.tracks.length > i + 1) {
                if (rowSizes[rowI] < gap) {
                    rowSizes[rowI] = gap;
                }
                rowI++;
            }

            if (rowI >= numRows) {
                rowI = 0;
                colI++;

                if (gap !== 0 && spec.tracks.length > i + 1) {
                    if (colSizes[colI] < gap) {
                        colSizes[colI] = gap;
                    }
                    colI++;
                }
            }
        }
    });

    const cumWidth = colSizes.reduce((a, b) => a + b, 0);
    const cumHeight = rowSizes.reduce((a, b) => a + b, 0);

    // console.log(colSizes, rowSizes);

    return {
        width: isTrackLevel ? cumWidth : spec.width ?? cumWidth,
        height: isTrackLevel ? cumHeight : spec.height ?? cumHeight
    };
}

// TODO: many parts in this function are identical to the above function.
/**
 * Calculate the arrangement information of tracks in linear layouts.
 */
export function getTrackArrangementInfo(spec: GeminiSpec): TrackInfo[] {
    const info: TrackInfo[] = [];
    const wrap: number = spec.layout?.wrap ?? 999;

    // Total number of cells in the tabular layout
    const numCells =
        +spec.tracks.length +
        spec.tracks.map(t => (typeof t.span === 'number' ? t.span - 1 : 0)).reduce((a, b) => a + b, 0);

    // Number of columns and rows
    let numCols = 0;
    let numRows = 0;
    if (spec.layout?.direction === 'horizontal') {
        numRows = Math.ceil(numCells / wrap);
        numCols = Math.min(wrap, numCells);
    } else {
        // by default, vertical
        numCols = Math.ceil(numCells / wrap);
        numRows = Math.min(wrap, numCells);
    }

    // Size of columns and rows
    const colSizes = Array(numCols).fill(0);
    const rowSizes = Array(numRows).fill(0);

    // Iterate tracks to determine the size of columns and rows. We use the largest size of tracks that belongs to each column/row.
    let colI = 0;
    let rowI = 0;
    spec.tracks.forEach(track => {
        const span = typeof track.span === 'number' ? track.span : 1;

        const trackWidth = (resolveSuperposedTracks(track)[0].width as number) ?? DEFAULT_TRACK_WIDTH;
        const trackHeight = (resolveSuperposedTracks(track)[0].height as number) ?? DEFAULT_TRACK_HEIGHT;

        const unitWidth = trackWidth / span;
        const unitHeight = trackHeight / span;

        if (spec.layout?.direction === 'horizontal') {
            if (rowSizes[rowI] < trackHeight) {
                rowSizes[rowI] = trackHeight;
            }
            Array(span)
                .fill(0)
                .forEach(() => {
                    if (colSizes[colI] < unitWidth) {
                        colSizes[colI] = unitWidth;
                    }
                    colI += span;
                });

            if (colI >= numCols) {
                colI = 0;
                rowI++;
            }
        } else {
            // by default, vertical direction
            if (colSizes[colI] < trackWidth) {
                colSizes[colI] = trackWidth;
            }
            Array(span)
                .fill(0)
                .forEach(() => {
                    if (rowSizes[rowI] < unitHeight) {
                        rowSizes[rowI] = unitHeight;
                    }
                    rowI += span;
                });

            if (rowI >= numRows) {
                rowI = 0;
                colI++;
            }
        }
    });

    const { width: totalWidth, height: totalHeight } = getEntireBoundingBox(spec);

    // Iterate tracks again to generate arrangement information using the size of tabular layouts.
    colI = 0;
    rowI = 0;
    spec.tracks.forEach(track => {
        const span = typeof track.span === 'number' ? track.span : 1;

        const width = (resolveSuperposedTracks(track)[0].width as number) ?? DEFAULT_TRACK_WIDTH;
        const height = (resolveSuperposedTracks(track)[0].height as number) ?? DEFAULT_TRACK_HEIGHT;

        const cumWidth = colSizes.slice(0, colI).reduce((a, b) => a + b, 0);
        const cumHeight = rowSizes.slice(0, rowI).reduce((a, b) => a + b, 0);

        info.push({
            track,
            boundingBox: { x: cumWidth, y: cumHeight, width, height },
            layout: {
                x: (cumWidth / totalWidth) * 12.0,
                y: (cumHeight / totalHeight) * 12.0,
                w: (width / totalWidth) * 12.0,
                h: (height / totalHeight) * 12.0
            }
        });

        if (spec.layout?.direction === 'horizontal') {
            colI += span;

            if (colI >= numCols) {
                colI = 0;
                rowI++;
            }
        } else {
            // by default, vertical direction
            rowI += span;

            if (rowI >= numRows) {
                rowI = 0;
                colI++;
            }
        }
    });
    // console.log(info);
    return info;
}
