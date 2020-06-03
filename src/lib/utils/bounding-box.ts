import { GeminiSpec } from "../gemini.schema";
import { VIEW_PADDING } from "../visualizations/defaults";

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Naive approach to calculate the entire size of visualization.
 * @param gm 
 */
export function calculateSize(gm: GeminiSpec) { // TODO: Use model?
    const size = { width: 0, height: 0 };
    gm.tracks.forEach((track, i) => {
        // currently, only stacking
        size.height += ((track.height as number) ?? 0);
        if (i !== gm.tracks.length - 1) size.height += VIEW_PADDING;
        size.width = Math.max((track.width as number) ?? 0, size.width);
    });
    return size;
}