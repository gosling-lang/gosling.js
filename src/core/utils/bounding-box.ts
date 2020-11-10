import { GeminiSpec, Track } from '../gemini.schema';
import { DEFAULT_TRACK_GAP, DEFAULT_TRACK_HEIGHT, DEFAULT_TRACK_WIDTH } from '../layout/defaults';
import { resolveSuperposedTracks } from '../utils/superpose';
import { arrayRepeat } from './array';

export interface Size {
    width: number;
    height: number;
}

export interface GridInfo extends Size {
    columnSizes: number[];
    rowSizes: number[];
    columnGaps: number[];
    rowGaps: number[];
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

/**
 *
 * @param spec
 */
export function getGridInfo(spec: GeminiSpec): GridInfo {
    // total number of cells in the tabular layout
    const numCells = spec.tracks.map(t => (typeof t.span === 'number' ? t.span : 1)).reduce((a, b) => a + b, 0);
    const wrap: number = spec.layout?.wrap ?? 999;

    let numColumns = 0,
        numRows = 0;
    if (spec.layout?.direction === 'horizontal') {
        numRows = Math.ceil(numCells / wrap);
        numColumns = Math.min(wrap, numCells);
    } else {
        // by default, vertical
        numColumns = Math.ceil(numCells / wrap);
        numRows = Math.min(wrap, numCells);
    }

    // undefined | [number, number, ...] | number
    const baseColumnSizes =
        spec.layout?.columnSizes === undefined
            ? [DEFAULT_TRACK_WIDTH]
            : typeof spec.layout?.columnSizes === 'number'
            ? [spec.layout?.columnSizes]
            : spec.layout?.columnSizes;
    const baseRowSizes =
        spec.layout?.rowSizes === undefined
            ? [DEFAULT_TRACK_HEIGHT]
            : typeof spec.layout?.rowSizes === 'number'
            ? [spec.layout?.rowSizes]
            : spec.layout?.rowSizes;
    const baseColumnGaps =
        spec.layout?.columnGaps === undefined
            ? [DEFAULT_TRACK_GAP]
            : typeof spec.layout?.columnGaps === 'number'
            ? [spec.layout?.columnGaps]
            : spec.layout?.columnGaps;
    const baseRowGaps =
        spec.layout?.rowGaps === undefined
            ? [DEFAULT_TRACK_GAP]
            : typeof spec.layout?.rowGaps === 'number'
            ? [spec.layout?.rowGaps]
            : spec.layout?.rowGaps;

    const columnSizes = arrayRepeat(baseColumnSizes, numColumns);
    const rowSizes = arrayRepeat(baseRowSizes, numRows);
    const columnGaps = arrayRepeat(baseColumnGaps, numColumns - 1);
    const rowGaps = arrayRepeat(baseRowGaps, numRows - 1);

    const width = columnSizes.reduce((a, b) => a + b, 0) + columnGaps.reduce((a, b) => a + b, 0);
    const height = rowSizes.reduce((a, b) => a + b, 0) + rowGaps.reduce((a, b) => a + b, 0);

    return { width, height, columnSizes, rowSizes, columnGaps, rowGaps };
}

const getGapTrack = (size: Size) => {
    return JSON.parse(
        JSON.stringify({
            mark: 'empty',
            data: { type: 'csv', url: '' },
            width: size.width,
            height: size.height
        })
    ) as Track;
};

// TODO: handle overflow by the ill-defined spec
/**
 *
 * @param spec
 */
export function getArrangement(spec: GeminiSpec): TrackInfo[] {
    const { width: totalWidth, height: totalHeight, columnSizes, rowSizes, columnGaps, rowGaps } = getGridInfo(spec);

    const numColumns = columnSizes.length;
    const numRows = rowSizes.length;

    let ci = 0;
    let ri = 0;

    const info: TrackInfo[] = [];

    spec.tracks.forEach(track => {
        const span = typeof track.span === 'number' ? track.span : 1;
        const trackWidth = resolveSuperposedTracks(track)[0].width;

        const x =
            columnSizes.slice(0, ci).reduce((a, b) => a + b, 0) + columnGaps.slice(0, ci).reduce((a, b) => a + b, 0);
        const y = rowSizes.slice(0, ri).reduce((a, b) => a + b, 0) + rowGaps.slice(0, ri).reduce((a, b) => a + b, 0);

        let width = columnSizes[ci];
        let height = rowSizes[ri];
        if (spec.layout?.direction === 'horizontal' && span !== 1) {
            width =
                columnSizes.slice(ci, ci + span).reduce((a, b) => a + b, 0) +
                columnGaps.slice(ci, ci + span).reduce((a, b) => a + b, 0);
        } else if (spec.layout?.direction === 'vertical' && span !== 1) {
            height =
                rowSizes.slice(ri, ri + span).reduce((a, b) => a + b, 0) +
                rowGaps.slice(ri, ri + span).reduce((a, b) => a + b, 0);
        }
        width = typeof trackWidth === 'number' ? Math.min(trackWidth, width) : width;
        // height = ... // NOTICE: using the smaller height is not supported

        // TODO: might need to use no `compact` options for `react-grid-layout` (e.g., verticalCompact = false)
        // reference: https://github.com/STRML/react-grid-layout/blob/master/test/examples/11-no-vertical-compact.jsx

        // Assign actual size determined by the layout definition
        track.width = width;
        track.height = height;

        info.push({
            track,
            boundingBox: { x, y, width: width, height: height },
            layout: {
                x: (x / totalWidth) * 12.0,
                y: (y / totalHeight) * 12.0,
                w: (width / totalWidth) * 12.0,
                h: (height / totalHeight) * 12.0
            }
        });

        if (spec.layout?.direction === 'horizontal') {
            ci += span;

            if (ci >= numColumns) {
                // Add between-row gaps.
                const yOffset = y + height;
                const gapHeight = rowGaps[ri];
                Array(numColumns)
                    .fill(0)
                    .forEach((_, _ci) => {
                        const xOffset =
                            columnSizes.slice(0, _ci).reduce((a, b) => a + b, 0) +
                            columnGaps.slice(0, _ci).reduce((a, b) => a + b, 0);
                        const colWidth = columnSizes[_ci];
                        info.push({
                            track: getGapTrack({ width: colWidth, height: gapHeight }),
                            boundingBox: { x: xOffset, y: yOffset, width: colWidth, height: gapHeight },
                            layout: {
                                x: (xOffset / totalWidth) * 12.0,
                                y: (yOffset / totalHeight) * 12.0,
                                w: (colWidth / totalWidth) * 12.0,
                                h: (gapHeight / totalHeight) * 12.0
                            }
                        });
                    });

                ci = 0;
                ri++;
            }
        } else {
            // by default, vertical direction
            ri += typeof track.span === 'number' ? track.span : 1;

            if (ri >= numRows) {
                ri = 0;
                ci++;
            } else {
                // Add between-row gaps.
                if (ri < numRows) {
                    const yOffset = y + height;
                    const xOffset = x;
                    const gapHeight = rowGaps[ri - 1];
                    const colWidth = width;
                    info.push({
                        track: getGapTrack({ width: colWidth, height: gapHeight }),
                        boundingBox: { x: xOffset, y: yOffset, width: colWidth, height: gapHeight },
                        layout: {
                            x: (xOffset / totalWidth) * 12.0,
                            y: (yOffset / totalHeight) * 12.0,
                            w: (colWidth / totalWidth) * 12.0,
                            h: (gapHeight / totalHeight) * 12.0
                        }
                    });
                }
            }
        }
    });

    // console.log(info);
    return info;
}
