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
    cursor: 'move';
}

export interface OneDimBrushEndEdgeData extends OneDimBrushDataCommon {
    type: 'end';
    cursor: 'move';
}

/**
 * A model to manage 1D brush graphics and its data.
 */
export class OneDimBrushModel {
    /* graphical elements */
    private brushSelection: d3Selection.Selection<SVGRectElement, OneDimBrushDataUnion, SVGGElement, any>;

    /* data */
    private range: [number, number];
    private data: oneDimBrushData;

    /* drag */
    private startEvent: typeof d3Selection.event;
    private prevExtent: [number, number];

    /* visual parameters */
    private offset: [number, number];
    private size: number; // fixed size of one-dimension of a brush (e.g., height)

    /* External libraries that we re-use from HiGlass */
    private externals: {
        d3Selection: typeof d3Selection;
        d3Drag: typeof d3Drag;
    };

    constructor(selection: d3Selection.Selection<SVGGElement, unknown, HTMLElement, unknown>, HGC: any) {
        this.range = [0, 1];
        this.prevExtent = [0, 1];
        this.data = this.rangeToData(...this.range);

        this.offset = [0, 0];
        this.size = 0;

        this.externals = {
            d3Selection: HGC.d3Selection,
            d3Drag: HGC.d3Drag.drag
        };

        this.brushSelection = selection
            .selectAll('.genomic-range-brush')
            .data(this.data)
            .enter()
            .append('rect')
            .attr('class', 'genomic-range-brush')
            .call(this.onDrag());
    }

    /* --------------------------------------------- GET/SET --------------------------------------------- */
    public getRange() {
        return this.range;
    }

    public setSize(size: number) {
        this.size = size;
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
                cursor: 'move',
                start: start - HIDDEN_BRUSH_EDGE_SIZE,
                end: start
            },
            {
                type: 'end',
                cursor: 'move',
                start: end,
                end: end + HIDDEN_BRUSH_EDGE_SIZE
            }
        ];
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
    public updateRange(value1: number, value2: number) {
        this.range = [value1, value2].sort((a, b) => a - b) as [number, number];
        this.data = this.rangeToData(...this.range);
        return this;
    }

    public drawBrush() {
        const [x, y] = this.offset;
        const height = this.size;
        const getWidth = (d: OneDimBrushDataUnion) => Math.abs(d.end - d.start); // the start and end can be minus values
        this.brushSelection
            .data(this.data)
            .attr('transform', d => `translate(${x + d.start}, ${y + 1})`)
            .attr('width', d => `${getWidth(d)}px`)
            .attr('height', `${height - 2}px`)
            .attr('fill', 'red')
            .attr('stroke', 'red')
            .attr('stroke-width', '1px')
            .attr('fill-opacity', d => (d.type === 'body' ? 0.3 : 0))
            .attr('stroke-opacity', d => (d.type === 'body' ? 1 : 0))
            .attr('cursor', d => d.cursor);
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

    onDrag() {
        const started = () => {
            this.startEvent = this.externals.d3Selection.event.sourceEvent;
            this.prevExtent = this.range;
        };

        const dragged = (d: OneDimBrushDataUnion) => {
            const delta = this.externals.d3Selection.event.sourceEvent.layerX - this.startEvent.layerX;

            // previous extent of brush
            let [s, e]: [number, number] = this.prevExtent;

            if (d.type === 'body') {
                s += delta;
                e += delta;
            } else if (d.type === 'start') {
                s += delta;
            } else if (d.type === 'end') {
                e += delta;
            }

            this.updateRange(s, e).drawBrush();
        };

        return this.externals.d3Drag<SVGRectElement, OneDimBrushDataUnion>().on('start', started).on('drag', dragged);
    }
}
