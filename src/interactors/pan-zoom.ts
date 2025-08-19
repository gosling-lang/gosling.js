import { type Signal, batch } from '@preact/signals-core';
import { scaleLinear } from 'd3-scale';
import { ZoomTransform, type D3ZoomEvent, zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import { zoomWheelBehavior, type HeatmapPlot, type Plot } from '../tracks/utils';

/**
 * This interactor allows the user to pan and zoom the plot
 */
function createPanZoomBehavior(
    plot: Plot | HeatmapPlot,
    xDomain: Signal<[number, number]>,
    yDomain?: Signal<[number, number]>
) {
    // This will store the xDomain when the user starts zooming
    const zoomStartScaleX = scaleLinear();
    const zoomStartScaleY = scaleLinear();

    // This function will be called every time the user zooms
    const zoomed = (event: D3ZoomEvent<HTMLElement, unknown>) => {
        if (plot.orientation === undefined || plot.orientation === 'horizontal') {
            const newXDomain = event.transform.rescaleX(zoomStartScaleX).domain();
            const newYDomain = event.transform.rescaleY(zoomStartScaleY).domain();
            batch(() => {
                xDomain.value = newXDomain as [number, number];
                if (yDomain) yDomain.value = newYDomain as [number, number];
            });
        }
        if (plot.orientation === 'vertical') {
            const newXDomain = event.transform.rescaleY(zoomStartScaleX).domain();
            const newYDomain = event.transform.rescaleX(zoomStartScaleY).domain();
            batch(() => {
                xDomain.value = newXDomain as [number, number];
                if (yDomain) yDomain.value = newYDomain as [number, number];
            });
        }
    };

    // Create the zoom behavior
    return (
        zoom<HTMLElement, unknown>()
            .wheelDelta(zoomWheelBehavior)
            .filter(event => {
                // We don't want to zoom if the user is dragging a brush
                const isRect = event.target.tagName === 'rect';
                const isMousedown = event.type === 'mousedown';
                const isDraggingBrush = isRect && isMousedown;
                const isAltPressed = event.altKey;
                // Here are the default filters
                const defaultFilter = (!event.ctrlKey || event.type === 'wheel') && !event.button;
                // Use the default filter and our custom filter
                return defaultFilter && !isDraggingBrush && !isAltPressed;
            })
            // @ts-expect-error We need to reset the transform when the user stops zooming
            .on('end', () => (plot.domOverlay.__zoom = new ZoomTransform(1, 0, 0)))
            .on('start', () => {
                // Always use current plot dimensions for zoom start scales
                zoomStartScaleX.domain(xDomain.value).range([0, plot.domOverlay.clientWidth]);
                if (yDomain) zoomStartScaleY.domain(yDomain.value).range([0, plot.domOverlay.clientHeight]);
            })
            .on('zoom', zoomed)
    );
}

export function panZoom(
    plot: Plot | HeatmapPlot,
    xDomain: Signal<[number, number]>,
    yDomain?: Signal<[number, number]>
) {
    plot.xDomain = xDomain; // Update the xDomain with the signal
    if ('yDomain' in plot && yDomain !== undefined) plot.yDomain = yDomain;

    // Store the domain signals for updates
    (plot as any)._panZoomXDomain = xDomain;
    (plot as any)._panZoomYDomain = yDomain;

    // Create and apply the zoom behavior
    const zoomBehavior = createPanZoomBehavior(plot, xDomain, yDomain);
    select<HTMLElement, unknown>(plot.domOverlay).call(zoomBehavior);
}

/**
 * Updates the zoom behavior for a plot that has already been initialized with panZoom
 * This should be called after setDimensions to ensure zoom uses the correct dimensions
 */
export function updatePanZoom(plot: Plot | HeatmapPlot) {
    const xDomain = (plot as any)._panZoomXDomain;
    const yDomain = (plot as any)._panZoomYDomain;

    if (xDomain) {
        // Clear any existing zoom transform to ensure clean state with new dimensions
        // @ts-expect-error We need to reset the transform when dimensions change
        plot.domOverlay.__zoom = new ZoomTransform(1, 0, 0);

        // Create a fresh zoom behavior with current dimensions
        const zoomBehavior = createPanZoomBehavior(plot, xDomain, yDomain);
        select<HTMLElement, unknown>(plot.domOverlay).call(zoomBehavior);
    }
}
