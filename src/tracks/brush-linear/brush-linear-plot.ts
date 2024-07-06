import {
    BrushLinearTrackClass,
    type BrushLinearTrackOptions,
    type BrushLinearTrackContext
} from './brush-linear-track';
import { scaleLinear } from 'd3-scale';
import { type Signal, effect, signal } from '@preact/signals-core';

/**
 * A wrapper around the BrushLinearTrackClass that allows for use with signals
 */
export class BrushLinearTrack extends BrushLinearTrackClass<BrushLinearTrackOptions> {
    /** A signal containing the genomic x-domain [start, end] */
    xDomain: Signal<[number, number]>;
    /** A signal containing the brush x-domain [start, end] */
    xBrushDomain: Signal<[number, number]>;
    /** The div element the zoom behavior will get attached to */
    domOverlay: HTMLElement;
    width: number;
    height: number;

    constructor(
        options: BrushLinearTrackOptions,
        xBrushDomain: Signal<[number, number]>,
        domOverlay: HTMLElement,
        xDomain = signal<[number, number]>([0, 3088269832]) // Default domain
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
        const context: BrushLinearTrackContext = {
            id: 'test',
            svgElement: svgElement,
            getTheme: () => 'light',
            registerViewportChanged: () => {},
            removeViewportChanged: () => {},
            setDomainsCallback: (xDomain: [number, number]) => (xBrushDomain.value = xDomain),
            projectionXDomain: xBrushDomain.value
        };

        super(context, options);
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
        // Every time the domain gets changed we want to update the zoom
        effect(() => {
            const newScale = this._refXScale.domain(this.xDomain.value);
            this.zoomed(newScale, scaleLinear());
        });
    }

    addInteractor(interactor: (plot: BrushLinearTrack) => void) {
        interactor(this);
        return this; // For chaining
    }
}
