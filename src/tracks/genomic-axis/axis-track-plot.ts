import { AxisTrackClass, type AxisTrackContext, type AxisTrackOptions } from './axis-track';
import * as PIXI from 'pixi.js';
import { fakePubSub } from '@higlass/utils';
import { scaleLinear } from 'd3-scale';
import { type Signal, effect } from '@preact/signals-core';

/**
 * A wrapper around the AxisTrackClass that allows for use with signals
 */
export class AxisTrack extends AxisTrackClass {
    /** A signal containing the genomic x-domain [start, end] */
    xDomain: Signal<[number, number]>;
    /** The div element the zoom behavior will get attached to */
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
            handleTilesetInfoReceived: () => {},
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
            // We rotate the scene 90 degrees to the left and flip it
            this.scene.scale.y *= -1;
            this.scene.rotation = Math.PI / 2;
            const position = this.scene.position;
            this.flipText = true;
            // We move the scene down because the rotation point is the top left corner
            this.scene.position.set(position.x, position.y);
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

        // Every time the domain gets changed we want to update the zoom
        effect(() => {
            const newScale = this._refXScale.domain(this.xDomain.value);
            this.zoomed(newScale, scaleLinear());
        });
    }

    addInteractor(interactor: (plot: AxisTrack) => void) {
        interactor(this);
        return this; // For chaining
    }
}
