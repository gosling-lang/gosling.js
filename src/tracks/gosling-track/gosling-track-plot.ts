import { GoslingTrackClass, type GoslingTrackOptions, type GoslingTrackContext } from './gosling-track';
import * as PIXI from 'pixi.js';
import { fakePubSub } from '@higlass/utils';
import { scaleLinear } from 'd3-scale';
import { type Signal } from '@preact/signals-core';
import { DataFetcher } from '@higlass/datafetcher';

import { type Plot } from '../utils';
import { signal, effect } from '@preact/signals-core';

export class GoslingTrack extends GoslingTrackClass implements Plot {
    xDomain: Signal<[number, number]>; // Stores the genomic x-domain
    yDomain: Signal<[number, number]>; // Stores the genomic y-domain
    zoomStartScale = scaleLinear();
    domOverlay: HTMLElement; // This is the HTML element that covers the plot. Zoom behavior gets attached to this
    width: number;
    height: number;
    orientation: 'horizontal' | 'vertical';

    constructor(
        options: GoslingTrackOptions,
        dataFetcher: DataFetcher,
        containers: {
            pixiContainer: PIXI.Container;
            overlayDiv: HTMLElement;
        },
        xDomain = signal<[number, number]>([0, 3088269832]),
        yDomain?: Signal<[number, number]>,
        orientation: 'horizontal' | 'vertical' = 'horizontal'
    ) {
        const { pixiContainer, overlayDiv } = containers;

        // If there is already an svg element, use it. Otherwise, create a new one
        // If we do not reuse the same SVG element, we cannot have multiple brushes on the same track.
        const existingSvgElement = overlayDiv.querySelector('svg');
        const svgElement = existingSvgElement || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        if (!existingSvgElement) {
            svgElement.style.width = `${overlayDiv.clientWidth}px`;
            svgElement.style.height = `${overlayDiv.clientHeight}px`;
            overlayDiv.appendChild(svgElement);
        }

        // Setup the context object
        const context: GoslingTrackContext = {
            scene: pixiContainer,
            id: 'test',
            dataFetcher,
            dataConfig: {
                server: 'https://resgen.io/api/v1',
                tilesetUid: 'UvVPeLHuRDiYA3qwFlm7xQ'
                // coordSystem: "hg19",
            },
            animate: () => {},
            onValueScaleChanged: () => {},
            handleTilesetInfoReceived: (tilesetInfo: any) => {},
            onTrackOptionsChanged: () => {},
            pubSub: fakePubSub,
            isValueScaleLocked: () => false,
            svgElement: svgElement,
            isShowGlobalMousePosition: () => false
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

            this.scene.scale.y *= -1;
            this.scene.rotation = Math.PI / 2;
            const position = this.scene.position;
            // We move the scene down because the rotation point is the top left corner
            this.scene.position.set(position.x, position.y);
        }

        this.xDomain = xDomain;
        this.yDomain = yDomain ?? signal<[number, number]>(xDomain.value);
        this.domOverlay = overlayDiv;
        // Now we need to initialize all of the properties that would normally be set by HiGlassComponent
        this.setDimensions([this.width, this.height]);
        this.setPosition([0, 0]);
        // Create some scales where the range is the height/width of the plot
        const refXScale = scaleLinear().domain(this.xDomain.value).range([0, this.width]);
        const refYScale = scaleLinear().domain(this.yDomain.value).range([0, this.height]);
        // Set the scales
        this.zoomed(refXScale, refYScale);
        this.refScalesChanged(refXScale, refYScale);

        // Every time the domain gets changed we want to update the zoom
        effect(() => {
            const newScaleX = this._refXScale.domain(this.xDomain.value);
            const newScaleY = this._refYScale.domain(this.yDomain.value);
            this.zoomed(newScaleX, newScaleY);
        });
    }

    addInteractor(interactor: (plot: GoslingTrack) => void) {
        interactor(this);
        return this; // For chaining
    }
}
