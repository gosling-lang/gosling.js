import { IsSemanticZoomRedefinition, LogicalOperation, Track } from '../../core/gemini.schema';

export function getMaxZoomLevel() {
    // TODO: How to correctly calculate maxZoomLevel?
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
        const level = semanticZoom.trigger.condition.zoomLevel;
        if (level === undefined) return false;
        switch (semanticZoom.trigger.operation) {
            case 'less-than':
            case 'LT':
                return level > zoomLevel;
            case 'greater-than':
            case 'GT':
                return level < zoomLevel;
            case 'less-than-or-equal-to':
            case 'LTET':
                return level >= zoomLevel;
            case 'greater-than-or-equal-to':
            case 'GTET':
                return level <= zoomLevel;
            default:
                return false;
        }
    }
    return false;
}

/**
 * Perform logical operation between a target and a reference value.
 */
export function logicalComparison(
    value: number,
    op: LogicalOperation,
    ref: number,
    transitionPadding?: number
): number {
    const padding = transitionPadding ?? 1;

    let alpha = 0;
    switch (op) {
        case 'less-than':
        case 'LT':
            alpha = ref > value ? (ref - value) / padding : 0;
            break;
        case 'less-than-or-equal-to':
        case 'LTET':
            alpha = ref >= value ? (ref - value) / padding : 0;
            break;
        case 'greater-than':
        case 'GT':
            alpha = ref < value ? (value - ref) / padding : 0;
            break;
        case 'greater-than-or-equal-to':
        case 'GTET':
            alpha = ref <= value ? (value - ref) / padding : 0;
            break;
    }

    // make sure to return a value in [0, 1]
    return alpha > 1 ? 1 : alpha < 0 ? 0 : alpha;
}
