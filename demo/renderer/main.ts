import { GoslingTrack, type GoslingTrackOptions } from '@gosling-lang/gosling-track';
import { AxisTrack, type AxisTrackOptions } from '@gosling-lang/genomic-axis';
import { BrushLinearTrack, type BrushLinearTrackOptions } from '@gosling-lang/brush-linear';
import { signal, Signal } from '@preact/signals-core';
import { TextTrack, type TextTrackOptions } from '@gosling-lang/text-track';

import { cursor, cursor2D, panZoom, panZoomHeatmap } from '@gosling-lang/interactors';
import { type TrackDefs, TrackType } from '../track-def/main';
import { getDataFetcher } from './dataFetcher';
import type { LinkedEncoding } from '../linking/linkedEncoding';
import { BrushCircularTrack, type BrushCircularTrackOptions } from '@gosling-lang/brush-circular';
import { HeatmapTrack, type HeatmapTrackOptions } from '@gosling-lang/heatmap';
import type { PixiManager } from '@pixi-manager';
import { DummyTrack, type DummyTrackOptions } from '@gosling-lang/dummy-track';
import type { UrlToFetchOptions } from 'src/compiler/compile';
import type { Tile } from '@higlass/services';
import type { DataFetcher } from '@higlass/datafetcher';
import type { OverlaidTrack, SingleTrack } from '@gosling-lang/gosling-schema';

/**
 * Takes a list of track definitions and linkedEncodings and renders them
 * @param trackOptions
 * @param pixiManager
 */
