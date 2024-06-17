import { type TextTrackOptions } from '@gosling-lang/text-track';

import { type Track } from '@gosling-lang/gosling-schema';
import type { CompleteThemeDeep } from '../../src/core/utils/theme';
import { TrackType, type TrackDef } from './main';

/**
 * Separate the the track with mark "_header" into title and subtitle text tracks
 * @param track
 * @param boundingBox
 * @returns
 */
export function proccessTextHeader(
    track: Track,
    boundingBox: { x: number; y: number; width: number; height: number },
    theme: Required<CompleteThemeDeep>
): TrackDef<TextTrackOptions>[] {
    let cumHeight = 0;
    const trackDefs: TrackDef<TextTrackOptions>[] = [];
    if (track.title) {
        const textTrackOptions = getTextTrackOptions(track, 'title', theme);
        const height = textTrackOptions.fontSize + 6;
        trackDefs.push({
            type: TrackType.Text,
            boundingBox: { ...boundingBox, height },
            options: textTrackOptions
        });
        cumHeight += height;
    }
    if (track.subtitle) {
        const textTrackOptions = getTextTrackOptions(track, 'subtitle', theme);
        const height = textTrackOptions.fontSize + 6;
        trackDefs.push({
            type: TrackType.Text,
            boundingBox: { ...boundingBox, y: boundingBox.y + cumHeight, height },
            options: textTrackOptions
        });
    }
    return trackDefs;
}

function getTextTrackOptions(
    spec: Track,
    type: 'title' | 'subtitle',
    theme: Required<CompleteThemeDeep>
): TextTrackOptions {
    if (type === 'title') {
        return {
            backgroundColor: theme.root.titleBackgroundColor,
            textColor: theme.root.titleColor,
            fontSize: theme.root.titleFontSize ?? 18,
            fontWeight: theme.root.titleFontWeight,
            fontFamily: theme.root.titleFontFamily,
            offsetY: 0,
            align: theme.root.titleAlign,
            text: spec.title
        };
    } else {
        return {
            backgroundColor: theme.root.subtitleBackgroundColor,
            textColor: theme.root.subtitleColor,
            fontSize: theme.root.subtitleFontSize ?? 18,
            fontWeight: theme.root.subtitleFontWeight,
            fontFamily: theme.root.subtitleFontFamily,
            offsetY: 0,
            align: theme.root.subtitleAlign,
            text: spec.subtitle
        };
    }
}
