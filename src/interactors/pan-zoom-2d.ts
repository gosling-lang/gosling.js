import { type Signal, effect, batch } from '@preact/signals-core';
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

    const maxDomain = plot.maxDomain; // used to calculate k, the scaling factor

    // Create scales that will use current dimensions
    const baseXScale = scaleLinear();
    const baseYScale = scaleLinear();

    // This function will be called every time the user zooms
    const zoomed = (event: D3ZoomEvent<HTMLElement, unknown>) => {
        const { transform } = event;
        const newXDomain = transform.rescaleX(zoomStartXScale).domain();
        const newYDomain = transform.rescaleY(zoomStartYScale).domain();

        batch(() => {
            xDomain.value = newXDomain as [number, number];
            yDomain.value = newYDomain as [number, number];
        });
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
        .on('end', () => {
            // @ts-expect-error We need to reset the transform when the user stops zooming
            plot.domOverlay.__zoom = new ZoomTransform(1, 0, 0);
        })
        .on('start', () => {
            // Use current dimensions instead of cached ones
            const currentWidth = plot.width;
            const currentHeight = plot.height;
            zoomStartXScale.domain(xDomain.value).range([0, currentWidth]);
            zoomStartYScale.domain(yDomain.value).range([0, currentHeight]);
        })
        .on('zoom', zoomed);

    // Store the domain signals for updates
    (plot as any)._panZoomXDomain = xDomain;
    (plot as any)._panZoomYDomain = yDomain;

    // Apply the zoom behavior to the overlay div
    select<HTMLElement, unknown>(plot.domOverlay).call(zoomBehavior);

    effect(() => {
        // Use current dimensions instead of cached ones
        const currentWidth = plot.width;
        const currentHeight = plot.height;
        baseXScale.range([0, currentWidth]);
        baseYScale.range([0, currentHeight]);

        const newXScale = baseXScale.domain(xDomain.value);
        const newYScale = baseYScale.domain(yDomain.value);

        // We need to calculate the k, tx, and ty values for the zoom
        // Normally we would use the d3-zoom transform object, but we can't use it here
        // since after every zoom event, we reset the transform object to new ZoomTransform(1, 0, 0);
        // This lets us change the xDomain and yDomain signals without having to update the transform object

        const k = maxDomain / (xDomain.value[1] - xDomain.value[0]);
        const scalingXFactor = currentWidth / maxDomain;
        const tx = -(xDomain.value[0] * k) * scalingXFactor;

        const ky = maxDomain / (yDomain.value[1] - yDomain.value[0]);
        const scalingYFactor = currentHeight / maxDomain;
        const ty = -(yDomain.value[0] * k) * scalingYFactor;

        if (ky.toPrecision(3) !== k.toPrecision(3)) {
            // If there is a mismatch between the x and y scaling factors, we need to adjust the yDomain
            // TODO: This is a temporary fix. We need to find a better way to handle this
            const diff = maxDomain / k;
            yDomain.value = [yDomain.value[0], yDomain.value[0] + diff];
        } else {
            plot.zoomed(newXScale, newYScale, k, tx, ty);
        }
    });
}

/**
 * Updates the heatmap zoom behavior for a plot that has already been initialized with panZoomHeatmap
 * This should be called after setDimensions to ensure zoom uses the correct dimensions
 */
export function updatePanZoomHeatmap(plot: HeatmapPlot) {
    const xDomain = (plot as any)._panZoomXDomain;
    const yDomain = (plot as any)._panZoomYDomain;

    if (xDomain && yDomain) {
        // Re-initialize the panZoom with current dimensions
        panZoomHeatmap(plot, xDomain, yDomain);
    }
}
