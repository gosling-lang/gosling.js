import { AxisTrackClass, type AxisTrackContext, type AxisTrackOptions } from './axis-track';
import * as PIXI from 'pixi.js';
import { fakePubSub } from '@higlass/utils';
import { scaleLinear } from 'd3-scale';
import { ZoomTransform } from 'd3-zoom';

import { type D3ZoomEvent, zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import { type Signal, effect } from '@preact/signals-core';

// Default d3 zoom feels slow so we use this instead
// https://d3js.org/d3-zoom#zoom_wheelDelta
function wheelDelta(event: WheelEvent) {
    const defaultMultiplier = 5;
    return (
        -event.deltaY *
        (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) *
        (event.ctrlKey ? 10 : defaultMultiplier)
    );
}

export class AxisTrack extends AxisTrackClass {
    xDomain: Signal<[number, number]>;
    zoomStartScale = scaleLinear();
    domOverlay: HTMLElement;
    width: number;
    height: number;
    orientation: 'horizontal' | 'vertical';

    constructor(
        options: AxisTrackOptions,
        xDomain: Signal<[number, number]>,
        containers: {
            pixiContainer: PIXI.Container;
            overlayDiv: HTMLElement;
        },
        orientation: 'horizontal' | 'vertical' = 'horizontal'
    ) {
        const { pixiContainer, overlayDiv } = containers;
        // Create a new svg element. The brush will be drawn on this element
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.style.width = `${overlayDiv.clientWidth}px`;
        svgElement.style.height = `${overlayDiv.clientHeight}px`;
        // Add it to the overlay div
        overlayDiv.appendChild(svgElement);

        // Setup the context object
        const context: AxisTrackContext = {
            chromInfoPath: 'https://s3.amazonaws.com/gosling-lang.org/data/hg38.chrom.sizes',
            scene: pixiContainer,
            id: 'test',
            animate: () => {},
            onValueScaleChanged: () => {},
            handleTilesetInfoReceived: (tilesetInfo: any) => {},
            onTrackOptionsChanged: () => {},
            pubSub: fakePubSub,
            isValueScaleLocked: () => false,
            svgElement: svgElement
        };

        super(context, options);

        this.orientation = orientation;
        if (this.orientation === 'horizontal') {
            this.width = overlayDiv.clientWidth;
            this.height = overlayDiv.clientHeight;
        } else {
            // The width and height are swapped because the scene is rotated
            this.width = overlayDiv.clientHeight;
            this.height = overlayDiv.clientWidth;
            // We rotate the scene 90 degrees to the left
            this.scene.rotation = Math.PI / 2 + Math.PI;
            const position = this.scene.position;
            // We move the scene down because the rotation point is the top left corner
            this.scene.position.set(position.x, position.y + this.width);
        }

        this.xDomain = xDomain;
        this.domOverlay = overlayDiv;
        // Now we need to initialize all of the properties that would normally be set by HiGlassComponent
        this.setDimensions([this.width, this.height]);
        this.setPosition([0, 0]);
        // Create some scales which span the whole genome
        const refXScale = scaleLinear().domain(xDomain.value).range([0, this.width]);
        const refYScale = scaleLinear(); // This doesn't get used anywhere but we need to pass it in
        // Set the scales
        this.zoomed(refXScale, refYScale);
        this.refScalesChanged(refXScale, refYScale);

        // Add the zoom
        // this.#addZoom();
    }

    addInteractor(interactor: (plot: AxisTrack) => void) {
        interactor(this);
        return this; // For chaining
    }

    #addZoom(): void {
        const baseScale = scaleLinear().domain(this.xDomain.value).range([0, this.width]);

        // This function will be called every time the user zooms
        const zoomed = (event: D3ZoomEvent<HTMLElement, unknown>) => {
            if (this.orientation === 'vertical') {
                const newXDomain = event.transform.rescaleY(this.zoomStartScale).domain();
                this.xDomain.value = newXDomain;
            }
            if (this.orientation === 'horizontal') {
                const newXDomain = event.transform.rescaleX(this.zoomStartScale).domain();
                this.xDomain.value = newXDomain;
            }
        };

        // Create the zoom behavior
        const zoomBehavior = zoom<HTMLElement, unknown>()
            .wheelDelta(wheelDelta)
            // @ts-expect-error We need to reset the transform when the user stops zooming
            .on('end', () => (this.domOverlay.__zoom = new ZoomTransform(1, 0, 0)))
            .on('start', () => {
                if (this.orientation === 'horizontal')
                    this.zoomStartScale.domain(this.xDomain.value).range([0, this.width]);
                if (this.orientation === 'vertical')
                    this.zoomStartScale.domain(this.xDomain.value).range([this.width, 0]);
            })
            .on('zoom', zoomed.bind(this));

        // Apply the zoom behavior to the overlay div
        select<HTMLElement, unknown>(this.domOverlay).call(zoomBehavior);

        // Every time the domain gets changed we want to update the zoom
        effect(() => {
            const newScale = baseScale.domain(this.xDomain.value);
            this.zoomed(newScale, this._refYScale);
        });
    }
}
