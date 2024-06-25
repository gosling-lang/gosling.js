import { type Signal, effect } from '@preact/signals-core';
import { scaleLinear } from 'd3-scale';
import { ZoomTransform, type D3ZoomEvent, zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import { zoomWheelBehavior, type Plot } from '../tracks/utils';

/**
 * This interactor allows the user to pan and zoom the plot
 */

export function panZoomXY(plot: Plot, xDomain: Signal<[number, number]>, yDomain: Signal<[number, number]>) {
    plot.xDomain = xDomain; // Update the xDomain with the signal
    plot.yDomain = yDomain;
    const baseScale = scaleLinear().range([0, plot.domOverlay.clientWidth]);
    const baseYScale = scaleLinear().range([0, plot.domOverlay.clientHeight]);
    // This will store the xDomain when the user starts zooming
    const zoomStartXScale = scaleLinear();
    const zoomStartYScale = scaleLinear();

    const originalDomain = [0, 3088269832];
    const originalRange = [0, plot.domOverlay.clientWidth];

    // This function will be called every time the user zooms
    const zoomed = (event: D3ZoomEvent<HTMLElement, unknown>) => {
        const { transform } = event;
        const newXDomain = transform.rescaleX(zoomStartXScale).domain();
        xDomain.value = newXDomain as [number, number];
        const newYDomain = transform.rescaleY(zoomStartYScale).domain();
        yDomain.value = newYDomain as [number, number];

        const scalingFactor = originalRange[1] / originalDomain[1];

        const k = (originalDomain[1] - originalDomain[0]) / (newXDomain[1] - newXDomain[0]);
        const x = -(newXDomain[0] * k - originalDomain[0]) * scalingFactor;
        const y = -(newYDomain[0] * k - originalDomain[0]) * scalingFactor;

        const newXScale = baseScale.domain(xDomain.value);
        const newYScale = baseYScale.domain(yDomain.value);

        plot.zoomed(newXScale, newYScale, k, x, y);
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
        .on('end', () => {
            plot.domOverlay.__zoom = new ZoomTransform(1, 0, 0);
        })
        .on('start', () => {
            zoomStartXScale.domain(xDomain.value).range([0, plot.domOverlay.clientWidth]);
            zoomStartYScale.domain(yDomain.value).range([0, plot.domOverlay.clientHeight]);
        })
        .on('zoom', zoomed);

    // Apply the zoom behavior to the overlay div
    select<HTMLElement, unknown>(plot.domOverlay).call(zoomBehavior);

    // Every time the domain gets changed we want to update the zoom
    effect(() => {
        const newXScale = baseScale.domain(plot.xDomain.value);
        const newYScale = baseYScale.domain(plot.yDomain.value);
        plot.zoomed(newXScale, newYScale, 1, 0, 0);
    });
}
