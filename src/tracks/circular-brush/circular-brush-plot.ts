import {
    CircularBrushTrackClass,
    type CircularBrushTrackOptions,
    type CircularBrushTrackContext
} from './circular-brush';
import { scaleLinear } from 'd3-scale';
import { ZoomTransform, type D3ZoomEvent, zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import { type Signal, effect } from '@preact/signals-core';
import { zoomWheelBehavior } from '../utils';

export class CircularBrushTrack extends CircularBrushTrackClass {
    xDomain: Signal<number[]>;
    xBrushDomain: Signal<number[]>;
    zoomStartScale = scaleLinear(); // This is the scale that we use to store the domain when the user starts zooming
    #element: HTMLElement; // This is the div that we're going to apply the zoom behavior to

    constructor(
        options: CircularBrushTrackOptions,
        xDomain: Signal<[number, number]>,
        xBrushDomain: Signal<[number, number]>,
        overlayDiv: HTMLElement
    ) {
        const height = overlayDiv.clientHeight;
        const width = overlayDiv.clientWidth;
        // Create a new svg element. The brush will be drawn on this element
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.style.width = `${width}px`;
        svgElement.style.height = `${height}px`;
        // Add it to the overlay div
        overlayDiv.appendChild(svgElement);

        // Setup the context object
        const context: CircularBrushTrackContext = {
            id: 'test',
            svgElement: svgElement,
            getTheme: () => 'light',
            registerViewportChanged: () => {},
            removeViewportChanged: () => {},
            setDomainsCallback: (xDomain: [number, number]) => (xBrushDomain.value = xDomain),
            projectionXDomain: xBrushDomain.value
        };

        super(context, options);

        this.xDomain = xDomain;
        this.xBrushDomain = xBrushDomain;
        this.#element = overlayDiv;
        // Now we need to initialize all of the properties that would normally be set by HiGlassComponent
        this.setDimensions([width, height]);
        this.setPosition([0, 0]);
        // Create some scales to pass in
        const refXScale = scaleLinear().domain(xDomain.value).range([0, width]);
        const refYScale = scaleLinear(); // This doesn't get used anywhere but we need to pass it in
        // Set the scales
        this.zoomed(refXScale, refYScale);
        this.refScalesChanged(refXScale, refYScale);
        // Draw and add the zoom behavior
        this.draw();
        this.#addZoom();

        // When the brush signal changes, we want to update the brush
        effect(() => {
            const newXDomain = scaleLinear().domain(this.xBrushDomain.value);
            this.viewportChanged(newXDomain, scaleLinear());
        });
    }

    #addZoom(): void {
        // This function will be called every time the user zooms
        const zoomed = (event: D3ZoomEvent<HTMLElement, unknown>) => {
            const newXDomain = event.transform.rescaleX(this.zoomStartScale).domain();
            this.xDomain.value = newXDomain;
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
            .on('end', () => (this.#element.__zoom = new ZoomTransform(1, 0, 0)))
            .on('start', () => {
                this.zoomStartScale.domain(this.xDomain.value).range([0, this.#element.clientWidth]);
            })
            .on('zoom', zoomed.bind(this));

        // Apply the zoom behavior to the overlay div
        select<HTMLElement, unknown>(this.#element).call(zoomBehavior);

        // This scale will always have the same range, but the domain will change in the effect
        const baseScale = scaleLinear().domain(this.xDomain.value).range([0, this.#element.clientWidth]);
        // Every time the domain gets changed we want to update the zoom
        effect(() => {
            const newScale = baseScale.domain(this.xDomain.value);
            this.zoomed(newScale, this._refYScale);
        });
    }
}
