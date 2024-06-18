import type { PixiManager } from '@pixi-manager';
import { TextTrack, type TextTrackOptions } from '@gosling-lang/text-track';
import { DummyTrack, type DummyTrackOptions } from '@gosling-lang/dummy-track';
import { GoslingTrack } from '@gosling-lang/gosling-track';
import { AxisTrack, type AxisTrackOptions } from '@gosling-lang/genomic-axis';
import { BrushLinearTrack, type BrushLinearTrackOptions } from '@gosling-lang/brush-linear';
import { signal } from '@preact/signals-core';

import { cursor, panZoom } from '@gosling-lang/interactors';
import type { TrackInfo } from '../../src/compiler/bounding-box';
import type { CompleteThemeDeep } from '../../src/core/utils/theme';
import type { GoslingTrackOptions } from '../../src/tracks/gosling-track/gosling-track';

import { proccessTextHeader } from './text';
import { processGoslingTrack } from './gosling';
import { getDataFetcher } from './dataFetcher';
import { CsvDataFetcher } from '@data-fetchers';

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
    [TrackType.BrushLinear]: BrushLinearTrackOptions;
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

export function showTrackInfoPositions(trackInfos: TrackInfo[], pixiManager: PixiManager) {
    trackInfos.forEach(trackInfo => {
        const { track, boundingBox } = trackInfo;
        const div = pixiManager.makeContainer(boundingBox).overlayDiv;
        div.style.border = '3px solid red';
        div.innerHTML = track.mark || 'No mark';
        div.style.textAlign = 'left';
    });
}

/**
 * Takes a list of TrackInfos and returns a list of TrackOptions
 * @param trackInfos
 * @param pixiManager
 * @param theme
 * @returns
 */
export function createTrackDefs(trackInfos: TrackInfo[], theme: Required<CompleteThemeDeep>): TrackDefs[] {
    const trackDefs: TrackDefs[] = [];
    trackInfos.forEach(trackInfo => {
        const { track, boundingBox } = trackInfo;

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
export function renderTrackDefs(trackDefs: TrackDefs[], pixiManager: PixiManager) {
    const domain = signal<[number, number]>([491149952, 689445510]);

    trackDefs.forEach(trackDef => {
        const { boundingBox, type, options } = trackDef;
        // console.warn('boundingBox', boundingBox);
        // const div = pixiManager.makeContainer(boundingBox).overlayDiv;
        // div.style.border = '1px solid black';
        // div.innerHTML = TrackType[type] || 'No mark';

        if (type === TrackType.Text) {
            new TextTrack(options, pixiManager.makeContainer(boundingBox));
        }
        if (type === TrackType.Gosling) {
            const datafetcher = getDataFetcher(options.spec);
            new GoslingTrack(options, datafetcher, pixiManager.makeContainer(boundingBox)).addInteractor(plot =>
                panZoom(plot, domain)
            );
        }
        if (type === TrackType.Axis) {
            new AxisTrack(options, domain, pixiManager.makeContainer(boundingBox));
        }
        if (type === TrackType.BrushLinear) {
            const brushDomain = signal<[number, number]>([543317951, 544039951]);
            // console.warn(options);
            new BrushLinearTrack(options, brushDomain, pixiManager.makeContainer(boundingBox).overlayDiv).addInteractor(
                plot => panZoom(plot, domain)
            );
        }
    });
}
