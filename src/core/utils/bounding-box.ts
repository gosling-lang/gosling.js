import { GeminiSpec, Track } from '../gemini.schema';
import { DEFAULT_TRACK_HEIGHT, DEFAULT_TRACK_WIDTH } from '../layout/defaults';
import { resolveSuperposedTracks } from '../utils/superpose';

/**
 * Position information of each track.
 */
export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
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

/**
 * Calculate the arrangement information of tracks in linear layouts.
 */
export function getTrackArrangementInfo(spec: GeminiSpec, trackLevel?: boolean) {
    const info: TrackInfo[] = [];
    const wrap: number = spec.layout?.wrap ?? 999;

    // Number of cells in the tabular layout
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

    // Consider gaps between tracks.
    const gap: number = spec.layout?.gap ?? 0;
    if (gap !== 0) {
        // If `gap` is not zero, we add empty tracks between tracks.
        numRows += numRows - 1;
        numCols += numCols - 1;
    }
    const emptyTrack = {
        mark: 'empty',
        data: { type: 'csv', url: '' },
        width: gap,
        height: gap
    } as Track;

    // Size of columns and rows
    const colSizes = Array(numCols).fill(0);
    const rowSizes = Array(numRows).fill(0);

    // Iterate tracks to determine the size of columns and rows. We use the largest size of tracks that belongs to each column/row.
    let colI = 0;
    let rowI = 0;
    const correctedTracks: Track[] = [];
    spec.tracks.forEach((track, i) => {
        correctedTracks.push(track);

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

            if (gap !== 0 && spec.tracks.length > i + 1) {
                if (colSizes[colI] < gap) {
                    colSizes[colI] = gap;
                }
                Array(span)
                    .fill(0)
                    .forEach(() => correctedTracks.push(JSON.parse(JSON.stringify(emptyTrack))));
                colI++;
            }

            if (colI >= numCols) {
                colI = 0;
                rowI++;

                if (gap !== 0 && spec.tracks.length > i + 1) {
                    if (rowSizes[rowI] < gap) {
                        rowSizes[rowI] = gap;
                    }
                    Array(numCols)
                        .fill(0)
                        .forEach(() => correctedTracks.push(JSON.parse(JSON.stringify(emptyTrack))));
                    rowI++;
                }
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

            if (gap !== 0 && spec.tracks.length > i + 1) {
                if (rowSizes[rowI] < gap) {
                    rowSizes[rowI] = gap;
                }
                Array(span)
                    .fill(0)
                    .forEach(() => correctedTracks.push(JSON.parse(JSON.stringify(emptyTrack))));
                rowI++;
            }

            if (rowI >= numRows) {
                rowI = 0;
                colI++;

                if (gap !== 0 && spec.tracks.length > i + 1) {
                    if (colSizes[colI] < gap) {
                        colSizes[colI] = gap;
                    }
                    Array(numRows)
                        .fill(0)
                        .forEach(() => correctedTracks.push(JSON.parse(JSON.stringify(emptyTrack))));
                    colI++;
                }
            }
        }
    });

    const totalWidth = colSizes.reduce((a, b) => a + b, 0);
    const totalHeight = rowSizes.reduce((a, b) => a + b, 0);

    if (!trackLevel) {
        // Just return the bounding box of entire tracks.
        return {
            x: 0,
            y: 0,
            width: totalWidth,
            height: totalHeight
        };
    }

    // Iterate tracks again to generate arrangement information using the size of tabular layouts.
    colI = 0;
    rowI = 0;
    correctedTracks.forEach(track => {
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
