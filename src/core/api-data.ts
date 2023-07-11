import type { GoslingSpec, PartialTrack, TrackMouseEventData, View } from '@gosling.schema';
import { getInternalSpecById, getTrackIds, getViewIds } from './track-and-view-ids';

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
        trackIds
            .map(trackId => tracks.find(t => t.id === trackId))
            .forEach(track => {
                if (!track) return;
                const { shape } = track;
                if (bb.x > shape.x) {
                    bb.x = shape.x;
                }
                if (bb.y > shape.y) {
                    bb.y = shape.y;
                }
                if (bb.xe < shape.x + shape.width) {
                    bb.xe = shape.x + shape.width;
                }
                if (bb.ye < shape.y + shape.height) {
                    bb.ye = shape.y + shape.height;
                }
            });
        return {
            id,
            spec: internalSpec as View,
            shape: { ...bb, width: bb.xe - bb.x, height: bb.ye - bb.y }
        };
    });
}
