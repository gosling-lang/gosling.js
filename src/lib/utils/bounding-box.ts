import { GeminiSpec, IsNotEmptyTrack } from "../gemini.schema";
import { TRACK_GAP, INNER_CIRCLE_RADIUS } from "../visualizations/defaults";

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
export function calculateSize(gm: GeminiSpec) { // TODO: Use model?
    const size = { width: 0, height: 0 };
    if (gm.layout?.type === 'circular') {
        // square bounding box
        gm.tracks.forEach((track, i) => {
            if (IsNotEmptyTrack(track)) {
                size.height += ((track.height as number) ?? 0);
                if (i !== gm.tracks.length - 1) size.height += TRACK_GAP;
            }
        });
        size.width = size.height += INNER_CIRCLE_RADIUS * 2
    }
    else if (gm.layout?.direction !== "horizontal") {
        gm.tracks.forEach((track, i) => {
            if (IsNotEmptyTrack(track)) {
                size.height += ((track.height as number) ?? 0);
                if (i !== gm.tracks.length - 1) size.height += TRACK_GAP;
                size.width = Math.max((track.width as number) ?? 0, size.width);
            }
        });
    } else {
        gm.tracks.forEach((track, i) => {
            if (IsNotEmptyTrack(track)) {
                size.width += ((track.width as number) ?? 0);
                if (i !== gm.tracks.length - 1) size.width += TRACK_GAP;
                size.height = Math.max((track.height as number) ?? 0, size.height);
            }
        });
    }
    return size;
}