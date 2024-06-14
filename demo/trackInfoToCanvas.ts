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
import { IsChannelDeep, IsDummyTrack, IsXAxis, type AxisPosition, type Track } from '@gosling-lang/gosling-schema';
import type { CompleteThemeDeep } from '../src/core/utils/theme';
import { resolveSuperposedTracks } from '../src/core/utils/overlay';
import type { GoslingTrackOptions } from '../src/tracks/gosling-track/gosling-track';
import { HIGLASS_AXIS_SIZE } from '../src/compiler/higlass-model';

function getTextTrackOptions(spec: Track, theme: Required<CompleteThemeDeep>): TextTrackOptions {
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

export function trackInfoToCanvas(
    trackInfos: TrackInfo[],
    pixiManager: PixiManager,
    theme: Required<CompleteThemeDeep>
) {
    const domain = signal([0, 100000000]);
    trackInfos.forEach(trackInfo => {
        const { track, boundingBox } = trackInfo;

        const resolvedSpecs = resolveSuperposedTracks(track);
        const firstResolvedSpec = resolvedSpecs[0];

        boundingBox.width -=
            firstResolvedSpec.layout !== 'circular' &&
            firstResolvedSpec.orientation === 'vertical' &&
            IsXAxis(firstResolvedSpec)
                ? HIGLASS_AXIS_SIZE
                : 0;

        boundingBox.height -=
            firstResolvedSpec.layout !== 'circular' &&
            firstResolvedSpec.orientation === 'horizontal' &&
            IsXAxis(firstResolvedSpec)
                ? HIGLASS_AXIS_SIZE
                : 0;
        if (track.mark === '_header') {
            const textTrackOptions = getTextTrackOptions(track, theme);
            new TextTrack(textTrackOptions, pixiManager.makeContainer(boundingBox));
            // subtitle
        } else if (IsDummyTrack(track)) {
            const options = getDummyTrackOptions(track, theme);
            new DummyTrack(options, pixiManager.makeContainer(boundingBox).overlayDiv);
        } else {
            const goslingTrackOptions = getGoslingTrackOptions(track, theme);
            const datafetcher = getDataFetcher(track);
            new GoslingTrack(goslingTrackOptions, datafetcher, pixiManager.makeContainer(boundingBox)).addInteractor(
                plot => panZoom(plot, domain)
            );
        }

        // Taken from gosling-to-higlass.ts
        // we only look into the first resolved spec to get information, such as size of the track
        ['x', 'y'].forEach(c => {
            const channel = (firstResolvedSpec as any)[c];
            if (
                IsChannelDeep(channel) &&
                'axis' in channel &&
                channel.axis &&
                channel.axis !== 'none' &&
                channel.type === 'genomic'
            ) {
                const narrowType = getAxisNarrowType(
                    c as any,
                    track.orientation,
                    boundingBox.width,
                    boundingBox.height
                );
                const widthOrHeight = channel.axis === 'left' || channel.axis === 'right' ? 'width' : 'height';
                const options = getAxisTrackOptions(channel.axis, narrowType, {
                    id: `random-str`, // ${trackId}-${channel.axis}-axis`,
                    layout: firstResolvedSpec.layout,
                    innerRadius:
                        channel.axis === 'top'
                            ? (firstResolvedSpec.outerRadius as number) - 30
                            : firstResolvedSpec.innerRadius,
                    outerRadius:
                        channel.axis === 'top'
                            ? firstResolvedSpec.outerRadius
                            : (firstResolvedSpec.innerRadius as number) + 30,
                    width: firstResolvedSpec.width,
                    height: firstResolvedSpec.height,
                    startAngle: firstResolvedSpec.startAngle,
                    endAngle: firstResolvedSpec.endAngle,
                    theme
                });
                new AxisTrack(
                    options,
                    domain,
                    pixiManager.makeContainer({
                        ...boundingBox,
                        y: channel.axis === 'bottom' ? boundingBox.y + boundingBox.height : boundingBox.y,
                        [widthOrHeight]: 30
                    })
                );
            }
        });
    });

    // const cursorPosition = signal<number>(0);
    // hgSpec.views.forEach(v => {
    //     const { x, y } = v.layout;
    //     const { initialXDomain, initialYDomain } = v;
    //     const domain = signal<[number, number]>(initialXDomain);
    //     let cumHeight = 0;
    //     let cumWidth = 0;

    //     for (const key in v.tracks) {
    //         const tracks = v.tracks[key];
    //         tracks.forEach(track => {
    //             switch (track.type) {
    //                 case 'text': {
    //                     const { height, width, options } = track;

    //                     const titlePos = { x, y: y + cumHeight, width, height };
    //                     new TextTrack(options, pixiManager.makeContainer(titlePos));
    //                     // In case there are multiple text tracks, we need to stack them
    //                     cumHeight += height;
    //                     break;
    //                 }
    //                 case 'combined': {
    //                     const { height, width, contents } = track;
    //                     const combinedPos = { x, y: y + cumHeight, width, height };
    //                     contents.forEach(gosTrack => {
    //                         if (gosTrack.type !== 'gosling-track') console.error('Not a Gosling track');
    //                         const { options, server, tilesetUid } = gosTrack;
    //                         const dataFetcher = new DataFetcher({ server, tilesetUid }, fakePubSub);

    //                         new GoslingTrack(options, dataFetcher, pixiManager.makeContainer(combinedPos))
    //                             .addInteractor(plot => panZoom(plot, domain))
    //                             .addInteractor(plot => cursor(plot, cursorPosition));
    //                     });
    //                     // In case there are multiple combined tracks, we need to stack them
    //                     cumHeight += height;
    //                     break;
    //                 }
    //                 case 'axis-track': {
    //                     const { options } = track;
    //                     const { height, width } = options;
    //                     // Axis track
    //                     const posAxis = {
    //                         x,
    //                         y: y + cumHeight,
    //                         width,
    //                         height
    //                     };
    //                     new AxisTrack(options, domain, pixiManager.makeContainer(posAxis));
    //                     break;
    //                 }
    //                 default:
    //                     console.warn(track.type, 'is not supported yet');
    //             }
    //         });
    //     }
    // });
}

export function getAxisTrackOptions(
    position: Exclude<AxisPosition, 'none'>,
    type: 'regular' | 'narrow' | 'narrower' = 'regular',
    options: {
        id?: string;
        layout?: 'circular' | 'linear';
        innerRadius?: number;
        outerRadius?: number;
        width?: number;
        height?: number;
        startAngle?: number;
        endAngle?: number;
        theme: Required<CompleteThemeDeep>;
    }
): AxisTrackOptions {
    const widthOrHeight = position === 'left' || position === 'right' ? 'width' : 'height';
    let opt: AxisTrackOptions = {
        ...options,
        assembly: 'hg38',
        stroke: 'transparent', // text outline
        color: options.theme.axis.labelColor,
        labelMargin: options.theme.axis.labelMargin,
        excludeChrPrefix: options.theme.axis.labelExcludeChrPrefix,
        fontSize: options.theme.axis.labelFontSize,
        fontFamily: options.theme.axis.labelFontFamily,
        fontWeight: options.theme.axis.labelFontWeight,
        tickColor: options.theme.axis.tickColor,
        tickFormat: type === 'narrower' ? 'si' : 'plain',
        tickPositions: type === 'regular' ? 'even' : 'ends',
        reverseOrientation: position === 'bottom' || position === 'right' ? true : false
    };
    if (options.layout === 'circular') {
        // circular axis: superpose an axis track on top of the `center` track
        opt = { ...opt, layout: 'circular' };
    }
    return opt;
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
