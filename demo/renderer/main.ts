import { GoslingTrack } from '@gosling-lang/gosling-track';
import { AxisTrack } from '@gosling-lang/genomic-axis';
import { BrushLinearTrack } from '@gosling-lang/brush-linear';
import { signal, Signal } from '@preact/signals-core';
import { TextTrack } from '@gosling-lang/text-track';

import { cursor, cursor2D, panZoom, panZoomHeatmap } from '@gosling-lang/interactors';
import { type TrackDefs, TrackType } from '../track-def/main';
import { getDataFetcher } from './dataFetcher';
import type { LinkedEncoding } from '../linking/linkedEncoding';
import { BrushCircularTrack } from '@gosling-lang/brush-circular';
import { HeatmapTrack } from '@gosling-lang/heatmap';
import type { PixiManager } from '@pixi-manager';
import { DummyTrack } from '@gosling-lang/dummy-track';
import type { UrlToFetchOptions } from 'src/compiler/compile';

/**
 * Takes a list of track definitions and linkedEncodings and renders them
 * @param trackOptions
 * @param pixiManager
 */
export function renderTrackDefs(
    trackDefs: TrackDefs[],
    linkedEncodings: LinkedEncoding[],
    pixiManager: PixiManager,
    urlToFetchOptions?: UrlToFetchOptions
) {
    const plotDict: Record<string, unknown> = {};
    const plots = [];

    const cursorPosX = signal(0);
    const cursorPosY = signal(0);

    trackDefs.forEach(trackDef => {
        const { boundingBox, type, options, trackId } = trackDef;

        if (type === TrackType.Text) {
            const plot = new TextTrack(options, pixiManager.makeContainer(boundingBox));
            plotDict[trackId] = plot;
        }
        if (type === TrackType.Gosling) {
            const xDomain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            const yDomain = getEncodingSignal(trackDef.trackId, 'y', linkedEncodings);
            if (!xDomain) return;

            const datafetcher = getDataFetcher(options.spec, urlToFetchOptions);
            const gosPlot = new GoslingTrack(
                options,
                datafetcher,
                pixiManager.makeContainer(boundingBox),
                xDomain,
                yDomain,
                options.spec.orientation
            );
            const isOverlayedOnPrevious =
                'overlayOnPreviousTrack' in options.spec && options.spec.overlayOnPreviousTrack;
            if (!options.spec.static && !isOverlayedOnPrevious) {
                gosPlot.addInteractor(plot => panZoom(plot, xDomain, yDomain));
            }
            gosPlot.addInteractor(plot => cursor(plot, cursorPosX));
            plotDict[trackId] = gosPlot;
        }
        if (type === TrackType.Heatmap) {
            const xDomain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            const yDomain = getEncodingSignal(trackDef.trackId, 'y', linkedEncodings);
            if (!xDomain || !yDomain) return;

            const datafetcher = getDataFetcher(options.spec, urlToFetchOptions);
            const heatmapPlot = new HeatmapTrack(options, datafetcher, pixiManager.makeContainer(boundingBox))
                .addInteractor(plot => panZoomHeatmap(plot, xDomain, yDomain))
                .addInteractor(plot => cursor2D(plot, cursorPosX, cursorPosY));
            plotDict[trackId] = heatmapPlot;
        }
        if (type === TrackType.Axis) {
            const domain = getEncodingSignal(trackDef.trackId, options.encoding, linkedEncodings);
            if (!domain) {
                console.warn(`No domain found for axis ${trackDef.trackId}. Skipping...`);
                return;
            }

            const axisTrack = new AxisTrack(
                options,
                domain,
                pixiManager.makeContainer(boundingBox),
                options.orientation
            );
            if (!options.static) {
                axisTrack.addInteractor(plot => panZoom(plot, domain));
            }
            plotDict[trackId] = axisTrack;
        }
        if (type === TrackType.BrushLinear) {
            const domain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            const brushDomain = getEncodingSignal(trackDef.trackId, 'brush', linkedEncodings);
            if (!domain || !brushDomain || !hasLinkedTracks(trackDef.trackId, linkedEncodings)) return;
            // We only want to add the brush track if it is linked to another track
            const brush = new BrushLinearTrack(
                options,
                brushDomain,
                pixiManager.makeContainer(boundingBox).overlayDiv,
                domain
            );
            if (!options.static) brush.addInteractor(plot => panZoom(plot, domain));
            plotDict[trackId] = brush;
        }
        if (type === TrackType.BrushCircular) {
            const domain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            const brushDomain = getEncodingSignal(trackDef.trackId, 'brush', linkedEncodings);
            if (!domain || !brushDomain || !hasLinkedTracks(trackDef.trackId, linkedEncodings)) return;
            // We only want to add the brush track if it is linked to another track
            const brush = new BrushCircularTrack(
                options,
                brushDomain,
                pixiManager.makeContainer(boundingBox).overlayDiv,
                domain
            );
            if (!options.static) {
                brush.addInteractor(plot => panZoom(plot, domain));
            }
            plotDict[trackId] = brush;
        }
        if (type === TrackType.Dummy) {
            const dummyPlot = new DummyTrack(options, pixiManager.makeContainer(boundingBox).overlayDiv);
            plotDict[trackId] = dummyPlot;
        }
    });
    return plotDict;
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
        return undefined;
    }
    if (!linkedEncoding.signal) {
        console.warn(`No signal found for linked encoding ${linkedEncoding.linkingId}`);
        return undefined;
    }
    return linkedEncoding!.signal;
}
