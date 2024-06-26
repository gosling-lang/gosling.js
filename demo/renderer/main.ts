import type { PixiManager } from '@pixi-manager';
import { TextTrack, type TextTrackOptions } from '@gosling-lang/text-track';
import { DummyTrack, type DummyTrackOptions } from '@gosling-lang/dummy-track';
import { GoslingTrack } from '@gosling-lang/gosling-track';
import { AxisTrack, type AxisTrackOptions } from '@gosling-lang/genomic-axis';
import { BrushLinearTrack, type BrushLinearTrackOptions } from '@gosling-lang/brush-linear';
import { Signal, signal } from '@preact/signals-core';

import { cursor, panZoom, panZoomHeatmap } from '@gosling-lang/interactors';
import type { TrackInfo } from '../../src/compiler/bounding-box';
import type { CompleteThemeDeep } from '../../src/core/utils/theme';
import type { GoslingTrackOptions } from '../../src/tracks/gosling-track/gosling-track';

import { proccessTextHeader } from './text';
import { processHeatmapTrack, isHeatmapTrack } from './heatmap';
import { processGoslingTrack } from './gosling';
import { getDataFetcher } from './dataFetcher';
import type { LinkedEncoding } from './linkedEncoding';
import { BrushCircularTrack, type BrushCircularTrackOptions } from '@gosling-lang/brush-circular';
import { type HeatmapTrackOptions, HeatmapTrack } from '@gosling-lang/heatmap';

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
    [TrackType.Heatmap]: HeatmapTrackOptions;
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

/**
 * This function is for internal testing. It will render a red border around each track
 */
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
 * Takes a list of TrackInfos and returns a list of TrackDefs
 * @param trackInfos
 * @param pixiManager
 * @param theme
 * @returns
 */
export function createTrackDefs(trackInfos: TrackInfo[], theme: Required<CompleteThemeDeep>): TrackDefs[] {
    const trackDefs: TrackDefs[] = [];
    trackInfos.forEach(trackInfo => {
        const { track, boundingBox } = trackInfo;

        if (track.mark === '_header') {
            // Header marks contain both the title and subtitle
            const textTrackDefs = proccessTextHeader(track, boundingBox, theme);
            trackDefs.push(...textTrackDefs);
        } else if (isHeatmapTrack(track)) {
            // We have a heatmap track
            const heatmapTrackDefs = processHeatmapTrack(track, boundingBox, theme);
            trackDefs.push(...heatmapTrackDefs);
        } else {
            // We have a gosling track
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
            const domain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            if (!domain) return;

            const datafetcher = getDataFetcher(options.spec);
            const gosPlot = new GoslingTrack(
                options,
                datafetcher,
                pixiManager.makeContainer(boundingBox),
                domain,
                options.spec.orientation
            );
            if (!options.spec.static) {
                gosPlot.addInteractor(plot => panZoom(plot, domain));
            }
        }
        if (type === TrackType.Heatmap) {
            const xDomain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            const yDomain = getEncodingSignal(trackDef.trackId, 'y', linkedEncodings);
            console.warn('domains,', xDomain, yDomain);
            if (!xDomain || !yDomain) return;

            const datafetcher = getDataFetcher(options.spec);
            new HeatmapTrack(options, datafetcher, pixiManager.makeContainer(boundingBox)).addInteractor(plot =>
                panZoomHeatmap(plot, xDomain, yDomain)
            );
        }
        if (type === TrackType.Axis) {
            const domain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            if (!domain) return;

            new AxisTrack(options, domain, pixiManager.makeContainer(boundingBox), 'horizontal').addInteractor(plot =>
                panZoom(plot, domain)
            );
        }
        if (type === TrackType.BrushLinear) {
            const domain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            const brushDomain = getEncodingSignal(trackDef.trackId, 'brush', linkedEncodings);
            if (!domain || !brushDomain || !hasLinkedTracks(trackDef.trackId, linkedEncodings)) return;
            // We only want to add the brush track if it is linked to another track
            new BrushLinearTrack(options, brushDomain, pixiManager.makeContainer(boundingBox).overlayDiv).addInteractor(
                plot => panZoom(plot, domain)
            );
        }
        if (type === TrackType.BrushCircular) {
            const domain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            const brushDomain = getEncodingSignal(trackDef.trackId, 'brush', linkedEncodings);
            if (!domain || !brushDomain || !hasLinkedTracks(trackDef.trackId, linkedEncodings)) return;
            // We only want to add the brush track if it is linked to another track
            new BrushCircularTrack(options, brushDomain, pixiManager.makeContainer(boundingBox).overlayDiv, domain);
        }
    });
}

/**
 * Returns true if the brush track is linked to non-brush tracks
 * We don't want to render a brush track if it is not linked to another track
 */
function hasLinkedTracks(brushId: string, linkedEncodings: LinkedEncoding[]): boolean {
    const linkedEncoding = linkedEncodings.find(link =>
        link.tracks.find(t => t.id === brushId && t.encoding === 'brush')
    );
    if (!linkedEncoding) return false;
    const nonBrushTracks = linkedEncoding.tracks.filter(t => t.encoding !== 'brush');
    return nonBrushTracks.length > 0;
}

function getEncodingSignal(
    trackDefId: string,
    encodingType: string,
    linkedEncodings: LinkedEncoding[]
): Signal | undefined {
    const linkedEncoding = linkedEncodings.find(link =>
        link.tracks.find(t => t.id === trackDefId && t.encoding === encodingType)
    );
    if (!linkedEncoding) {
        console.warn(`No linked encoding found for track ${trackDefId}`);
        return undefined;
    }
    if (!linkedEncoding.signal) {
        console.warn(`No signal found for linked encoding ${linkedEncoding.linkingId}`);
        return undefined;
    }
    return linkedEncoding!.signal;
}
