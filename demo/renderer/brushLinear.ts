import { type SingleTrack, type Track } from '@gosling-lang/gosling-schema';
import type { BrushLinearTrackOptions } from '@gosling-lang/brush-linear';
import type { BrushCircularTrackOptions } from '@gosling-lang/brush-circular';
import { type TrackDef, TrackType } from './main';

export function getBrushTrackDefs(
    spec: Track,
    boundingBox: { x: number; y: number; width: number; height: number }
): TrackDef<BrushLinearTrackOptions>[] | TrackDef<BrushCircularTrackOptions>[] {
    const trackDefs: TrackDef<BrushLinearTrackOptions>[] = [];
    // If we have a linear layout, we use the BrushLinearTrack
    if (!spec._overlay) return [];

    spec._overlay.forEach((overlay: SingleTrack) => {
        if (overlay.mark !== 'brush') return;

        if (spec.layout === 'linear') {
            const options = getBrushLinearOptions(spec);
            trackDefs.push({
                type: TrackType.BrushLinear,
                trackId: overlay.id,
                boundingBox: { ...boundingBox },
                options
            });
        } else if (spec.layout === 'circular') {
            // If we have a circular layout, we use the BrushCircularTrack
            const options = getBrushCircularOptions(spec);
            trackDefs.push({
                type: TrackType.BrushCircular,
                trackId: overlay.id,
                boundingBox: { ...boundingBox },
                options
            });
        }
    });
    return trackDefs;
}

/**
 * Get the options for a BrushLinearTrack
 */
function getBrushLinearOptions(spec: Track): BrushLinearTrackOptions {
    const options = {
        projectionFillColor: spec.color?.value ?? 'red',
        projectionStrokeColor: spec.stroke?.value ?? 'red',
        projectionFillOpacity: spec.opacity?.value ?? 0.3,
        projectionStrokeOpacity: spec.opacity?.value ?? 0.3,
        strokeWidth: spec.strokeWidth?.value ?? 1
    };
    return options;
}

/**
 * Get the options for a BrushCircularTrack
 */
function getBrushCircularOptions(spec: Track): BrushCircularTrackOptions {
    const options = {
        projectionFillColor: spec.color?.value ?? 'red',
        projectionStrokeColor: 'black',
        projectionFillOpacity: 0.3,
        projectionStrokeOpacity: 0.3,
        strokeWidth: 0.3,
        startAngle: spec.startAngle ?? 7.2,
        endAngle: spec.endAngle ?? 352.8,
        innerRadius: spec.innerRadius ?? 151.08695652173913,
        outerRadius: spec.outerRadius ?? 250,
        axisPositionHorizontal: 'left'
    };
    return options;
}
