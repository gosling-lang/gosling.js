import { type Signal, effect } from '@preact/signals-core';
import { scaleLinear } from 'd3-scale';
import { ZoomTransform, type D3ZoomEvent, zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import { zoomWheelBehavior, type HeatmapPlot } from '../tracks/utils';

/**
 * This interactor allows the user to pan and zoom the plot
 */

export function panZoomHeatmap(
    plot: HeatmapPlot,
    xDomain: Signal<[number, number]>,
    yDomain: Signal<[number, number]>
) {
    plot.xDomain = xDomain; // Update the xDomain with the signal
    plot.yDomain = yDomain;
    // This will store the xDomain when the user starts zooming
    const zoomStartXScale = scaleLinear();
    const zoomStartYScale = scaleLinear();

    const origXDomain = xDomain.value;
    const origYDomain = yDomain.value;
    const width = plot.domOverlay.clientWidth;
    const height = plot.domOverlay.clientHeight;
    const baseXScale = scaleLinear().range([0, width]);
    const baseYScale = scaleLinear().range([0, height]);

    // This function will be called every time the user zooms
    const zoomed = (event: D3ZoomEvent<HTMLElement, unknown>) => {
        const { transform } = event;
        const newXDomain = transform.rescaleX(zoomStartXScale).domain();
        xDomain.value = newXDomain as [number, number];
        const newYDomain = transform.rescaleY(zoomStartYScale).domain();
        yDomain.value = newYDomain as [number, number];
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
            zoomStartXScale.domain(xDomain.value).range([0, width]);
            zoomStartYScale.domain(yDomain.value).range([0, height]);
        })
        .on('zoom', zoomed);

    // Apply the zoom behavior to the overlay div
    select<HTMLElement, unknown>(plot.domOverlay).call(zoomBehavior);

    effect(() => {
        const newXScale = baseXScale.domain(xDomain.value);
        const newYScale = baseYScale.domain(yDomain.value);

        // We need to calculate the k, tx, and ty values for the zoom
        // Normally we would use the d3-zoom transform object, but we can't use it here
        // since after every zoom event, we reset the transform object to new ZoomTransform(1, 0, 0);
        // This lets us change the xDomain and yDomain signals without having to update the transform object

        const k = (origXDomain[1] - origXDomain[0]) / (xDomain.value[1] - xDomain.value[0]);
        const scalingXFactor = width / (origXDomain[1] - origXDomain[0]);
        const tx = -(xDomain.value[0] * k - origXDomain[0]) * scalingXFactor;

        const scalingYFactor = height / (origYDomain[1] - origYDomain[0]);
        const ty = -(yDomain.value[0] * k - origYDomain[0]) * scalingYFactor;

        plot.zoomed(newXScale, newYScale, k, tx, ty);
    });
}
