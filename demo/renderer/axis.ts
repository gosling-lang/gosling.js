import { type AxisTrackOptions } from '@gosling-lang/genomic-axis';
import {
    IsChannelDeep,
    IsDummyTrack,
    IsTemplateTrack,
    IsXAxis,
    type AxisPosition,
    type OverlaidTrack,
    type SingleTrack,
    type TemplateTrack,
    type Track
} from '@gosling-lang/gosling-schema';
import type { CompleteThemeDeep } from '../../src/core/utils/theme';
import { resolveSuperposedTracks } from '../../src/core/utils/overlay';
import { HIGLASS_AXIS_SIZE } from '../../src/compiler/higlass-model';
import { TrackType, type TrackDef } from './main';

/**
 * Generates the track definition for the axis track
 * @param track
 * @param boundingBox
 * @param theme
 */
export function getAxisTrackDef(
    track: SingleTrack | OverlaidTrack | TemplateTrack,
    boundingBox: { x: number; y: number; width: number; height: number },
    theme: Required<CompleteThemeDeep>
): TrackDef<AxisTrackOptions> | undefined {
    const { xAxisPosition, yAxisPosition } = getAxisPositions(track);
    if (xAxisPosition) {
        if (track.layout === 'linear') {
            const isHorizontal = track.orientation === 'horizontal';
            const widthOrHeight = isHorizontal ? 'height' : 'width';
            const axisBbox = { ...boundingBox, [widthOrHeight]: HIGLASS_AXIS_SIZE };
            boundingBox[widthOrHeight] -= axisBbox[widthOrHeight];
            if (xAxisPosition === 'top') {
                boundingBox.y += axisBbox.height;
            } else if (xAxisPosition === 'bottom') {
                axisBbox.y = boundingBox.y + boundingBox.height;
            } else if (xAxisPosition === 'right') {
                axisBbox.x = boundingBox.x + boundingBox.width;
            } else if (xAxisPosition === 'left') {
                boundingBox.x += axisBbox.width;
            }
            return {
                type: TrackType.Axis,
                boundingBox: axisBbox,
                options: getAxisTrackLinearOptions(axisBbox, xAxisPosition, theme)
            };
        } else if (track.layout === 'circular') {
            return {
                type: TrackType.Axis,
                boundingBox: boundingBox,
                options: getAxisTrackCircularOptions(track, boundingBox, xAxisPosition, theme)
            };
        }
    }
    if (yAxisPosition) {
        console.warn('Vertical axis is not supported yet');
    }
}

/**
 * Generates options for the linear axis track
 * @param boundingBox Bounding box of the track
 * @param position "top" | "bottom" | "left" | "right
 */
function getAxisTrackLinearOptions(
    boundingBox: { x: number; y: number; width: number; height: number },
    position: AxisPosition,
    theme: Required<CompleteThemeDeep>
): AxisTrackOptions {
    const narrowType = getAxisNarrowType('x', 'horizontal', boundingBox.width, boundingBox.height);
    const options: AxisTrackOptions = {
        innerRadius: 0,
        outerRadius: 0,
        width: boundingBox.width,
        height: boundingBox.height,
        startAngle: 0,
        endAngle: 0,
        layout: 'linear',
        assembly: 'hg38',
        stroke: 'transparent', // text outline
        color: theme.axis.labelColor,
        labelMargin: theme.axis.labelMargin,
        excludeChrPrefix: theme.axis.labelExcludeChrPrefix,
        fontSize: theme.axis.labelFontSize,
        fontFamily: theme.axis.labelFontFamily,
        fontWeight: theme.axis.labelFontWeight,
        tickColor: theme.axis.tickColor,
        tickFormat: narrowType === 'narrower' ? 'si' : 'plain',
        tickPositions: narrowType === 'regular' ? 'even' : 'ends',
        reverseOrientation: position === 'bottom' || position === 'right' ? true : false
    };
    return options;
}

/**
 * Generates options for the circular axis track
 */
