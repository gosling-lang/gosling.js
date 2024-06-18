import { type SingleTrack, type Track } from '@gosling-lang/gosling-schema';
import type { BrushLinearTrackOptions } from '@gosling-lang/brush-linear';

export function getBrushTrackOptions(spec: Track) {
    if (!spec._overlay) {
        return [];
    }

    const brushTrackOptions: BrushLinearTrackOptions[] = [];

    spec._overlay.forEach((overlay: SingleTrack) => {
        if (overlay.mark === 'brush') {
            const options = {
                projectionFillColor: spec.color?.value ?? 'red',
                projectionStrokeColor: spec.stroke?.value ?? 'red',
                projectionFillOpacity: spec.opacity?.value ?? 0.3,
                projectionStrokeOpacity: spec.opacity?.value ?? 0.3,
                strokeWidth: spec.strokeWidth?.value ?? 1
            };
            brushTrackOptions.push(options);
        }
    });
    return brushTrackOptions;
}
