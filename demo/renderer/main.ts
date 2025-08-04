import { GoslingTrack, type GoslingTrackOptions } from '@gosling-lang/gosling-track';
import { AxisTrack, type AxisTrackOptions } from '@gosling-lang/genomic-axis';
import { BrushLinearTrack, type BrushLinearTrackOptions } from '@gosling-lang/brush-linear';
import { signal, Signal } from '@preact/signals-core';
import { TextTrack, type TextTrackOptions } from '@gosling-lang/text-track';

import { cursor, cursor2D, panZoom, panZoomHeatmap } from '@gosling-lang/interactors';
import { cursorCircular } from '../../src/interactors/cursor-circular';
import { panZoomCircular } from '../../src/interactors/pan-zoom-circular';
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
import { createSpatialTrack } from '../../src/tracks/spatial-track/spatial-track';
import type { CsvDataFetcherClass } from 'src/data-fetchers/csv/csv-data-fetcher';

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

    const cursorPosX = signal(Number.NEGATIVE_INFINITY);
    const cursorPosY = signal(Number.NEGATIVE_INFINITY);

    trackDefs.forEach(trackDef => {
        const { boundingBox, type, options, trackId } = trackDef;

        if (type === TrackType.Text) {
            const textOptions = options as TextTrackOptions;
            const plot = new TextTrack(textOptions, pixiManager.makeContainer(boundingBox));
            plotDict[trackId] = plot;
        }
        if (type === TrackType.Gosling) {
            const gosOptions = options as GoslingTrackOptions;
            const { spec } = gosOptions;
            const xDomain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            const yDomain = getEncodingSignal(trackDef.trackId, 'y', linkedEncodings);
            if (!xDomain) return;

            const datafetcher = getDataFetcher(spec, urlToFetchOptions);
            if (!datafetcher) return;
            const gosPlot = new GoslingTrack(
                gosOptions,
                datafetcher as DataFetcher<Tile>,
                pixiManager.makeContainer(boundingBox),
                xDomain,
                yDomain,
                gosOptions.spec.orientation
            );
            const isOverlayedOnPrevious = 'overlayOnPreviousTrack' in spec && spec.overlayOnPreviousTrack;
            // TODO: Is this check sufficient?
            if (!spec.static && !(spec.layout === 'linear' && isOverlayedOnPrevious)) {
                if (spec.layout === 'circular') {
                    gosPlot.addInteractor(plot => panZoomCircular(plot, cursorPosX, xDomain));
                } else {
                    gosPlot.addInteractor(plot => panZoom(plot, xDomain, yDomain));
                }
            }
            if (spec.layout === 'circular') {
                gosPlot.addInteractor(plot => cursorCircular(plot, cursorPosX));
            } else {
                gosPlot.addInteractor(plot => cursor(plot, cursorPosX));
            }
            plotDict[trackId] = gosPlot;
        }
        if (type === TrackType.Heatmap) {
            const hmOptions = options as HeatmapTrackOptions;
            const { spec } = hmOptions;
            const xDomain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            const yDomain = getEncodingSignal(trackDef.trackId, 'y', linkedEncodings);
            if (!xDomain || !yDomain) return;

            const datafetcher = getDataFetcher(spec as SingleTrack | OverlaidTrack, urlToFetchOptions);
            const heatmapPlot = new HeatmapTrack(
                hmOptions,
                datafetcher as DataFetcher<Tile>,
                pixiManager.makeContainer(boundingBox)
            )
                .addInteractor(plot => panZoomHeatmap(plot, xDomain, yDomain))
                .addInteractor(plot => cursor2D(plot, cursorPosX, cursorPosY));
            plotDict[trackId] = heatmapPlot;
        }
        if (type === TrackType.Axis) {
            const axisOptions = options as AxisTrackOptions;
            const domain = getEncodingSignal(trackDef.trackId, axisOptions.encoding, linkedEncodings);
            if (!domain) {
                console.warn(`No domain found for axis ${trackDef.trackId}. Skipping...`);
                return;
            }
            const axisTrack = new AxisTrack(
                axisOptions,
                domain,
                pixiManager.makeContainer(boundingBox),
                axisOptions.orientation
            );
            if (!axisOptions.static) {
                axisTrack.addInteractor(plot => panZoom(plot, domain));
            }
            plotDict[trackId] = axisTrack;
        }
        if (type === TrackType.BrushLinear) {
            const brushOptions = options as BrushLinearTrackOptions;
            const domain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            const brushDomain = getEncodingSignal(trackDef.trackId, 'brush', linkedEncodings);
            if (!domain || !brushDomain || !hasLinkedTracks(trackDef.trackId, linkedEncodings)) return;
            // We only want to add the brush track if it is linked to another track
            const brush = new BrushLinearTrack(
                brushOptions,
                brushDomain,
                pixiManager.makeContainer(boundingBox).overlayDiv,
                domain
            );
            if (!brushOptions.static) brush.addInteractor(plot => panZoom(plot, domain));
            plotDict[trackId] = brush;
        }
        if (type === TrackType.BrushCircular) {
            const brushOptions = options as BrushCircularTrackOptions;
            const domain = getEncodingSignal(trackDef.trackId, 'x', linkedEncodings);
            const brushDomain = getEncodingSignal(trackDef.trackId, 'brush', linkedEncodings);
            if (!domain || !brushDomain || !hasLinkedTracks(trackDef.trackId, linkedEncodings)) return;
            // We only want to add the brush track if it is linked to another track
            const brush = new BrushCircularTrack(
                brushOptions,
                brushDomain,
                pixiManager.makeContainer(boundingBox).overlayDiv,
                domain
            );
            if (!brushOptions.static) {
                brush.addInteractor(plot => panZoom(plot, domain));
            }
            plotDict[trackId] = brush;
        }
        if (type === TrackType.Dummy) {
            const dummyOptions = options as DummyTrackOptions;
            const dummyPlot = new DummyTrack(dummyOptions, pixiManager.makeContainer(boundingBox).overlayDiv);
            plotDict[trackId] = dummyPlot;
        }
        // Add a new track type for Chromospace
        if (type === TrackType.Spatial) {
            // Even though Chromospace doesn't use PixiJS, we can use the PixiManager to create a div container that the canvas can be placed into.
            // In the final version, we would probably want Chromospace to use an existing canvas element (to limit the creation of new elements).
            // But for now this gets the job done.
            const container = pixiManager.makeContainer(boundingBox).overlayDiv;
            console.warn('!@$!#%@#');
            console.warn(options.spec);
            if (options.spec.data) {
                // Ensure to pull all data needed
                options.spec.data.sampleLength = 30000;
            }
            const datafetcher = getDataFetcher(options.spec, urlToFetchOptions);
            createSpatialTrack(options, datafetcher as CsvDataFetcherClass, container);
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
