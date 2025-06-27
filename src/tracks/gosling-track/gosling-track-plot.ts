import { GoslingTrackClass, type GoslingTrackOptions, type GoslingTrackContext } from './gosling-track';
import * as PIXI from 'pixi.js';
import { fakePubSub } from '../../../src/core/utils/fake-pub-sub';
import { scaleLinear } from 'd3-scale';
import { type Signal } from '@preact/signals-core';
import { DataFetcher } from '@higlass/datafetcher';

import { type Plot } from '../utils';
import { signal, effect } from '@preact/signals-core';
import type { Tile } from '@higlass/services';

/**
 * A wrapper around the GoslingTrackClass that allows for use with signals
 */
export class GoslingTrack extends GoslingTrackClass implements Plot {
    /** A signal containing the genomic x-domain [start, end] */
    xDomain: Signal<[number, number]>;
    /** A signal containing the genomic y-domain [start, end]. Note that this is only used when the y encoding has type "genomic" */
    yDomain: Signal<[number, number]>;
    /** The div element the zoom behavior will get attached to */
    domOverlay: HTMLElement;
    width: number;
    height: number;
    orientation: 'horizontal' | 'vertical';

    constructor(
        options: GoslingTrackOptions,
        dataFetcher: DataFetcher<Tile>,
        containers: {
            pixiContainer: PIXI.Container;
            overlayDiv: HTMLElement;
        },
        xDomain = signal<[number, number]>([0, 3088269832]),
        yDomain?: Signal<[number, number]>,
        orientation: 'horizontal' | 'vertical' = 'horizontal'
    ) {
        const { pixiContainer, overlayDiv } = containers;
        if (!overlayDiv.clientWidth) throw new Error('Container does not have width');

        // If there is already an svg element, use it. Otherwise, create a new one
        // If we do not reuse the same SVG element, we cannot have multiple brushes on the same track.
        const existingSvgElement = overlayDiv.querySelector('svg');
        const svgElement = existingSvgElement || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        if (!existingSvgElement) {
            svgElement.style.width = `${overlayDiv.clientWidth}px`;
            svgElement.style.height = `${overlayDiv.clientHeight}px`;
            overlayDiv.appendChild(svgElement);
        }

        // TODO: remove many of unused properties/methods below
        // Setup the context object
        const context: GoslingTrackContext = {
            scene: pixiContainer,
            id: 'test',
            viewUid: 'test',
            // getLockGroupExtrema: () => null,
            onMouseMoveZoom: () => {},
            // chromInfoPath: '',
            dataFetcher,
            //dataConfig: {
            // server: 'https://resgen.io/api/v1',
            // tilesetUid: 'UvVPeLHuRDiYA3qwFlm7xQ'
            // coordSystem: "hg19",
            // },
            animate: () => {},
            onValueScaleChanged: () => {},
            handleTilesetInfoReceived: () => {},
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
            const newScaleX = scaleLinear().range(this._refXScale.range()).domain(this.xDomain.value);
            const newScaleY = scaleLinear().range(this._refYScale.range()).domain(this.yDomain.value);
            this.zoomed(newScaleX, newScaleY);
        });
        this.addTooltip();
    }

    /** When the tooltip option is used, the tooltip div will be populated sample information  */
    addTooltip() {
        /** Helper function to get the position relative to the overlay div */
        function getRelativePosition(element: HTMLElement, e: MouseEvent) {
            const rect = element.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
        const tooltipDiv = document.createElement('tooltip');
        const tooltipStyles = {
            position: 'absolute',
            pointerEvents: 'none',
            backgroundColor: 'white',
            borderRadius: '5px',
            border: '1px solid #dddddd',
            boxSizing: 'border-box',
            fontSize: '10px'
        };
        Object.assign(tooltipDiv.style, tooltipStyles);
        this.domOverlay.appendChild(tooltipDiv);

        // When the mouse moves over the overlay div, update the tooltip position
        this.domOverlay.addEventListener('mousemove', (e: MouseEvent) => {
            const { x, y } = getRelativePosition(this.domOverlay, e);
            this.onMouseMove(x);
            // Update the tooltip position
            tooltipDiv.style.left = `${x}px`;
            tooltipDiv.style.top = `${y}px`;
            const tooltip = this.getMouseOverHtml(x, y);
            if (tooltip === '' || this.isRangeBrushActivated) {
                tooltipDiv.innerHTML = '';
                tooltipDiv.style.display = 'none';
            } else {
                tooltipDiv.innerHTML = tooltip;
                tooltipDiv.style.display = 'block';
            }
        });
        // When the mouse leaves the overlay div, clear the tooltip
        this.domOverlay.addEventListener('mouseleave', () => {
            this.onMouseOut();
            tooltipDiv.innerHTML = '';
        });
        // When the mouse is clicked, hide the tooltip. Likely dragging a brush
        this.domOverlay.addEventListener('mousedown', e => {
            tooltipDiv.style.display = 'none';
            const { x, y } = getRelativePosition(this.domOverlay, e);
            this.onMouseDown(x, y, e.altKey);
        });
        this.domOverlay.addEventListener('mouseup', e => {
            const { x, y } = getRelativePosition(this.domOverlay, e);
            this.onMouseUp(x, y);
        });
        this.domOverlay.addEventListener('click', e => {
            const { x, y } = getRelativePosition(this.domOverlay, e);
            this.onMouseClick(x, y);
        });
    }

    addInteractor(interactor: (plot: GoslingTrack) => void) {
        interactor(this);
        return this; // For chaining
    }
}
