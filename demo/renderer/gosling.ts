import { type AxisTrackOptions } from '@gosling-lang/genomic-axis';

import { type Track } from '@gosling-lang/gosling-schema';
import type { CompleteThemeDeep } from '../../src/core/utils/theme';

import type { GoslingTrackOptions } from '../../src/tracks/gosling-track/gosling-track';

import { getAxisTrackDef } from './axis';
import { type TrackDef, TrackType } from './main';

export function processGoslingTrack(
    track: Track,
    boundingBox: { x: number; y: number; width: number; height: number },
    theme: Required<CompleteThemeDeep>
): (TrackDef<GoslingTrackOptions> | TrackDef<AxisTrackOptions>)[] {
    const trackDefs: (TrackDef<GoslingTrackOptions> | TrackDef<AxisTrackOptions>)[] = [];

    const axisTrackOptions = getAxisTrackDef(track, boundingBox, theme);
    if (axisTrackOptions) {
        trackDefs.push(axisTrackOptions);
    }

    const goslingTrackOptions = getGoslingTrackOptions(track, theme);

    trackDefs.push({
        type: TrackType.Gosling,
        boundingBox: { ...boundingBox },
        options: goslingTrackOptions
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
