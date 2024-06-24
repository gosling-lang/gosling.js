import { HeatmapTiledPixiTrack } from '@higlass/tracks';
import type { TiledPixiTrackContext, TiledPixiTrackOptions } from '@higlass/tracks';
import * as PIXI from 'pixi.js';
import { fakePubSub } from '@higlass/utils';
import { scaleLinear } from 'd3-scale';

import { type D3ZoomEvent, zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import { zoomWheelBehavior } from '../utils';

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
    constructor(pixiContainer: PIXI.Container, overlayDiv: HTMLElement, options: HeatmapTrackOptions) {
        const height = overlayDiv.clientHeight;
        const width = overlayDiv.clientWidth;
        // The colorbar svg element isn't quite working yet
        const colorbarDiv = document.createElement('svg');
        overlayDiv.appendChild(colorbarDiv);

        // Setup the context object
        const context: HeatmapTrackContext = {
            scene: pixiContainer,
            id: 'test',
            dataConfig: {
                server: 'http://higlass.io/api/v1',
                tilesetUid: 'CQMd6V_cRw6iCI_-Unl3PQ'
                // coordSystem: "hg19",
            },
            animate: () => {},
            onValueScaleChanged: () => {},
            handleTilesetInfoReceived: (tilesetInfo: any) => {},
            onTrackOptionsChanged: () => {},
            pubSub: fakePubSub,
            isValueScaleLocked: () => false,
            svgElement: colorbarDiv
        };

        super(context, options);

        // Now we need to initialize all of the properties that would normally be set by HiGlassComponent
        this.setDimensions([width, height]);
        this.setPosition([0, 0]);
        // Create some scales which span the whole genome
        const refXScale = scaleLinear().domain([0, 3088269832]).range([0, width]);
        const refYScale = scaleLinear().domain([0, 3088269832]).range([0, height]);
        // Set the scales
        this.zoomed(refXScale, refYScale, 1, 0, 0);
        this.refScalesChanged(refXScale, refYScale);

        // Attach zoom behavior to the canvas.
        const zoomBehavior = zoom<HTMLElement, unknown>()
            .wheelDelta(zoomWheelBehavior)
            .on('zoom', this.handleZoom.bind(this));
        select<HTMLElement, unknown>(overlayDiv).call(zoomBehavior);
    }

    /**
     * This function is called when the user zooms in or out.
     */
    handleZoom(event: D3ZoomEvent<HTMLElement, unknown>): void {
        const transform = event.transform;
        const newXScale = transform.rescaleX(this._refXScale);
        const newYScale = transform.rescaleY(this._refYScale);
        this.zoomed(newXScale, newYScale, transform.k, transform.x + this.position[0], transform.y + this.position[1]);
    }
}
