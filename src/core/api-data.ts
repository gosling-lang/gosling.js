import type { BoundingBox, GoslingSpec, PartialTrack, TrackMouseEventData, View } from "@gosling.schema";
import { getInternalSpecById, getTrackIds, getViewIds } from "./track-and-view-ids";

export function getViewApiData(spec: GoslingSpec, tracks: TrackMouseEventData[]) {
    return getViewIds(spec).map(id => {
        const internalSpec = getInternalSpecById(spec, id);
        const trackIds = getTrackIds(internalSpec as View | PartialTrack);
        const bb = { 
            x: Number.MAX_SAFE_INTEGER, 
            y: Number.MAX_SAFE_INTEGER, 
            xe: -Number.MAX_SAFE_INTEGER, 
            ye: -Number.MAX_SAFE_INTEGER 
        };
        trackIds.map(trackId => tracks.find(t => t.id === trackId)).forEach(track => {
            if(!track) return;
            const { shape } = track;
            if('cx' in shape) {
                // circular track
                if(bb.x > shape.cx - shape.outerRadius) {
                    bb.x = shape.cx - shape.outerRadius;
                }
                if(bb.y > shape.cy - shape.outerRadius) {
                    bb.y = shape.cy - shape.outerRadius;
                }
                if(bb.xe < shape.cx + shape.outerRadius) {
                    bb.xe = shape.cx + shape.outerRadius;
                }
                if(bb.ye < shape.cy + shape.outerRadius) {
                    bb.ye = shape.cy + shape.outerRadius;
                }
            } else {
                // linear track
                if(bb.x > shape.x) {
                    bb.x = shape.x;
                }
                if(bb.y > shape.y) {
                    bb.y = shape.y;
                }
                if(bb.xe < shape.x + shape.width) {
                    bb.xe = shape.x + shape.width;
                }
                if(bb.ye < shape.y + shape.height) {
                    bb.ye = shape.y + shape.height;
                }
            }
        });
        return {
            id,
            spec: internalSpec as View,
            shape: { ...bb, width: bb.xe - bb.x, height: bb.ye - bb.y }
        }
    });
}