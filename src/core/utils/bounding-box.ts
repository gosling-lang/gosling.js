import { GeminiSpec, Track } from '../gemini.schema';
import { DEFAULT_TRACK_GAP, DEFAULT_TRACK_HEIGHT, DEFAULT_TRACK_WIDTH, INNER_CIRCLE_RADIUS } from '../layout/defaults';
import * as d3 from 'd3';
import { resolveSuperposedTracks } from '../utils/superpose';
import { arrayRepeat } from './array';

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

export interface TrackInfo {
    boundingBox: BoundingBox;
    track: Track;
    layout: RelativePosition;
}

/**
 *
 */
export function getTrackPositionInfo(spec: GeminiSpec, boundingBox: BoundingBox) {
    const info: TrackInfo[] = [];
    const wrap: number = spec.layout?.wrap ?? 999;

    // length of tracks + (span-1) of each track
    const length =
        spec.tracks.length +
        spec.tracks.map(t => (typeof t.span === 'number' ? t.span - 1 : 0)).reduce((a, b) => a + b, 0);

    let numCols = 0,
        numRows = 0;
    if (spec.layout?.direction === 'horizontal') {
        numRows = Math.ceil(length / wrap);
        numCols = Math.min(wrap, length);
    } else {
        // by default, vertical
        numCols = Math.ceil(length / wrap);
        numRows = Math.min(wrap, length);
    }

    const baseColSizes =
        // can be undefined | [number, number, ...] | number
        !spec.layout?.columnSize
            ? [DEFAULT_TRACK_WIDTH]
            : typeof spec.layout?.columnSize === 'number'
            ? [spec.layout?.columnSize]
            : spec.layout?.columnSize;
    const baseRowSizes =
        // can be undefined | [number, number, ...] | number
        !spec.layout?.rowSize
            ? [DEFAULT_TRACK_HEIGHT]
            : typeof spec.layout?.rowSize === 'number'
            ? [spec.layout?.rowSize]
            : spec.layout?.rowSize;

    // size of columns and rows
    const colSizes = arrayRepeat(baseColSizes, numCols);
    const rowSizes = arrayRepeat(baseRowSizes, numRows);

    const totalWidth = colSizes.reduce((a, b) => a + b, 0) + (colSizes.length - 1) * DEFAULT_TRACK_GAP;
    const totalHeight = rowSizes.reduce((a, b) => a + b, 0) + (rowSizes.length - 1) * DEFAULT_TRACK_GAP;
    const verticalGap = (DEFAULT_TRACK_GAP / totalHeight) * 12.0;
    const horizontalGap = (DEFAULT_TRACK_GAP / totalWidth) * 12.0;

    if (spec.layout?.direction === 'horizontal') {
        let ci = 0,
            ri = 0;
        spec.tracks.forEach(track => {
            // TODO: handle overflow by the ill-defined spec
            const span = typeof track.span === 'number' ? track.span : 1;

            const trackWidth = resolveSuperposedTracks(track)[0].width;
            const trackHeight = resolveSuperposedTracks(track)[0].height;

            const x = boundingBox.x + colSizes.slice(0, ci).reduce((a, b) => a + b, 0) + ci * DEFAULT_TRACK_GAP;
            const y = boundingBox.y + rowSizes.slice(0, ri).reduce((a, b) => a + b, 0) + ri * DEFAULT_TRACK_GAP;
            const _width =
                // calculated width with `span`
                span === 1
                    ? colSizes[ci]
                    : colSizes.slice(ci, ci + span).reduce((a, b) => a + b, 0) +
                      DEFAULT_TRACK_GAP * (colSizes.slice(ci, ci + span).length - 1);
            const width =
                // use the smaller size
                typeof trackWidth === 'number' ? Math.min(trackWidth, _width) : _width;
            const height =
                // use the smaller size
                typeof trackHeight === 'number' ? Math.min(trackHeight, rowSizes[ri]) : rowSizes[ri];

            info.push({
                track,
                boundingBox: { x, y, width, height },
                layout: {
                    x: (colSizes.slice(0, ci).reduce((a, b) => a + b, 0) / totalWidth) * 12.0 + ci * horizontalGap,
                    y: (rowSizes.slice(0, ri).reduce((a, b) => a + b, 0) / totalHeight) * 12.0 + ri * verticalGap,
                    w: (width / totalWidth) * 12.0,
                    h: (height / totalHeight) * 12.0
                }
            });

            ci += span;

            if (ci >= numCols) {
                ci = 0;
                ri++;
            }
        });
    } else {
        // by default, vertical direction
        let ci = 0,
            ri = 0;
        spec.tracks.forEach(track => {
            // TODO: handle overflow by the ill-defined spec
            const span = typeof track.span === 'number' ? track.span : 1;

            const trackWidth = resolveSuperposedTracks(track)[0].width;
            const trackHeight = resolveSuperposedTracks(track)[0].height;

            const x = boundingBox.x + colSizes.slice(0, ci).reduce((a, b) => a + b, 0) + ci * DEFAULT_TRACK_GAP;
            const y = boundingBox.y + rowSizes.slice(0, ri).reduce((a, b) => a + b, 0) + ri * DEFAULT_TRACK_GAP;
            const _height =
                // calculated height with `span`
                span === 1
                    ? rowSizes[ri]
                    : rowSizes.slice(ri, ri + span).reduce((a, b) => a + b, 0) +
                      DEFAULT_TRACK_GAP * (rowSizes.slice(ri, ri + span).length - 1);
            const width =
                // use the smaller size
                typeof trackWidth === 'number' ? Math.min(trackWidth, colSizes[ci]) : colSizes[ci];
            const height =
                // use the smaller size
                typeof trackHeight === 'number' ? Math.min(trackHeight, _height) : _height;

            info.push({
                track,
                boundingBox: { x, y, width, height },
                layout: {
                    x: (colSizes.slice(0, ci).reduce((a, b) => a + b, 0) / totalWidth) * 12.0 + ci * horizontalGap,
                    y: (rowSizes.slice(0, ri).reduce((a, b) => a + b, 0) / totalHeight) * 12.0 + ri * verticalGap,
                    w: (width / totalWidth) * 12.0,
                    h: (height / totalHeight) * 12.0
                }
            });

            ri += typeof track.span === 'number' ? track.span : 1;

            if (ri >= numRows) {
                ri = 0;
                ci++;
            }
        });
    }

    return info;
}

