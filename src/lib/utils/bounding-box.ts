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
    if (gm.layout?.direction !== "horizontal") {
        gm.tracks.forEach((track, i) => {
            size.height += ((track.height as number) ?? 0);
            if (i !== gm.tracks.length - 1) size.height += VIEW_PADDING;
            size.width = Math.max((track.width as number) ?? 0, size.width);
        });
    } else {
        gm.tracks.forEach((track, i) => {
            size.width += ((track.width as number) ?? 0);
            if (i !== gm.tracks.length - 1) size.width += VIEW_PADDING;
            size.height = Math.max((track.height as number) ?? 0, size.height);
        });
    }
    return size;
}