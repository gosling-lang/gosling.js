import type { PixiManager } from '@pixi-manager';
import { TextTrack, type TextTrackOptions } from '@gosling-lang/text-track';
import { DummyTrack, type DummyTrackOptions } from '@gosling-lang/dummy-track';
import { GoslingTrack } from '@gosling-lang/gosling-track';
import { AxisTrack, type AxisTrackOptions } from '@gosling-lang/genomic-axis';
import { BrushLinearTrack, type BrushLinearTrackOptions } from '@gosling-lang/brush-linear';
import { Signal, signal } from '@preact/signals-core';

import { cursor, panZoom } from '@gosling-lang/interactors';
import type { TrackInfo } from '../../src/compiler/bounding-box';
import type { CompleteThemeDeep } from '../../src/core/utils/theme';
import type { GoslingTrackOptions } from '../../src/tracks/gosling-track/gosling-track';

import { proccessTextHeader } from './text';
import { processGoslingTrack } from './gosling';
import { getDataFetcher } from './dataFetcher';
import type { LinkedEncoding } from './linkedEncoding';
import { BrushCircularTrack, type BrushCircularTrackOptions } from '@gosling-lang/brush-circular';

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
    [TrackType.BrushCircular]: BrushCircularTrackOptions;
    [TrackType.Heatmap]: any;
}

/**
 *  This interface contains all of the information needed to render each track type.
 */
export interface TrackDef<T> {
    type: TrackType;
    trackId: string;
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
export function renderTrackDefs(trackDefs: TrackDefs[], linkedEncodings: LinkedEncoding[], pixiManager: PixiManager) {
    trackDefs.forEach(trackDef => {
        const { boundingBox, type, options } = trackDef;

        if (type === TrackType.Text) {
            new TextTrack(options, pixiManager.makeContainer(boundingBox));
        }
        if (type === TrackType.Gosling) {
            const domain = getXDomainSignal(trackDef.trackId, linkedEncodings);
            const datafetcher = getDataFetcher(options.spec);
            const gosPlot = new GoslingTrack(options, datafetcher, pixiManager.makeContainer(boundingBox))
            if (!options.spec.static) {
                gosPlot.addInteractor(plot => panZoom(plot, domain));
            }
        }
        if (type === TrackType.Axis) {
            const domain = getXDomainSignal(trackDef.trackId, linkedEncodings);
            new AxisTrack(options, domain, pixiManager.makeContainer(boundingBox));
        }
        if (type === TrackType.BrushLinear) {
            const domain = getXDomainSignal(trackDef.trackId, linkedEncodings);
            const brushDomain = getBrushSignal(trackDef.trackId, linkedEncodings);

            new BrushLinearTrack(options, brushDomain, pixiManager.makeContainer(boundingBox).overlayDiv).addInteractor(
                plot => panZoom(plot, domain)
            );
        }
        if (type === TrackType.BrushCircular) {
            const domain = getXDomainSignal(trackDef.trackId, linkedEncodings);
            const brushDomain = getBrushSignal(trackDef.trackId, linkedEncodings);

            new BrushCircularTrack(options, brushDomain, pixiManager.makeContainer(boundingBox).overlayDiv, domain);
        }
    });
}

function getBrushSignal(trackDefId: string, linkedEncodings: LinkedEncoding[]): Signal<[number, number]> {
    const linkedEncoding = linkedEncodings.find(link => link.brushIds.includes(trackDefId));

    if (!linkedEncoding) {
        console.error(`No linked encoding found for track ${trackDefId}`);
        return signal<[number, number]>([0, 30000000]);
    }
    return linkedEncoding!.signal;
}

function getXDomainSignal(trackDefId: string, linkedEncodings: LinkedEncoding[]): Signal<[number, number]> {
    const linkedEncoding = linkedEncodings.find(link => link.trackIds.includes(trackDefId));

    if (!linkedEncoding) {
        console.error(`No linked encoding found for track ${trackDefId}`);
        return signal<[number, number]>([0, 30000000]);
    }
    return linkedEncoding!.signal;
}