/**
 *
 */
export function getBoundingBox(spec: GeminiSpec) {
    if (spec.layout?.type === 'circular') {
        // no support for circular yet
        return undefined;
    }

    // length of tracks + (span-1) of each track
    const length =
        spec.tracks.length +
        spec.tracks.map(t => (typeof t.span === 'number' ? t.span - 1 : 0)).reduce((a, b) => a + b, 0);
    const wrap: number = spec.layout?.wrap ?? 999;

    let numCols = 0,
        numRows = 0;
    if (spec.layout?.direction === 'horizontal') {
        numRows = Math.ceil(length / wrap);
        numCols = Math.min(wrap, length);
    } else {
        // by default, vertical
        numCols = Math.ceil(length / wrap);
        numRows = Math.min(wrap, length);
    }

    const baseColSizes =
        // can be undefined | [number, number, ...] | number
        !spec.layout?.columnSize
            ? [DEFAULT_TRACK_WIDTH]
            : typeof spec.layout?.columnSize === 'number'
            ? [spec.layout?.columnSize]
            : spec.layout?.columnSize;
    const baseRowSizes =
        // can be undefined | [number, number, ...] | number
        !spec.layout?.rowSize
            ? [DEFAULT_TRACK_HEIGHT]
            : typeof spec.layout?.rowSize === 'number'
            ? [spec.layout?.rowSize]
            : spec.layout?.rowSize;

    const colSizes = arrayRepeat(baseColSizes, numCols);
    const rowSizes = arrayRepeat(baseRowSizes, numRows);

    return {
        x: 0,
        y: 0,
        width: colSizes.reduce((a, b) => a + b, 0) + (colSizes.length - 1) * DEFAULT_TRACK_GAP,
        height: rowSizes.reduce((a, b) => a + b, 0) + (rowSizes.length - 1) * DEFAULT_TRACK_GAP
    };
}

/**
 * (deprecated) Naive approach to calculate the entire size of a Gemini view.
 */
export function calculateBoundingBox(spec: GeminiSpec) {
    const bb = { width: 0, height: 0 };
    const wrap: number = spec.layout?.wrap ?? 999;
    if (spec.layout?.type === 'circular') {
        // square and tightest bounding box enclousing circular tracks
        bb.height = INNER_CIRCLE_RADIUS * 2;
        bb.height += d3.sum(
            // Add the height of tracks in the first column.
            // TODO: not considering different directions
            spec.tracks
                .filter((t, i) => i % wrap === 0)
                .map(track => resolveSuperposedTracks(track)[0].height as number)
        );
        bb.width = bb.height;
    } else if (spec.layout?.direction === 'horizontal') {
        bb.width = d3.sum(
            // Add the width of tracks in the first row.
            spec.tracks.filter((t, i) => i < wrap).map(track => resolveSuperposedTracks(track)[0].width as number)
        );
        bb.height = d3.sum(
            // Add the height of tracks in the first column.
            spec.tracks
                .filter((t, i) => i % wrap === 0)
                .map(track => resolveSuperposedTracks(track)[0].height as number)
        ) as number;
        // Add gaps
        bb.width += (d3.min([wrap - 1, spec.tracks.length - 1]) as number) * DEFAULT_TRACK_GAP;
        bb.height += Math.floor(spec.tracks.length / wrap) * DEFAULT_TRACK_GAP;
    } else {
        bb.width = d3.sum(
            // Add the width of tracks in the first row.
            spec.tracks.filter((t, i) => i % wrap === 0).map(track => resolveSuperposedTracks(track)[0].width as number)
        );
        bb.height = d3.sum(
            // Add the height of tracks in the first column.
            spec.tracks.filter((t, i) => i < wrap).map(track => resolveSuperposedTracks(track)[0].height as number)
        ) as number;
        // Add gaps
        bb.width += Math.floor(spec.tracks.length / wrap) * DEFAULT_TRACK_GAP;
        bb.height += (d3.min([wrap - 1, spec.tracks.length - 1]) as number) * DEFAULT_TRACK_GAP;
    }
    return bb;
}
