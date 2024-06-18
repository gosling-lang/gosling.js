import { type AxisTrackOptions } from '@gosling-lang/genomic-axis';

import { type SingleTrack, type Track } from '@gosling-lang/gosling-schema';
import type { CompleteThemeDeep } from '../../src/core/utils/theme';

import type { GoslingTrackOptions } from '@gosling-lang/gosling-track';
import type { BrushLinearTrackOptions } from '@gosling-lang/brush-linear';

import { getAxisTrackDef } from './axis';
import { type TrackDef, TrackType } from './main';
import { getBrushTrackOptions } from './brushLinear';

export function processGoslingTrack(
    track: Track,
    boundingBox: { x: number; y: number; width: number; height: number },
    theme: Required<CompleteThemeDeep>
): (TrackDef<GoslingTrackOptions> | TrackDef<AxisTrackOptions> | TrackDef<BrushLinearTrackOptions>)[] {
    const trackDefs: (
        | TrackDef<GoslingTrackOptions>
        | TrackDef<AxisTrackOptions>
        | TrackDef<BrushLinearTrackOptions>
    )[] = [];

    // Adds the title and subtitle tracks
    const [newTrackBbox, axisTrackDef] = getAxisTrackDef(track, boundingBox, theme);
    if (axisTrackDef) {
        trackDefs.push(axisTrackDef);
        // modify the bounding box to exclude the axis track
        boundingBox = newTrackBbox;
    }

    const goslingTrackOptions = getGoslingTrackOptions(track, theme);

    trackDefs.push({
        type: TrackType.Gosling,
        trackId: track.id,
        boundingBox: { ...boundingBox },
        options: goslingTrackOptions
    });

    // Add the brush after Gosling track so that it is on top
    const brushTrackOptions = getBrushTrackOptions(track);
    brushTrackOptions.forEach(brushTrackOption => {
        trackDefs.push({
            type: TrackType.BrushLinear,
            trackId: track.id,
            boundingBox: { ...boundingBox },
            options: brushTrackOption
        });
    });

    return trackDefs;
}

function getGoslingTrackOptions(spec: Track, theme: Required<CompleteThemeDeep>): GoslingTrackOptions {
    return {
        spec: spec,
        id: '9f4abc56-cb8d-4494-a9ca-56086ab28de2',
        siblingIds: ['9f4abc56-cb8d-4494-a9ca-56086ab28de2'],
        showMousePosition: true,
        mousePositionColor: '#000000',
        name: spec.title,
        labelPosition: spec.overlayOnPreviousTrack ? 'none' : 'topLeft',
        labelShowResolution: false,
        labelColor: 'black',
        labelBackgroundColor: 'white',
        labelBackgroundOpacity: 0.5,
        labelTextOpacity: 1,
        labelLeftMargin: 1,
        labelTopMargin: 1,
        labelRightMargin: 0,
        labelBottomMargin: 0,
        backgroundColor: 'transparent',
        theme: theme
    };
}
