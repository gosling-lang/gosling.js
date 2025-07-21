import { HeatmapTiledPixiTrack } from '@higlass/tracks';
import type {
    OnMouseMoveZoomOptions1D,
    OnMouseMoveZoomOptions2D,
    TiledPixiTrackContext,
    TiledPixiTrackOptions
} from '@higlass/tracks';
import * as PIXI from 'pixi.js';
import { fakePubSub } from '../../core/utils/fake-pub-sub';
import { scaleLinear } from 'd3-scale';
import { DataFetcher } from '@higlass/datafetcher';
import { signal, type Signal } from '@preact/signals-core';
import type { Tile } from '@gosling-lang/gosling-track';
import type { HeatmapPlot } from '../utils';
import type { ProcessedTrack } from 'demo/track-def/types';

export type HeatmapTrackContext = TiledPixiTrackContext & {
    svgElement: SVGElement;
    onTrackOptionsChanged: () => void;
    onMouseMoveZoom?: (opts: OnMouseMoveZoomOptions1D | OnMouseMoveZoomOptions2D) => void;
    isShowGlobalMousePosition?: () => boolean; // only used when options.showMousePosition is true
    isValueScaleLocked: () => boolean;
};

export type HeatmapTrackOptions = TiledPixiTrackOptions & {
    spec: ProcessedTrack;
    mousePositionColor?: string;
    maxDomain: number;
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

export class HeatmapTrack extends HeatmapTiledPixiTrack<HeatmapTrackOptions> implements HeatmapPlot {
    /** A signal containing the genomic x-domain [start, end] */
    xDomain: Signal<[number, number]>;
    /** A signal containing the genomic y-domain [start, end] */
    yDomain: Signal<[number, number]>;
    /** The maximum domain of the data. This is needed for zoomPanHeatmap to work properly */
    maxDomain: number;
    /** The div element the zoom behavior will get attached to */
    domOverlay: HTMLElement;
    width: number;
    height: number;
    orientation: undefined;

    constructor(
        options: HeatmapTrackOptions,
        dataFetcher: DataFetcher<Tile>,
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
            viewUid: 'test',
            dataFetcher,
            animate: () => { },
            onValueScaleChanged: () => { },
            handleTilesetInfoReceived: () => { },
            onTrackOptionsChanged: () => { },
            pubSub: fakePubSub,
            isValueScaleLocked: () => false,
            svgElement: svgElement
        };

        super(context, options);
        this.xDomain = xDomain;
        this.yDomain = yDomain;
        this.domOverlay = overlayDiv;
        this.maxDomain = options.maxDomain;
        this.width = width;
        this.height = height;

        // Now we need to initialize all of the properties that would normally be set by HiGlassComponent
        this.setDimensions([this.width, this.height]);
        this.setPosition([0, 0]);
        // Create some scales which span the whole genome
        const refXScale = scaleLinear().domain(xDomain.value).range([0, this.width]);
        const refYScale = scaleLinear().domain(yDomain.value).range([0, this.height]);
        // Set the scales
        this.zoomed(refXScale, refYScale, 1, 0, 0);
        this.refScalesChanged(refXScale, refYScale);
    }

    addInteractor(interactor: (plot: HeatmapTrack) => void) {
        interactor(this);
        return this; // For chaining
    }
}
