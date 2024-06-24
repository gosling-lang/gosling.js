import { HeatmapTiledPixiTrack } from '@higlass/tracks';
import type { TiledPixiTrackContext, TiledPixiTrackOptions } from '@higlass/tracks';
import * as PIXI from 'pixi.js';
import { fakePubSub } from '@higlass/utils';
import { scaleLinear } from 'd3-scale';

import { type D3ZoomEvent, zoom, ZoomTransform } from 'd3-zoom';
import { select } from 'd3-selection';
import { zoomWheelBehavior } from '../utils';
import { DataFetcher } from '@higlass/datafetcher';
import { signal, type Signal, effect } from '@preact/signals-core';

type HeatmapTrackContext = TiledPixiTrackContext & {
    svgElement: HTMLElement;
    onTrackOptionsChanged: () => void;
    onMouseMoveZoom?: (event: any) => void;
    isShowGlobalMousePosition?: () => boolean; // only used when options.showMousePosition is true
    isValueScaleLocked: () => boolean;
};

type HeatmapTrackOptions = TiledPixiTrackOptions & {
    dataTransform?: unknown;
    extent?: string;
    reverseYAxis?: boolean;
    showTooltip?: boolean;
    heatmapValueScaling?: string;
    colorRange?: unknown;
    showMousePosition?: boolean;
    scaleStartPercent?: unknown;
    scaleEndPercent?: unknown;
    labelPosition?: unknown;
    colorbarPosition?: string;
    colorbarBackgroundColor?: string;
    colorbarBackgroundOpacity?: number;
    zeroValueColor?: string;
    selectRowsAggregationMode?: string;
    selectRowsAggregationWithRelativeHeight?: unknown;
    selectRowsAggregationMethod?: unknown;
};

export class HeatmapTrack extends HeatmapTiledPixiTrack<HeatmapTrackOptions> {
    xDomain: Signal<[number, number]>; // This has to be a signal because it will potentially be updated by interactors
    yDomain: Signal<[number, number]>;
    domOverlay: HTMLElement;
    d3ZoomTransform: ZoomTransform;

    constructor(
        options: HeatmapTrackOptions,
        dataFetcher: DataFetcher,
        containers: {
            pixiContainer: PIXI.Container;
            overlayDiv: HTMLElement;
        },
        xDomain = signal<[number, number]>([0, 3088269832]),
        yDomain = signal<[number, number]>([0, 3088269832])
    ) {
        const { pixiContainer, overlayDiv } = containers;
        const height = overlayDiv.clientHeight;
        const width = overlayDiv.clientWidth;
        // If there is already an svg element, use it. Otherwise, create a new one
        const existingSvgElement = overlayDiv.querySelector('svg');
        const svgElement = existingSvgElement || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        if (!existingSvgElement) {
            svgElement.style.width = `${width}px`;
            svgElement.style.height = `${height}px`;
            overlayDiv.appendChild(svgElement);
        }

        // Setup the context object
        const context: HeatmapTrackContext = {
            scene: pixiContainer,
            id: 'test',
            dataFetcher,
            animate: () => {},
            onValueScaleChanged: () => {},
            handleTilesetInfoReceived: (tilesetInfo: any) => {},
            onTrackOptionsChanged: () => {},
            pubSub: fakePubSub,
            isValueScaleLocked: () => false,
            svgElement: svgElement
        };

        super(context, options);
        this.xDomain = xDomain;
        this.yDomain = yDomain;
        this.d3ZoomTransform = new ZoomTransform(1, 0, 0);
        this.domOverlay = overlayDiv;

        // Now we need to initialize all of the properties that would normally be set by HiGlassComponent
        this.setDimensions([width, height]);
        this.setPosition([0, 0]);
        // Create some scales which span the whole genome
        const refXScale = scaleLinear().domain(xDomain.value).range([0, width]);
        const refYScale = scaleLinear().domain(yDomain.value).range([0, height]);
        // Set the scales
        this.zoomed(refXScale, refYScale, 1, 0, 0);
        this.refScalesChanged(refXScale, refYScale);

        // Attach zoom behavior to the canvas.
        const zoomBehavior = zoom<HTMLElement, unknown>()
            .wheelDelta(zoomWheelBehavior)
            .on('zoom', this.handleZoom.bind(this));
        select<HTMLElement, unknown>(overlayDiv).call(zoomBehavior);

        effect(() => {
            const newXScale = scaleLinear().domain(this.xDomain.value).range([0, width]);
            const newYScale = scaleLinear().domain(this.yDomain.value).range([0, height]);
            this.zoomed(newXScale, newYScale, this.d3ZoomTransform.k, this.d3ZoomTransform.x, this.d3ZoomTransform.y);
        });
    }

    /**
     * This function is called when the user zooms in or out.
     */
    handleZoom(event: D3ZoomEvent<HTMLElement, unknown>): void {
        const transform = event.transform;
        this.d3ZoomTransform = transform;
        this.xDomain.value = transform.rescaleX(this._refXScale).domain() as [number, number];
        this.yDomain.value = transform.rescaleY(this._refYScale).domain() as [number, number];
    }

    addInteractor(interactor: (plot: HeatmapTrack) => void) {
        interactor(this);
        return this; // For chaining
    }
}