export function renderTrackDefs(
    trackDefs: TrackDefs[],
    linkedEncodings: LinkedEncoding[],
    pixiManager: PixiManager,
    prevPlots: Record<string, unknown>,
    urlToFetchOptions?: UrlToFetchOptions
) {
    const plotDict: Record<string, unknown> = {};

    const cursorPosX = signal(0);
    const cursorPosY = signal(0);

    // For reactive rendering, remove all plots except for the ones that need to be reused
    Object.keys(prevPlots).forEach(cacheId => {
        const index = trackDefs.findIndex(def => def.cacheId === cacheId);
        if (index === -1) {
            pixiManager.clear(cacheId);
            delete prevPlots[cacheId];
        }
    });

    // Create a new plots or reuse existing plots
    trackDefs.forEach(trackDef => {
        const { boundingBox, type, options, trackId, cacheId } = trackDef;
        const prevPlot = prevPlots[cacheId];
        if (type === TrackType.Text) {
            if (prevPlot) {
                const txtPlot = prevPlot as TextTrack;
                pixiManager.updateContainer(boundingBox, cacheId);
                txtPlot.setDimensions([boundingBox.width, boundingBox.height]);
                txtPlot.rerender(options as TextTrackOptions, true);
                plotDict[cacheId] = prevPlot as TextTrack;
            } else {
                const textOptions = options as TextTrackOptions;
                plotDict[cacheId] = new TextTrack(textOptions, pixiManager.makeContainer(boundingBox, cacheId));
            }
        }
        if (type === TrackType.Gosling) {
            const gosOptions = options as GoslingTrackOptions;
            const { spec } = gosOptions;
            const xDomain = getEncodingSignal(trackId, 'x', linkedEncodings);
            const yDomain = getEncodingSignal(trackId, 'y', linkedEncodings);
            if (!xDomain) return;

            const datafetcher = getDataFetcher(spec, urlToFetchOptions);
            if (!datafetcher) return;
            if (prevPlot) {
                // TODO: the new signal needs to be passed to the existing plot
                const gosPlot = prevPlots[cacheId] as GoslingTrack;
                pixiManager.updateContainer(boundingBox, cacheId);
                gosPlot.setDimensions([boundingBox.width, boundingBox.height]);
                gosPlot.rerender(gosOptions);
                const isOverlayedOnPrevious = 'overlayOnPreviousTrack' in spec && spec.overlayOnPreviousTrack;
                if (!spec.static && !isOverlayedOnPrevious) {
                    // TODO: How to update this based on the updated width/height?
                    gosPlot.addInteractor(plot => panZoom(plot, xDomain, yDomain));
                }
                plotDict[cacheId] = gosPlot;
            } else {
                const gosPlot = new GoslingTrack(
                    gosOptions,
                    datafetcher as DataFetcher<Tile>,
                    pixiManager.makeContainer(boundingBox, cacheId),
                    xDomain,
                    yDomain,
                    gosOptions.spec.orientation
                );
                const isOverlayedOnPrevious = 'overlayOnPreviousTrack' in spec && spec.overlayOnPreviousTrack;
                if (!spec.static && !isOverlayedOnPrevious) {
                    gosPlot.addInteractor(plot => panZoom(plot, xDomain, yDomain));
                }
                gosPlot.addInteractor(plot => cursor(plot, cursorPosX));
                plotDict[cacheId] = gosPlot;
            }
        }
        if (type === TrackType.Heatmap) {
            const hmOptions = options as HeatmapTrackOptions;
            const { spec } = hmOptions;
            const xDomain = getEncodingSignal(trackId, 'x', linkedEncodings);
            const yDomain = getEncodingSignal(trackId, 'y', linkedEncodings);
            if (!xDomain || !yDomain) return;

            const datafetcher = getDataFetcher(spec as SingleTrack | OverlaidTrack, urlToFetchOptions);
            if (prevPlot) {
                // TODO: the new signal needs to be passed to the existing plot
                const heatmapPlot = prevPlots[cacheId] as HeatmapTrack;
                heatmapPlot.rerender(hmOptions);
                plotDict[cacheId] = heatmapPlot;
            } else {
                const heatmapPlot = new HeatmapTrack(
                    hmOptions,
                    datafetcher as DataFetcher<Tile>,
                    pixiManager.makeContainer(boundingBox, cacheId)
                )
                    .addInteractor(plot => panZoomHeatmap(plot, xDomain, yDomain))
                    .addInteractor(plot => cursor2D(plot, cursorPosX, cursorPosY));
                plotDict[cacheId] = heatmapPlot;
            }
        }
        if (type === TrackType.Axis) {
            const axisOptions = options as AxisTrackOptions;
            const domain = getEncodingSignal(trackId, axisOptions.encoding, linkedEncodings);
            if (!domain) {
                console.warn(`No domain found for axis ${trackId}. Skipping...`);
                return;
            }
            if (prevPlot) {
                const axisPlot = prevPlot as AxisTrack;
                pixiManager.updateContainer(boundingBox, cacheId);
                axisPlot.setDimensions([boundingBox.width, boundingBox.height]);
                // axisPlot.rerender(options as TextTrackOptions, true);
                plotDict[cacheId] = prevPlot;
            } else {
                const axisTrack = new AxisTrack(
                    axisOptions,
                    domain,
                    pixiManager.makeContainer(boundingBox, cacheId),
                    axisOptions.orientation
                );
                if (!axisOptions.static) {
                    axisTrack.addInteractor(plot => panZoom(plot, domain));
                }
                plotDict[cacheId] = axisTrack;
            }
        }
        if (type === TrackType.BrushLinear) {
            const brushOptions = options as BrushLinearTrackOptions;
            const domain = getEncodingSignal(trackId, 'x', linkedEncodings);
            const brushDomain = getEncodingSignal(trackId, 'brush', linkedEncodings);
            if (!domain || !brushDomain || !hasLinkedTracks(trackId, linkedEncodings)) return;
            // We only want to add the brush track if it is linked to another track
            const brush = new BrushLinearTrack(
                brushOptions,
                brushDomain,
                pixiManager.makeContainer(boundingBox, cacheId).overlayDiv,
                domain
            );
            if (!brushOptions.static) brush.addInteractor(plot => panZoom(plot, domain));
            plotDict[cacheId] = brush;
        }
        if (type === TrackType.BrushCircular) {
            const brushOptions = options as BrushCircularTrackOptions;
            const domain = getEncodingSignal(trackId, 'x', linkedEncodings);
            const brushDomain = getEncodingSignal(trackId, 'brush', linkedEncodings);
            if (!domain || !brushDomain || !hasLinkedTracks(trackId, linkedEncodings)) return;
            // We only want to add the brush track if it is linked to another track
            const brush = new BrushCircularTrack(
                brushOptions,
                brushDomain,
                pixiManager.makeContainer(boundingBox, cacheId).overlayDiv,
                domain
            );
            if (!brushOptions.static) {
                brush.addInteractor(plot => panZoom(plot, domain));
            }
            plotDict[cacheId] = brush;
        }
        if (type === TrackType.Dummy) {
            const dummyOptions = options as DummyTrackOptions;
            const dummyPlot = new DummyTrack(dummyOptions, pixiManager.makeContainer(boundingBox, cacheId).overlayDiv);
            plotDict[cacheId] = dummyPlot;
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
