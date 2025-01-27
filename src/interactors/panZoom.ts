import { type Signal, batch } from '@preact/signals-core';
import { scaleLinear } from 'd3-scale';
import { ZoomTransform, type D3ZoomEvent, zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import { zoomWheelBehavior, type Plot } from '../tracks/utils';

/**
 * This interactor allows the user to pan and zoom the plot
 */

export function panZoom(plot: Plot, xDomain: Signal<[number, number]>, yDomain?: Signal<[number, number]>) {
    plot.xDomain = xDomain; // Update the xDomain with the signal
    if ('yDomain' in plot && yDomain !== undefined) plot.yDomain = yDomain;

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
    const zoomBehavior = zoom<HTMLElement, unknown>()
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
            zoomStartScaleX.domain(xDomain.value).range([0, plot.width]);
            if (yDomain) zoomStartScaleY.domain(yDomain.value).range([0, plot.height]);
        })
        .on('zoom', zoomed);

    // Apply the zoom behavior to the overlay div
    select<HTMLElement, unknown>(plot.domOverlay).call(zoomBehavior);
}
