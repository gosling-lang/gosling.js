import { GeminiSpec } from '../gemini.schema';
import { TRACK_GAP, INNER_CIRCLE_RADIUS } from '../layout/defaults';
import * as d3 from 'd3';
import { resolveSuperposedTracks } from '../utils/superpose';

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Naive approach to calculate the entire size of a Gemini view.
 */
export function calculateBoundingBox(spec: GeminiSpec) {
    const size = { width: 0, height: 0 };
    const wrap: number = spec.layout?.wrap ?? 999;
    if (spec.layout?.type === 'circular') {
        // square and tightest bounding box enclousing circular tracks
        size.height = INNER_CIRCLE_RADIUS * 2;
        size.height += d3.sum(
            // Add the height of tracks in the first column.
            // TODO: not considering different directions
            spec.tracks
                .filter((t, i) => i % wrap === 0)
                .map(track => resolveSuperposedTracks(track)[0].height as number)
        );
        size.width = size.height;
    } else if (spec.layout?.direction === 'horizontal') {
        size.width = d3.sum(
            // Add the width of tracks in the first row.
            spec.tracks.filter((t, i) => i < wrap).map(track => resolveSuperposedTracks(track)[0].width as number)
        );
        size.height = d3.sum(
            // Add the height of tracks in the first column.
            spec.tracks
                .filter((t, i) => i % wrap === 0)
                .map(track => resolveSuperposedTracks(track)[0].height as number)
        ) as number;
        // Add gaps
        size.width += (d3.min([wrap - 1, spec.tracks.length - 1]) as number) * TRACK_GAP;
        size.height += Math.floor(spec.tracks.length / wrap) * TRACK_GAP;
    } else {
        size.width = d3.sum(
            // Add the width of tracks in the first row.
            spec.tracks.filter((t, i) => i % wrap === 0).map(track => resolveSuperposedTracks(track)[0].width as number)
        );
        size.height = d3.sum(
            // Add the height of tracks in the first column.
            spec.tracks.filter((t, i) => i < wrap).map(track => resolveSuperposedTracks(track)[0].height as number)
        ) as number;
        // Add gaps
        size.width += Math.floor(spec.tracks.length / wrap) * TRACK_GAP;
        size.height += (d3.min([wrap - 1, spec.tracks.length - 1]) as number) * TRACK_GAP;
    }
    return size;
}
