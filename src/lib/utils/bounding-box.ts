import { GeminiSpec, IsNotEmptyTrack } from "../gemini.schema";
import { TRACK_GAP, INNER_CIRCLE_RADIUS } from "../visualizations/defaults";
import * as d3 from "d3";

export interface BoundingBox {
    x: number
    y: number
    width: number
    height: number
}

/**
 * Naive approach to calculate the entire size of visualization.
 * @param gm 
 */
export function calculateSize(gm: GeminiSpec) {
    const size = { width: 0, height: 0 };
    const wrap: number = gm.layout?.wrap ?? 999;
    if (gm.layout?.type === 'circular') {
        // TODO: https://github.com/sehilyi/gemini/issues/57
        // square and tightest bounding box enclousing circular tracks
        size.height = INNER_CIRCLE_RADIUS * 2
        size.height += d3.sum(
            // Add the height of tracks in the first column.
            // TODO: not considering different directions
            gm.tracks.filter((t, i) => i % wrap === 0)
                .map(track => IsNotEmptyTrack(track) ? track.height as number : 0)
        )
        size.width = size.height
    }
    else if (gm.layout?.direction === "horizontal") {
        size.width = d3.sum(
            // Add the width of tracks in the first row.
            gm.tracks.filter((t, i) => i < wrap)
                .map(track => IsNotEmptyTrack(track) ? track.width as number : 0)
        )
        size.height = d3.sum(
            // Add the height of tracks in the first column.
            gm.tracks.filter((t, i) => i % wrap === 0)
                .map(track => IsNotEmptyTrack(track) ? track.height as number : 0)
        ) as number
        // Add gaps
        size.width += d3.min([wrap - 1, gm.tracks.length - 1]) as number * TRACK_GAP
        size.height += Math.floor(gm.tracks.length / wrap) * TRACK_GAP
    } else {
        size.width = d3.sum(
            // Add the width of tracks in the first row.
            gm.tracks.filter((t, i) => i % wrap === 0)
                .map(track => IsNotEmptyTrack(track) ? track.width as number : 0)
        )
        size.height = d3.sum(
            // Add the height of tracks in the first column.
            gm.tracks.filter((t, i) => i < wrap)
                .map(track => IsNotEmptyTrack(track) ? track.height as number : 0)
        ) as number
        // Add gaps
        size.width += Math.floor(gm.tracks.length / wrap) * TRACK_GAP
        size.height += d3.min([wrap - 1, gm.tracks.length - 1]) as number * TRACK_GAP
    }
    return size;
}