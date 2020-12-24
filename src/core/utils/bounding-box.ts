import { GeminidSpec, Track } from '../geminid.schema';
import {
    DEFAULT_SUBTITLE_HEIGHT,
    DEFAULT_TITLE_HEIGHT,
    DEFAULT_TRACK_GAP,
    DEFAULT_TRACK_HEIGHT,
    DEFAULT_TRACK_WIDTH
} from '../layout/defaults';
import { resolveSuperposedTracks } from '../utils/superpose';
import { arrayRepeat, insertItemToArray } from './array';

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
export function getGridInfo(spec: GeminidSpec): GridInfo {
    // total number of cells in the tabular layout
    const numCells = spec.tracks
        .filter(t => !t.superposeOnPreviousTrack)
        .map(t => (typeof t.span === 'number' ? t.span : 1))
        .reduce((a, b) => a + b, 0);
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
    const columnGaps = arrayRepeat(baseColumnGaps, numColumns - 1);
    let rowSizes = arrayRepeat(baseRowSizes, numRows);
    let rowGaps = arrayRepeat(baseRowGaps, numRows - 1);

    // consider title and subtitle if any
    if (spec.title || spec.subtitle) {
        const headerHeight = (spec.title ? DEFAULT_TITLE_HEIGHT : 0) + (spec.subtitle ? DEFAULT_SUBTITLE_HEIGHT : 0);
        rowSizes = insertItemToArray(rowSizes, 0, headerHeight);
        rowGaps = insertItemToArray(rowGaps, 0, 0);
    }

    const width = columnSizes.reduce((a, b) => a + b, 0) + columnGaps.reduce((a, b) => a + b, 0);
    const height = rowSizes.reduce((a, b) => a + b, 0) + rowGaps.reduce((a, b) => a + b, 0);

    return { width, height, columnSizes, rowSizes, columnGaps, rowGaps };
}

const getTextTrack = (size: Size, title?: string, subtitle?: string) => {
    return JSON.parse(
        JSON.stringify({
            mark: 'header',
            width: size.width,
            height: size.height,
            title,
            subtitle
        })
    ) as Track;
};

// TODO: handle overflow by the ill-defined spec
/**
 *
 * @param spec
 */
export function getArrangement(spec: GeminidSpec): TrackInfo[] {
    const { width: totalWidth, height: totalHeight, columnSizes, rowSizes, columnGaps, rowGaps } = getGridInfo(spec);

    const numColumns = columnSizes.length;
    const numRows = rowSizes.length;

    let ci = 0;
    let ri = 0;

    const info: TrackInfo[] = [];

    // consider title and subtitle if any
    if (spec.title || spec.subtitle) {
        const height = rowSizes[ri];
        info.push({
            track: getTextTrack({ width: totalWidth, height }, spec.title, spec.subtitle),
            boundingBox: { x: 0, y: 0, width: totalWidth, height },
            layout: {
                x: 0,
                y: 0,
                w: 12.0,
                h: (height / totalHeight) * 12.0
            }
        });
        ri++;
    }

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

        if (track.superposeOnPreviousTrack) {
            // do not count this track to calculate cumulative sizes and positions
            return;
        }

        if (spec.layout?.direction === 'horizontal') {
            ci += typeof track.span === 'number' ? track.span : 1;

            if (ci >= numColumns && ri < numRows - 1) {
                ci = 0;
                ri++;
            }
        } else {
            // by default, vertical direction
            ri += typeof track.span === 'number' ? track.span : 1;

            if (ri >= numRows) {
                ri = 0;
                ci++;
            }
        }
    });

    // console.log(info);
    return info;
}
