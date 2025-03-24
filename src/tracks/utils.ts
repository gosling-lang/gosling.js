import type { GoslingSpec } from '@gosling-lang/gosling-schema';
import { type Signal } from '@preact/signals-core';
import { type ScaleLinear } from 'd3-scale';

export function zoomWheelBehavior(event: WheelEvent) {
    // Default d3 zoom feels slow, so we can adjust the following instead
    // https://d3js.org/d3-zoom#zoom_wheelDelta
    const defaultMultiplier = 1;
    return (
        -event.deltaY *
        (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) *
        (event.ctrlKey ? 10 : defaultMultiplier)
    );
}

/**
 * This is the interface that plots must implement for Interactors to work
 */
export interface Plot {
    addInteractor(interactor: (plot: Plot) => void): Plot;
    domOverlay: HTMLElement;
    orientation?: 'horizontal' | 'vertical';
    width: number;
    height: number;
    xDomain: Signal<[number, number]>;
    yDomain?: Signal<[number, number]>;
    zoomed(xScale: ScaleLinear<number, number>, yScale: ScaleLinear<number, number>): void;
}

/**
 * This this is the plot interface for the PanZoomHeatmap interactor
 */
export interface HeatmapPlot {
    addInteractor(interactor: (plot: Plot) => void): Plot;
    domOverlay: HTMLElement;
    xDomain: Signal<[number, number]>;
    yDomain: Signal<[number, number]>;
    maxDomain: number;
    zoomed(
        xScale: ScaleLinear<number, number>,
        yScale: ScaleLinear<number, number>,
        k: number,
        tx: number,
        ty: number
    ): void;
}

export function getTrackParentViews(spec: GoslingSpec) {
    console.warn("getTrackParentViews");
    //~ <trackId, parent viewId>
    const tracksAndViews = new Map<string, string>();
    for (const view of spec.views) {
        const viewId = view.id;
        for (const track of view.tracks) {
            const trackId = track.id;
            console.log(`${viewId} -> ${trackId}`);
            tracksAndViews.set(trackId, viewId);
        }
    }
    //console.log(spec.views);
    return tracksAndViews;
}
