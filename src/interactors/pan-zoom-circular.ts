import { batch, type Signal } from '@preact/signals-core';
import { scaleLinear } from 'd3-scale';
import { ZoomTransform, type D3ZoomEvent, zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import { zoomWheelBehavior, type Plot } from '../tracks/utils';
import { pointsToDegree } from '../core/utils/polar';

/**
 * This interactor allows the user to pan and zoom circular plots
 */
export function panZoomCircular(
    plot: Plot & {
        pMasked: any;
        options?: {
            spec?: {
                innerRadius?: number;
                outerRadius?: number;
                startAngle?: number;
                endAngle?: number;
            };
        };
    },
    cursorPos: Signal<number>,
    xDomain: Signal<[number, number]>
) {
    plot.xDomain = xDomain;

    // This will store the domains when the user starts zooming
    const zoomStartScaleX = scaleLinear();

    // Get circular plot parameters
    const centerX = plot.domOverlay.clientWidth / 2;
    const centerY = plot.domOverlay.clientHeight / 2;
    const startAngle = plot.options?.spec?.startAngle ?? 0;
    const endAngle = plot.options?.spec?.endAngle ?? 360;

    // Store start position for pan calculations
    let panStartAngle = 0;
    let zoomStartPos = 0;
    let panStartDomain: [number, number] = [0, 0];

    // This function will be called every time the user zooms or pans
    const zoomed = (event: D3ZoomEvent<HTMLElement, unknown>) => {
        const { transform, sourceEvent } = event;

        if (sourceEvent && sourceEvent.type === 'wheel') {
            // This is a zoom event

            // Get the new domain from transform
            const newXDomain = transform.rescaleX(zoomStartScaleX).domain();
            const newDomain = newXDomain[1] - newXDomain[0];
            const originalDomain = zoomStartScaleX.domain()[1] - zoomStartScaleX.domain()[0];

            // Calculate zoom factor and adjust domain to center on mouse position
            const mouseRelativePos = (zoomStartPos - zoomStartScaleX.domain()[0]) / originalDomain;
            const adjustedStart = zoomStartPos - newDomain * mouseRelativePos;
            const centeredDomain: [number, number] = [adjustedStart, adjustedStart + newDomain];

            batch(() => {
                xDomain.value = centeredDomain;
            });
        } else if (sourceEvent && (sourceEvent.type === 'mousemove' || sourceEvent.type === 'mousedown')) {
            // This is a pan event
            const mouseX = (sourceEvent as any).offsetX || (sourceEvent as any).layerX;
            const mouseY = (sourceEvent as any).offsetY || (sourceEvent as any).layerY;

            // Convert current mouse position to polar coordinates
            const currentAngleDegrees = pointsToDegree(mouseX, mouseY, centerX, centerY);

            // Calculate angular delta
            const angleDiff = currentAngleDegrees - panStartAngle;

            // Convert angle difference to domain units
            const angleRange = endAngle - startAngle;
            const domainRange = panStartDomain[1] - panStartDomain[0];
            const domainDiff = (angleDiff / angleRange) * domainRange;

            // Apply the pan by shifting the domain
            const newXDomain: [number, number] = [panStartDomain[0] - domainDiff, panStartDomain[1] - domainDiff];

            batch(() => {
                xDomain.value = newXDomain;
            });
        }
    };

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
            // Use the default filter and our custom filters
            return defaultFilter && !isDraggingBrush && !isAltPressed;
        })
        // @ts-expect-error We need to reset the transform when the user stops zooming
        .on('end', () => (plot.domOverlay.__zoom = new ZoomTransform(1, 0, 0)))
        .on('start', event => {
            zoomStartPos = cursorPos.value;
            // Set up zoomStartScaleX like panZoom does
            zoomStartScaleX.domain(xDomain.value).range([0, plot.width]);

            // Store pan start position
            const { sourceEvent } = event;
            if (sourceEvent && sourceEvent.type === 'mousedown') {
                const mouseX = (sourceEvent as any).offsetX || (sourceEvent as any).layerX;
                const mouseY = (sourceEvent as any).offsetY || (sourceEvent as any).layerY;
                panStartAngle = pointsToDegree(mouseX, mouseY, centerX, centerY);
                panStartDomain = [...xDomain.value] as [number, number];
            }
        })
        .on('zoom', zoomed);

    // Apply the zoom behavior to the overlay div
    select<HTMLElement, unknown>(plot.domOverlay).call(zoomBehavior);
}
