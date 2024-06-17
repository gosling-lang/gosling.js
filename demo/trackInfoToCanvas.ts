import type { PixiManager } from '@pixi-manager';
import { TextTrack, type TextTrackOptions } from '@gosling-lang/text-track';
import { DummyTrack, type DummyTrackOptions } from '@gosling-lang/dummy-track';
import { GoslingTrack } from '@gosling-lang/gosling-track';
import { AxisTrack, type AxisTrackOptions } from '@gosling-lang/genomic-axis';
import { signal } from '@preact/signals-core';
import { DataFetcher } from '@higlass/datafetcher';
import { fakePubSub } from '@higlass/utils';
import { BigWigDataFetcher } from '@data-fetchers';
import { cursor, panZoom } from '@gosling-lang/interactors';
import type { TrackInfo } from '../src/compiler/bounding-box';
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
import type { CompleteThemeDeep } from '../src/core/utils/theme';
import { resolveSuperposedTracks } from '../src/core/utils/overlay';
import type { GoslingTrackOptions } from '../src/tracks/gosling-track/gosling-track';
import { HIGLASS_AXIS_SIZE } from '../src/compiler/higlass-model';

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

function getGoslingTrackOptions(spec: Track, theme: Required<CompleteThemeDeep>): GoslingTrackOptions {
    return {
        spec: spec,
        id: '9f4abc56-cb8d-4494-a9ca-56086ab28de2',
        siblingIds: ['9f4abc56-cb8d-4494-a9ca-56086ab28de2'],
        showMousePosition: true,
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
        theme
    };
}

function getDataFetcher(spec: Track) {
    if (!('data' in spec)) {
        console.warn('No data in the track spec', spec);
    }
    if (spec.data.type == 'multivec') {
        const url = spec.data.url;
        const server = url.split('/').slice(0, -2).join('/');
        const tilesetUid = url.split('=').slice(-1)[0];
        console.warn('server', server, 'tilesetUid', tilesetUid);
        return new DataFetcher({ server, tilesetUid }, fakePubSub);
    }
    if (spec.data.type == 'bigwig') {
        return new BigWigDataFetcher(spec.data);
    }
}

function getDummyTrackOptions(spec: Track, theme: Required<CompleteThemeDeep>): DummyTrackOptions {
    // TODO
    return spec;
}

enum TrackType {
    Text,
    Dummy,
    Gosling,
    Axis,
    BrushLinear,
    BrushCircular,
    Heatmap
}

interface TrackOptionsMap {
    [TrackType.Text]: TextTrackOptions;
    [TrackType.Dummy]: DummyTrackOptions;
    [TrackType.Gosling]: GoslingTrackOptions;
    [TrackType.Axis]: AxisTrackOptions;
    [TrackType.BrushLinear]: any;
    [TrackType.BrushCircular]: any;
    [TrackType.Heatmap]: any;
}

interface TrackDef<T> {
    type: TrackType;
    boundingBox: { x: number; y: number; width: number; height: number };
    options: T;
}

type TrackOptions = {
    [K in keyof TrackOptionsMap]: TrackDef<TrackOptionsMap[K]>;
}[keyof TrackOptionsMap];

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
 * Separate the the track with mark "_header" into title and subtitle text tracks
 * @param track
 * @param boundingBox
 * @returns
 */
function proccessTextHeader(
    track: Track,
    boundingBox: { x: number; y: number; width: number; height: number },
    theme: Required<CompleteThemeDeep>
): TrackDef<TextTrackOptions>[] {
    let cumHeight = 0;
    const trackInfosProcessed: TrackDef<TextTrackOptions>[] = [];
    if (track.title) {
        const textTrackOptions = getTextTrackOptions(track, 'title', theme);
        const height = textTrackOptions.fontSize + 6;
        trackInfosProcessed.push({
            type: TrackType.Text,
            boundingBox: { ...boundingBox, height },
            options: textTrackOptions
        });
        cumHeight += height;
    }
    if (track.subtitle) {
        const textTrackOptions = getTextTrackOptions(track, 'subtitle', theme);
        const height = textTrackOptions.fontSize + 6;
        trackInfosProcessed.push({
            type: TrackType.Text,
            boundingBox: { ...boundingBox, y: boundingBox.y + cumHeight, height },
            options: textTrackOptions
        });
    }
    return trackInfosProcessed;
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

function processGoslingTrack(
    track: Track,
    boundingBox: { x: number; y: number; width: number; height: number },
    theme: Required<CompleteThemeDeep>
): (TrackDef<GoslingTrackOptions> | TrackDef<AxisTrackOptions>)[] {
    const trackInfosProcessed: (TrackDef<GoslingTrackOptions> | TrackDef<AxisTrackOptions>)[] = [];

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
            trackInfosProcessed.push({
                type: TrackType.Axis,
                boundingBox: axisBbox,
                options: getAxisTrackLinearOptions(axisBbox, xAxisPosition, theme)
            });
        } else if (track.layout === 'circular') {
            trackInfosProcessed.push({
                type: TrackType.Axis,
                boundingBox: boundingBox,
                options: getAxisTrackCircularOptions(track, boundingBox, xAxisPosition, theme)
            });
        }
    }

    const goslingTrackOptions = getGoslingTrackOptions(track, theme);

    trackInfosProcessed.push({
        type: TrackType.Gosling,
        boundingBox: { ...boundingBox },
        options: goslingTrackOptions
    });

    return trackInfosProcessed;
}

export function trackInfoToTracks(
    trackInfos: TrackInfo[],
    pixiManager: PixiManager,
    theme: Required<CompleteThemeDeep>
) {
    const trackInfosProcessed: TrackOptions[] = [];
    trackInfos.forEach(trackInfo => {
        const { track, boundingBox } = trackInfo;
        // console.warn('boundingBox', boundingBox);
        // const div = pixiManager.makeContainer(boundingBox).overlayDiv;
        // div.style.border = '3px solid red';
        // div.innerHTML = track.mark || 'No mark';
        // div.style.textAlign = 'left';

        // Header marks contain both the title and subtitle
        if (track.mark === '_header') {
            const trackOptions = proccessTextHeader(track, boundingBox, theme);
            trackInfosProcessed.push(...trackOptions);
        } else {
            const trackOptions = processGoslingTrack(track, boundingBox, theme);
            trackInfosProcessed.push(...trackOptions);
        }
    });

    const domain = signal<[number, number]>([0, 3088269832]);
    trackInfosProcessed.forEach(trackInfo => {
        const { boundingBox, type } = trackInfo;
        // console.warn('boundingBox', boundingBox);
        // const div = pixiManager.makeContainer(boundingBox).overlayDiv;
        // div.style.border = '1px solid black';
        // div.innerHTML = TrackType[type] || 'No mark';

        if (type === TrackType.Text) {
            new TextTrack(trackInfo.options, pixiManager.makeContainer(boundingBox));
        }
        if (type === TrackType.Gosling) {
            const datafetcher = getDataFetcher(trackInfo.options.spec);
            new GoslingTrack(trackInfo.options, datafetcher, pixiManager.makeContainer(boundingBox)).addInteractor(
                plot => panZoom(plot, domain)
            );
        }
        if (type === TrackType.Axis) {
            new AxisTrack(trackInfo.options, domain, pixiManager.makeContainer(boundingBox));
        }
    });
}

// determine the compactness type of an axis considering the size of a track
export const getAxisNarrowType = (
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
