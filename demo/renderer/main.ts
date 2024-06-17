import type { PixiManager } from '@pixi-manager';
import { TextTrack, type TextTrackOptions } from '@gosling-lang/text-track';
import { DummyTrack, type DummyTrackOptions } from '@gosling-lang/dummy-track';
import { GoslingTrack } from '@gosling-lang/gosling-track';
import { AxisTrack, type AxisTrackOptions } from '@gosling-lang/genomic-axis';
import { signal } from '@preact/signals-core';

import { cursor, panZoom } from '@gosling-lang/interactors';
import type { TrackInfo } from '../../src/compiler/bounding-box';
import type { CompleteThemeDeep } from '../../src/core/utils/theme';
import type { GoslingTrackOptions } from '../../src/tracks/gosling-track/gosling-track';

import { proccessTextHeader } from './text';
import { processGoslingTrack } from './gosling';
import { getDataFetcher } from './dataFetcher';

/**
 * All the different types of tracks that can be rendered
 */
export enum TrackType {
    Text,
    Dummy,
    Gosling,
    Axis,
    BrushLinear,
    BrushCircular,
    Heatmap
}

/**
 * Associate options to each track type
 */
interface TrackOptionsMap {
    [TrackType.Text]: TextTrackOptions;
    [TrackType.Dummy]: DummyTrackOptions;
    [TrackType.Gosling]: GoslingTrackOptions;
    [TrackType.Axis]: AxisTrackOptions;
    [TrackType.BrushLinear]: any;
    [TrackType.BrushCircular]: any;
    [TrackType.Heatmap]: any;
}

/**
 *  This interface contains all of the information needed to render each track type.
 */
export interface TrackDef<T> {
    type: TrackType;
    boundingBox: { x: number; y: number; width: number; height: number };
    options: T;
}

/**
 * This is a union of all the different TrackDefs
 */
type TrackDefs = {
    [K in keyof TrackOptionsMap]: TrackDef<TrackOptionsMap[K]>;
}[keyof TrackOptionsMap];

/**
 * Takes a list of TrackInfos and returns a list of TrackOptions
 * @param trackInfos
 * @param pixiManager
 * @param theme
 * @returns
 */
export function createTrackDefs(
    trackInfos: TrackInfo[],
    pixiManager: PixiManager,
    theme: Required<CompleteThemeDeep>
): TrackDefs[] {
    const trackDefs: TrackDefs[] = [];
    trackInfos.forEach(trackInfo => {
        const { track, boundingBox } = trackInfo;
        // console.warn('boundingBox', boundingBox);
        // const div = pixiManager.makeContainer(boundingBox).overlayDiv;
        // div.style.border = '3px solid red';
        // div.innerHTML = track.mark || 'No mark';
        // div.style.textAlign = 'left';

        // Header marks contain both the title and subtitle
        if (track.mark === '_header') {
            const textTrackDefs = proccessTextHeader(track, boundingBox, theme);
            trackDefs.push(...textTrackDefs);
        } else {
            const goslingAxisDefs = processGoslingTrack(track, boundingBox, theme);
            trackDefs.push(...goslingAxisDefs);
        }
    });
    return trackDefs;
}

/**
 * Takes a list of track options and renders them on the screen
 * @param trackOptions
 * @param pixiManager
 */
export function renderTrackDefs(trackOptions: TrackDefs[], pixiManager: PixiManager) {
    const domain = signal<[number, number]>([0, 3088269832]);
    trackOptions.forEach(trackInfo => {
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
