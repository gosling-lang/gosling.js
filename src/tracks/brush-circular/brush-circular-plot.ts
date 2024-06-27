import {
    CircularBrushTrackClass,
    type BrushCircularTrackOptions,
    type BrushCircularTrackContext
} from './brush-circular';
import { scaleLinear } from 'd3-scale';
import { type Signal, effect, signal } from '@preact/signals-core';

export class BrushCircularTrack extends CircularBrushTrackClass {
    xDomain: Signal<number[]>;
    xBrushDomain: Signal<number[]>;
    zoomStartScale = scaleLinear(); // This is the scale that we use to store the domain when the user starts zooming
    domOverlay: HTMLElement; // This is the div that we're going to apply the zoom behavior to
    width: number;
    height: number;
    orientation: 'horizontal';

    constructor(
        options: BrushCircularTrackOptions,
        xBrushDomain: Signal<[number, number]>,
        domOverlay: HTMLElement,
        xDomain = signal<[number, number]>([0, 3088269832])
    ) {
        // If there is already an svg element, use it. Otherwise, create a new one
        const existingSvgElement = domOverlay.querySelector('svg');
        const svgElement = existingSvgElement || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        if (!existingSvgElement) {
            svgElement.style.width = `${domOverlay.clientWidth}px`;
            svgElement.style.height = `${domOverlay.clientHeight}px`;
            domOverlay.appendChild(svgElement);
        }

        // Setup the context object
        const context: BrushCircularTrackContext = {
            id: 'test',
            svgElement: svgElement,
            getTheme: () => 'light',
            registerViewportChanged: () => {},
            removeViewportChanged: () => {},
            setDomainsCallback: (xDomain: [number, number]) => (xBrushDomain.value = xDomain),
            projectionXDomain: xBrushDomain.value
        };

        super(context, options);
        this.orientation = 'horizontal'; // always horizontal for now
        this.width = domOverlay.clientWidth;
        this.height = domOverlay.clientHeight;
        this.xDomain = xDomain;
        this.xBrushDomain = xBrushDomain;
        this.domOverlay = domOverlay;
        // Now we need to initialize all of the properties that would normally be set by HiGlassComponent
        this.setDimensions([this.width, this.height]);
        this.setPosition([0, 0]);
        // Create some scales to pass in
        const refXScale = scaleLinear().domain(xDomain.value).range([0, this.width]);
        const refYScale = scaleLinear(); // This doesn't get used anywhere but we need to pass it in
        // Set the scales
        this.zoomed(refXScale, refYScale);
        this.refScalesChanged(refXScale, refYScale);
        // Draw and add the zoom behavior
        this.draw();

        // When the brush signal changes, we want to update the brush
        effect(() => {
            const newXDomain = scaleLinear().domain(this.xBrushDomain.value);
            this.viewportChanged(newXDomain, scaleLinear());
        });
    }

    addInteractor(interactor: (plot: BrushCircularTrack) => void) {
        interactor(this);
        return this; // For chaining
    }
}
