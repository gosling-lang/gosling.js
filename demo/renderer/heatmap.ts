import { type Track } from '@gosling-lang/gosling-schema';
import { type TrackDef, TrackType } from './main';
import { type HeatmapTrackOptions } from '@gosling-lang/heatmap';
import type { CompleteThemeDeep } from '../../src/core/utils/theme';
import { computeChromSizes } from '../../src/core/utils/assembly';
import { getAxisTrackDef } from './axis';
import { type AxisTrackOptions } from '@gosling-lang/genomic-axis';

export function processHeatmapTrack(
    track: Track,
    boundingBox: { x: number; y: number; width: number; height: number },
    theme: Required<CompleteThemeDeep>
): (TrackDef<HeatmapTrackOptions> | TrackDef<AxisTrackOptions>)[] {
    const trackDefs: (TrackDef<HeatmapTrackOptions> | TrackDef<AxisTrackOptions>)[] = [];

    // Adds the axis tracks if needed
    const [newTrackBbox, axisTrackDef] = getAxisTrackDef(track, boundingBox, theme);
    if (axisTrackDef) {
        trackDefs.push(axisTrackDef);
        // modify the bounding box to exclude the axis track
        boundingBox = newTrackBbox;
    }

    const heatmapOptions = getHeatmapOptions(track, theme);
    trackDefs.push({
        type: TrackType.Heatmap,
        options: heatmapOptions,
        boundingBox,
        trackId: track.id
    });
    return trackDefs;
}

export function isHeatmapTrack(track: Track): boolean {
    return track.data && track.data.type === 'matrix';
}

function getHeatmapOptions(spec: Track, theme: Required<CompleteThemeDeep>): HeatmapTrackOptions {
    const { assembly } = spec;
    return {
        spec: spec,
        maxDomain: computeChromSizes(assembly).total,
        showMousePosition: false,
        mousePositionColor: '#000000',
        name: spec.title,
        labelPosition: 'topLeft',
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
        trackBorderWidth: 1,
        trackBorderColor: 'black',
        extent: 'full',
        colorbarPosition: 'hidden',
        labelShowAssembly: true,
        colorbarBackgroundColor: '#ffffff',
        minWidth: 100,
        minHeight: 100,
        heatmapValueScaling: 'log',
        showTooltip: false,
        zeroValueColor: undefined,
        colorRange: [
            'rgb(110, 64, 170)',
            'rgb(114, 64, 171)',
            'rgb(117, 63, 173)',
            'rgb(121, 63, 174)',
            'rgb(125, 63, 175)',
            'rgb(129, 62, 176)',
            'rgb(134, 62, 177)',
            'rgb(138, 62, 178)',
            'rgb(142, 62, 178)',
            'rgb(146, 61, 179)',
            'rgb(150, 61, 179)',
            'rgb(154, 61, 179)',
            'rgb(158, 61, 179)',
            'rgb(162, 61, 179)',
            'rgb(167, 60, 179)',
            'rgb(171, 60, 178)',
            'rgb(175, 60, 178)',
            'rgb(179, 60, 177)',
            'rgb(183, 60, 177)',
            'rgb(187, 60, 176)',
            'rgb(191, 60, 175)',
            'rgb(195, 61, 173)',
            'rgb(199, 61, 172)',
            'rgb(203, 61, 171)',
            'rgb(207, 61, 169)',
            'rgb(210, 62, 167)',
            'rgb(214, 62, 166)',
            'rgb(217, 63, 164)',
            'rgb(221, 63, 162)',
            'rgb(224, 64, 160)',
            'rgb(228, 65, 157)',
            'rgb(231, 65, 155)',
            'rgb(234, 66, 153)',
            'rgb(237, 67, 150)',
            'rgb(240, 68, 148)',
            'rgb(242, 69, 145)',
            'rgb(245, 70, 142)',
            'rgb(248, 71, 139)',
            'rgb(250, 73, 136)',
            'rgb(252, 74, 134)',
            'rgb(254, 75, 131)',
            'rgb(255, 77, 128)',
            'rgb(255, 78, 124)',
            'rgb(255, 80, 121)',
            'rgb(255, 82, 118)',
            'rgb(255, 84, 115)',
            'rgb(255, 86, 112)',
            'rgb(255, 88, 109)',
            'rgb(255, 90, 106)',
            'rgb(255, 92, 102)',
            'rgb(255, 94, 99)',
            'rgb(255, 96, 96)',
            'rgb(255, 99, 93)',
            'rgb(255, 101, 90)',
            'rgb(255, 103, 87)',
            'rgb(255, 106, 84)',
            'rgb(255, 109, 81)',
            'rgb(255, 111, 78)',
            'rgb(255, 114, 76)',
            'rgb(255, 117, 73)',
            'rgb(255, 120, 71)',
            'rgb(255, 122, 68)',
            'rgb(255, 125, 66)',
            'rgb(255, 128, 63)',
            'rgb(255, 131, 61)',
            'rgb(255, 135, 59)',
            'rgb(255, 138, 57)',
            'rgb(255, 141, 56)',
            'rgb(255, 144, 54)',
            'rgb(253, 147, 52)',
            'rgb(251, 150, 51)',
            'rgb(249, 154, 50)',
            'rgb(246, 157, 49)',
            'rgb(244, 160, 48)',
            'rgb(242, 164, 47)',
            'rgb(239, 167, 47)',
            'rgb(237, 170, 46)',
            'rgb(234, 173, 46)',
            'rgb(231, 177, 46)',
            'rgb(229, 180, 46)',
            'rgb(226, 183, 47)',
            'rgb(223, 187, 47)',
            'rgb(220, 190, 48)',
            'rgb(218, 193, 49)',
            'rgb(215, 196, 50)',
            'rgb(212, 199, 51)',
            'rgb(209, 202, 52)',
            'rgb(206, 205, 54)',
            'rgb(204, 208, 56)',
            'rgb(201, 211, 58)',
            'rgb(198, 214, 60)',
            'rgb(196, 217, 62)',
            'rgb(193, 220, 65)',
            'rgb(191, 223, 67)',
            'rgb(188, 225, 70)',
            'rgb(186, 228, 73)',
            'rgb(183, 230, 76)',
            'rgb(181, 233, 80)',
            'rgb(179, 235, 83)',
            'rgb(177, 238, 87)'
        ]
    };
}