function getAxisTrackCircularOptions(
    track: SingleTrack | OverlaidTrack | TemplateTrack,
    boundingBox: { x: number; y: number; width: number; height: number },
    position: AxisPosition,
    theme: Required<CompleteThemeDeep>
): AxisTrackOptions {
    const narrowType = getAxisNarrowType('x', 'horizontal', boundingBox.width, boundingBox.height);
    const { startAngle, endAngle, outerRadius } = track;
    let { innerRadius } = track;
    if (position === 'top') {
        innerRadius = outerRadius - 30;
    } else if (position === 'left' || position === 'right') {
        console.error('Axis position left or right is not supported in circular layout');
    }

    const options: AxisTrackOptions = {
        layout: 'circular',
        innerRadius,
        outerRadius,
        width: boundingBox.width,
        height: boundingBox.height,
        startAngle,
        endAngle,
        assembly: 'hg38',
        stroke: 'transparent', // text outline
        color: theme.axis.labelColor,
        labelMargin: theme.axis.labelMargin,
        excludeChrPrefix: theme.axis.labelExcludeChrPrefix,
        fontSize: theme.axis.labelFontSize,
        fontFamily: theme.axis.labelFontFamily,
        fontWeight: theme.axis.labelFontWeight,
        tickColor: theme.axis.tickColor,
        tickFormat: narrowType === 'narrower' ? 'si' : 'plain',
        tickPositions: narrowType === 'regular' ? 'even' : 'ends',
        reverseOrientation: position === 'bottom' || position === 'right' ? true : false
    };
    return options;
}

/**
 * Determines the position of the x and y axes for a given track
 * @param track
 * @returns
 */
function getAxisPositions(track: Track): {
    xAxisPosition: AxisPosition | undefined;
    yAxisPosition: AxisPosition | undefined;
} {
    if (IsTemplateTrack(track) || IsDummyTrack(track)) {
        return { xAxisPosition: undefined, yAxisPosition: undefined };
    }

    const resolvedSpecs = resolveSuperposedTracks(track);
    const firstResolvedSpec = resolvedSpecs[0];

    const hasXAxis =
        ('x' in firstResolvedSpec &&
            firstResolvedSpec.x &&
            'axis' in firstResolvedSpec.x &&
            firstResolvedSpec.x.axis !== 'none' &&
            firstResolvedSpec.x.type === 'genomic') ||
        false;
    const hasYAxis =
        ('y' in firstResolvedSpec &&
            firstResolvedSpec.y &&
            'axis' in firstResolvedSpec.y &&
            firstResolvedSpec.y.axis !== 'none' &&
            firstResolvedSpec.y.type === 'genomic') ||
        false;

    const xAxisPosition =
        hasXAxis && IsChannelDeep(firstResolvedSpec.x) ? (firstResolvedSpec.x?.axis as AxisPosition) : undefined;
    const yAxisPosition =
        hasYAxis && IsChannelDeep(firstResolvedSpec.y) ? (firstResolvedSpec.y?.axis as AxisPosition) : undefined;

    return {
        xAxisPosition,
        yAxisPosition
    };
}

/**
 * Determines the compactness type of an axis considering the size of a track
 */
const getAxisNarrowType = (
    c: 'x' | 'y',
    orientation: 'horizontal' | 'vertical' = 'horizontal',
    width: number,
    height: number
) => {
    const narrowSizeThreshold = 400;
    const narrowerSizeThreshold = 200;

    if (orientation === 'horizontal') {
        if ((c === 'x' && width <= narrowerSizeThreshold) || (c === 'y' && height <= narrowerSizeThreshold)) {
            return 'narrower';
        } else if ((c === 'x' && width <= narrowSizeThreshold) || (c === 'y' && height <= narrowSizeThreshold)) {
            return 'narrow';
        } else {
            return 'regular';
        }
    } else {
        if ((c === 'x' && height <= narrowerSizeThreshold) || (c === 'y' && width <= narrowerSizeThreshold)) {
            return 'narrower';
        } else if ((c === 'x' && height <= narrowSizeThreshold) || (c === 'y' && width <= narrowSizeThreshold)) {
            return 'narrow';
        } else {
            return 'regular';
        }
    }
};
