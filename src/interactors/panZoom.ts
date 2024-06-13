import { type Signal, effect } from '@preact/signals-core';
import { scaleLinear } from 'd3-scale';
import { ZoomTransform, type D3ZoomEvent, zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import { zoomWheelBehavior, type Plot } from '../tracks/utils';

/**
 * This interactor allows the user to pan and zoom the plot
 */

export function panZoom(plot: Plot, xDomain: Signal<[number, number]>) {
    plot.xDomain = xDomain; // Update the xDomain with the signal
    const baseScale = scaleLinear().range([0, plot.domOverlay.clientWidth]);
    // This will store the xDomain when the user starts zooming
    const zoomStartScale = scaleLinear();
    // This function will be called every time the user zooms
    const zoomed = (event: D3ZoomEvent<HTMLElement, unknown>) => {
        const newXDomain = event.transform.rescaleX(zoomStartScale).domain();
        xDomain.value = newXDomain as [number, number];
    };
    // Create the zoom behavior
    const zoomBehavior = zoom<HTMLElement, unknown>()
        .wheelDelta(zoomWheelBehavior)
        .filter(event => {
            // We don't want to zoom if the user is dragging a brush
            const isRect = event.target.tagName === 'rect';
            const isMousedown = event.type === 'mousedown';
            const isDraggingBrush = isRect && isMousedown;
            // Here are the default filters
            const defaultFilter = (!event.ctrlKey || event.type === 'wheel') && !event.button;
            // Use the default filter and our custom filter
            return defaultFilter && !isDraggingBrush;
        })
        // @ts-expect-error We need to reset the transform when the user stops zooming
        .on('end', () => (plot.domOverlay.__zoom = new ZoomTransform(1, 0, 0)))
        .on('start', () => {
            zoomStartScale.domain(xDomain.value).range([0, plot.domOverlay.clientWidth]);
        })
        .on('zoom', zoomed);

    // Apply the zoom behavior to the overlay div
    select<HTMLElement, unknown>(plot.domOverlay).call(zoomBehavior);

    // Every time the domain gets changed we want to update the zoom
    effect(() => {
        const newScale = baseScale.domain(plot.xDomain.value);
        plot.zoomed(newScale, scaleLinear());
    });
}
