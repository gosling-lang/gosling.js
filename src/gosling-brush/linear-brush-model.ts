import * as d3Selection from 'd3-selection';
import { drag as d3Drag } from 'd3-drag';

const HIDDEN_BRUSH_EDGE_SIZE = 3;

export type oneDimBrushData = [OneDimBrushBodyData, OneDimBrushStartEdgeData, OneDimBrushEndEdgeData];

export type OneDimBrushDataUnion = OneDimBrushBodyData | OneDimBrushStartEdgeData | OneDimBrushEndEdgeData;

export interface OneDimBrushDataCommon {
    start: number;
    end: number;
}

export interface OneDimBrushBodyData extends OneDimBrushDataCommon {
    type: 'body';
    cursor: 'grab';
}

export interface OneDimBrushStartEdgeData extends OneDimBrushDataCommon {
    type: 'start';
    cursor: 'ew-resize';
}

export interface OneDimBrushEndEdgeData extends OneDimBrushDataCommon {
    type: 'end';
    cursor: 'ew-resize';
}

export type OnBrushCallbackFn = (start: number, end: number) => void;

interface BrushStyle {
    color: string;
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    opacity: number;
}

/**
 * A model to manage 1D brush graphics and its data.
 */
export class OneDimBrushModel {
    /* graphical elements */
    private brushSelection: d3Selection.Selection<SVGRectElement, OneDimBrushDataUnion, SVGGElement, any>;
    private readonly style: BrushStyle;

    /* data */
    private range: [number, number] | null;
    private data: oneDimBrushData;

    /* drag */
    private startEvent: typeof d3Selection.event;
    private prevExtent: [number, number] | null;

    /* visual parameters */
    private offset: [number, number];
    private size: number; // fixed size of one-dimension of a brush (e.g., height)

    /* External libraries that we re-use from HiGlass */
    private externals: {
        d3Selection: typeof d3Selection;
        d3Drag: typeof d3Drag;
    };

    // TODO (May-19-2022): A way to pass only the required function (e.g., onRangeBrush) and allow
    // to use `this` (i.e., instance of GoslingTrack) in the function?
    /* gosling track */
    private track: any;

    constructor(
        selection: d3Selection.Selection<SVGGElement, unknown, HTMLElement, unknown>,
        HGC: any,
        track: any,
        style: Partial<BrushStyle> = {}
    ) {
        this.range = null;
        this.prevExtent = [0, 0];
        this.data = this.rangeToData(0, 0);

        this.offset = [0, 0];
        this.size = 0;

        this.externals = {
            d3Selection: HGC.d3Selection,
            d3Drag: HGC.d3Drag.drag
        };

        this.style = {
            color: style.color ?? '#777',
            stroke: style.stroke ?? '#777',
            strokeWidth: style.strokeWidth ?? 1,
            strokeOpacity: style.strokeOpacity ?? 0.7,
            opacity: style.opacity ?? 0.3
        };

        this.brushSelection = selection
            .selectAll('.genomic-range-brush')
            .data(this.data)
            .enter()
            .append('rect')
            .attr('class', 'genomic-range-brush')
            .call(this.onDrag());

        this.track = track;
    }

    public getRange() {
        return this.range;
    }

    public setSize(size: number) {
        this.size = size;
        return this;
    }

    /**
     * Update the left and top offsets for drawing the brush.
     */
    public setOffset(offsetX: number, offsetY: number) {
        this.offset = [offsetX, offsetY];
        return this;
    }

    /**
     * Update brush data based on the positions of two edges.
     */
    public updateRange(range: [number, number] | null) {
        if (range) {
            this.range = range.sort((a, b) => a - b) as [number, number];
            this.data = this.rangeToData(...this.range);
        } else {
            this.range = null;
        }
        return this;
    }

    /**
     * Update the brush using the internal range value. By default,
     * This function calls a render function from gosling-track.
     */
    public drawBrush(skipApiTrigger = false) {
        const [x, y] = this.offset;
        const height = this.size;
        const getWidth = (d: OneDimBrushDataUnion) => Math.abs(d.end - d.start); // the start and end can be minus values
        this.brushSelection
            .data(this.data)
            .attr('visibility', 'visible')
            .attr('transform', d => `translate(${x + d.start}, ${y + 1})`)
            .attr('width', d => `${getWidth(d)}px`)
            .attr('height', `${height - 2}px`)
            .attr('fill', this.style.color)
            .attr('stroke', this.style.stroke)
            .attr('stroke-width', `${this.style.strokeWidth}px`)
            .attr('fill-opacity', d => (d.type === 'body' ? this.style.opacity : 0))
            .attr('stroke-opacity', d => (d.type === 'body' ? this.style.strokeOpacity : 0))
            .attr('cursor', d => d.cursor);

        this.track.onRangeBrush(this.getRange(), skipApiTrigger);

        return this;
    }

    public enable() {
        this.brushSelection.attr('pointer-events', 'all');
        return this;
    }

    public disable() {
        this.brushSelection.attr('pointer-events', 'none');
        return this;
    }

    public clear() {
        this.updateRange(null).drawBrush();
        this.brushSelection.attr('visibility', 'hidden');
        this.disable();
        return this;
    }

    public remove() {
        this.brushSelection.remove();
        return this;
    }

    /**
     * Based on the extent values, generate a JSON object for the brush.
     */
    private rangeToData(start: number, end: number): oneDimBrushData {
        return [
            {
                type: 'body',
                cursor: 'grab',
                start,
                end
            },
            {
                type: 'start',
                cursor: 'ew-resize',
                start: start - HIDDEN_BRUSH_EDGE_SIZE,
                end: start
            },
            {
                type: 'end',
                cursor: 'ew-resize',
                start: end,
                end: end + HIDDEN_BRUSH_EDGE_SIZE
            }
        ];
    }

    private onDrag() {
        const started = () => {
            this.startEvent = this.externals.d3Selection.event.sourceEvent;
            this.prevExtent = this.range;
        };

        const dragged = (d: OneDimBrushDataUnion) => {
            const delta = this.externals.d3Selection.event.sourceEvent.layerX - this.startEvent.layerX;

            // previous extent of brush
            let [s, e]: [number, number] = this.prevExtent ?? [0, 0];

            if (d.type === 'body') {
                s += delta;
                e += delta;
            } else if (d.type === 'start') {
                s += delta;
            } else if (d.type === 'end') {
                e += delta;
            }

            this.updateRange([s, e]).drawBrush();
        };

        return this.externals.d3Drag<SVGRectElement, OneDimBrushDataUnion>().on('start', started).on('drag', dragged);
    }
}
