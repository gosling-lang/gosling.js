import type { DummyTrackOptions } from '@gosling-lang/dummy-track';
import { type TrackDef, TrackType } from './main';
import { type ProcessedDummyTrack } from './types';
import { getAxisTrackDef } from './axis';
import type { CompleteThemeDeep } from 'src/core/utils/theme';
import type { AxisTrackOptions } from '@gosling-lang/genomic-axis';

export function processDummyTrack(
    track: ProcessedDummyTrack,
    boundingBox: { x: number; y: number; width: number; height: number },
    theme: Required<CompleteThemeDeep>
): (TrackDef<DummyTrackOptions> | TrackDef<AxisTrackOptions>)[] {
    const trackDefs: (TrackDef<DummyTrackOptions> | TrackDef<AxisTrackOptions>)[] = [];

    // Adds the axis tracks
    const [newTrackBbox, axisTrackDefs] = getAxisTrackDef(track, boundingBox, theme);
    if (axisTrackDefs) {
        // Only add the axis track if it is not overlayed on top of the Gosling track
        if (!track.overlayOnPreviousTrack) trackDefs.push(...axisTrackDefs);
        // modify the bounding box to exclude the axis track
        // warning: there could be some weirdness around overlayOnPreviousTrack here that needs to be tested
        boundingBox = newTrackBbox;
    }

    const trackDef: TrackDef<DummyTrackOptions> = {
        type: TrackType.Dummy,
        trackId: track.id,
        boundingBox,
        options: {
            width: boundingBox.width,
            height: boundingBox.height,
            layout: track.layout,
            outerRadius: 'outerRadius' in track ? track.outerRadius : undefined,
            innerRadius: 'innerRadius' in track ? track.innerRadius : undefined,
            ...track.style,
            title: track.title ?? ''
        }
    };

    trackDefs.push(trackDef);
    return trackDefs;
}
