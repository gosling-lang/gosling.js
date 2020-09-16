import { IsSemanticZoomRedefinition, Track } from '../../core/gemini.schema';

export function getMaxZoomLevel() {
    // TODO: How to calculate maxZoomLevel?
    const TILE_SIZE = 256;
    const totalLength = 4795370;
    return Math.ceil(Math.log(totalLength / TILE_SIZE) / Math.log(2));
}

/**
 * Find whether the semantic zooming is triggered or not.
 */
export function isSemanticZoomTriggered(track: Track, zoomLevel: number): boolean {
    const semanticZoom = track.semanticZoom;
    if (IsSemanticZoomRedefinition(semanticZoom)) {
        if (semanticZoom.trigger.type === 'less-than') {
            return semanticZoom.trigger.condition.zoomLevel > zoomLevel;
        } else if (semanticZoom.trigger.type === 'greater-than') {
            return semanticZoom.trigger.condition.zoomLevel < zoomLevel;
        } else {
            return false;
        }
    }
    return false;
}
