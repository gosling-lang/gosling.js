import { arc as d3arc, type Arc, type DefaultArcObject } from 'd3-shape';
import { type SubjectPosition, type D3DragEvent, drag as d3Drag } from 'd3-drag';
import { RADIAN_GAP, valueToRadian } from '../../core/utils/polar';
import { uuid } from '../../core/utils/uuid';
import { SVGTrack, type ViewportTrackerHorizontalContext } from '@higlass/tracks';
import { type Selection } from 'd3-selection';

type CircularBrushData = {
    type: 'brush' | 'start' | 'end';
    startAngle: number;
    endAngle: number;
    cursor: string;
};

export type BrushCircularTrackContext = ViewportTrackerHorizontalContext;

export interface BrushCircularTrackOptions {
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    axisPositionHorizontal: 'left' | 'right';
    projectionFillColor: string;
    projectionStrokeColor: string;
    projectionFillOpacity: number;
    projectionStrokeOpacity: number;
    strokeWidth: number;
}
const defaultOptions: BrushCircularTrackOptions = {
    innerRadius: 100,
    outerRadius: 200,
    startAngle: 0,
    endAngle: 360,
    axisPositionHorizontal: 'left',
    projectionFillColor: '#777',
    projectionStrokeColor: '#777',
    projectionFillOpacity: 0.3,
    projectionStrokeOpacity: 0.7,
    strokeWidth: 1
};
export class CircularBrushTrackClass extends SVGTrack<BrushCircularTrackOptions> {
    circularBrushData: CircularBrushData[];
    prevExtent: [number, number];
    uid: string;
    hasFromView: boolean;
    removeViewportChanged: (uid: string) => void;
    setDomainsCallback: (xDomain: [number, number], yDomain: [number, number]) => void;
    viewportXDomain: [number, number] | null;
    viewportYDomain: [number, number] | null;
    RR: number;
    brush: Arc<any, DefaultArcObject>;
    gBrush: Selection<SVGGElement, unknown, null, undefined>;
    startEvent: any;

    constructor(context: BrushCircularTrackContext, options: BrushCircularTrackOptions) {
        super(context, options); // context, options
        const { registerViewportChanged, removeViewportChanged, setDomainsCallback } = context;

        this.uid = uuid();
        this.options = { ...defaultOptions, ...options };

        // Is there actually a linked from view? Or is this projection "independent"?
        this.hasFromView = !context.projectionXDomain;

        this.removeViewportChanged = removeViewportChanged;
        this.setDomainsCallback = setDomainsCallback;

        this.viewportXDomain = this.hasFromView ? null : context.projectionXDomain;
        this.viewportYDomain = this.hasFromView ? null : [0, 0];

        this.prevExtent = [0, 0];
        this.RR = 0.02; // radian angle of resizers on the both sides

        const extent: [number, number] = [0, Math.PI * 1.7];
        this.circularBrushData = this.getBrushData(extent);

        this.brush = d3arc()
            .innerRadius(this.options.innerRadius ?? 100)
            .outerRadius(this.options.outerRadius ?? 200);

        this.gBrush = this.gMain
            .append('g')
            .attr('id', `brush-${this.uid}`)
            .selectAll('.brush')
            .data(this.circularBrushData)
            .enter()
            .append('path')
            .attr('class', 'brush')
            .attr('d', this.brush)
            .attr('fill', this.options.projectionFillColor)
            .attr('stroke', this.options.projectionStrokeColor)
            // Let's hide left and right resizer
            .attr('fill-opacity', (d: CircularBrushData) =>
                d.type === 'brush' ? this.options.projectionFillOpacity : 0
            )
            .attr('stroke-opacity', (d: CircularBrushData) =>
                d.type === 'brush' ? this.options.projectionStrokeOpacity : 0
            )
            .attr('stroke-width', this.options.strokeWidth)
            .style('pointer-events', 'all')
            .style('cursor', (d: CircularBrushData) => d.cursor)
            .call(this.dragged());

        // the viewport will call this.viewportChanged immediately upon hearing registerViewportChanged
        registerViewportChanged(this.uid, this.viewportChanged.bind(this));

        this.draw();
    }

    /**
     * Get information for circular brush for given extent of angle.
     */
    getBrushData(extent: [number, number]): CircularBrushData[] {
        return [
            {
                type: 'brush',
                startAngle: extent[0],
                endAngle: extent[1],
                cursor: 'grab'
            },
            {
                type: 'start',
                startAngle: extent[0],
                endAngle: extent[0] + this.RR,
                cursor: 'move'
            },
            {
                type: 'end',
                startAngle: extent[1] - this.RR,
                endAngle: extent[1],
                cursor: 'move'
            }
        ];
    }

    cropExtent(extent: [number, number]): [number, number] {
        let [s, e] = extent;

        let round = 0;
        while (s > Math.PI * 2 || e > Math.PI * 2 || s < 0 || e < 0) {
            if (round++ > 10) {
                // this shifting process should be done in a single round, so reaching here shouldn't happen.
                break;
            }

            if (s > Math.PI * 2 || e > Math.PI * 2) {
                s -= Math.PI * 2;
                e -= Math.PI * 2;
            } else if (s < 0 || e < 0) {
                s += Math.PI * 2;
                e += Math.PI * 2;
            }
        }
        return ([s, e] as number[]).sort((a, b) => a - b) as [number, number];
    }

    /**
     * Update the position and size of brush.
     */
    updateBrush(extent: [number, number]) {
        let [s, e] = extent;

        if ((s <= RADIAN_GAP && e <= RADIAN_GAP) || (s >= Math.PI * 2 - RADIAN_GAP && e >= Math.PI * 2 - RADIAN_GAP)) {
            // this means [s, e] is entirely out of the visible area, so simply hide the brush
            this.gBrush.attr('visibility', 'hidden');
            return;
        }

        // crop angles if they are out of the visible area
        if (s < RADIAN_GAP) {
            s = RADIAN_GAP;
        }
        if (s > Math.PI * 2 - RADIAN_GAP) {
            s = Math.PI * 2 - RADIAN_GAP;
        }
        if (e < RADIAN_GAP) {
            e = RADIAN_GAP;
        }
        if (e > Math.PI * 2 - RADIAN_GAP) {
            e = Math.PI * 2 - RADIAN_GAP;
        }

        this.circularBrushData = this.getBrushData(extent);
        this.gBrush.data(this.circularBrushData).attr('d', this.brush).attr('visibility', 'visible');
    }

    /**
     * Function to call upon hearing click event on the brush
     */
    dragged() {
        const start = (event: D3DragEvent<SVGElement, CircularBrushData, SubjectPosition>) => {
            this.startEvent = event.sourceEvent;
            this.prevExtent = [this.circularBrushData[0].startAngle, this.circularBrushData[0].endAngle];
        };

        const drag = (event: D3DragEvent<any, CircularBrushData, SubjectPosition>, d: CircularBrushData) => {
            const [x, y] = this.position;
            const [w, h] = this.dimensions;
            const endEvent = event.sourceEvent;

            // adjust the position
            const startX = this.startEvent.layerX - x;
            const startY = this.startEvent.layerY - y;
            const endX = endEvent.layerX - x;
            const endY = endEvent.layerY - y;

            // calculate the radian difference from the drag event
            // rotate the origin +90 degree so that it is positioned on the 12 O'clock
            const radDiff =
                // radian of the start position
                Math.atan2(startX - w / 2.0, startY - h / 2.0) -
                // radian of the current position
                Math.atan2(endX - w / 2.0, endY - h / 2.0);

            // previous extent of brush
            let [s, e] = this.prevExtent;

            if (d.type === 'brush') {
                s = s + radDiff;
                e = e + radDiff;

                if (s < RADIAN_GAP || Math.PI * 2 - RADIAN_GAP < e) {
                    // This means [s, e] contains the origin, i.e., 12 O'clock
                    const sto = RADIAN_GAP - s;
                    const eto = e - (Math.PI * 2 - RADIAN_GAP);

                    if (sto > eto) {
                        // Place the brush on the right side of the origin
                        e += sto;
                        s += sto;
                    } else {
                        // Place the brush on the left side of the origin
                        s -= eto;
                        e -= eto;
                    }
                }
            } else if (d.type === 'start') {
                s = s + radDiff;
            } else if (d.type === 'end') {
                e = e + radDiff;
            }

            [s, e] = this.cropExtent([s, e]);

            if (!this._xScale || !this._yScale) {
                return;
            }

            const scale = (this.options.endAngle - this.options.startAngle) / 360;
            const offsetedS = s - (this.options.startAngle / 360) * Math.PI * 2;
            const offsetedE = e - (this.options.startAngle / 360) * Math.PI * 2;
            const xDomain = [
                this._xScale.invert(w - (w * offsetedE) / (Math.PI * 2 * scale)),
                this._xScale.invert(w - (w * offsetedS) / (Math.PI * 2 * scale))
            ];

            const yDomain = this.viewportYDomain;

            if (!this.hasFromView) {
                this.viewportXDomain = xDomain;
            }

            this.setDomainsCallback(xDomain, yDomain);

            this.updateBrush([s, e]);
        };

        return d3Drag().on('start', start).on('drag', drag);
    }

    draw() {
        if (!this._xScale || !this.yScale) {
            return;
        }

        if (!this.viewportXDomain || !this.viewportYDomain) {
            return;
        }

        const x0 = this._xScale(this.viewportXDomain[0]);
        const x1 = this._xScale(this.viewportXDomain[1]);

        const [w] = this.dimensions;
        let e = valueToRadian(x0, w, this.options.startAngle, this.options.endAngle) + Math.PI / 2.0;
        let s = valueToRadian(x1, w, this.options.startAngle, this.options.endAngle) + Math.PI / 2.0;

        [s, e] = this.cropExtent([s, e]);

        this.updateBrush([s, e]);
    }

    viewportChanged(viewportXScale: any, viewportYScale: any) {
        const viewportXDomain = viewportXScale.domain();
        const viewportYDomain = viewportYScale.domain();

        this.viewportXDomain = viewportXDomain;
        this.viewportYDomain = viewportYDomain;

        this.draw();
    }

    remove() {
        // remove the event handler that updates this viewport tracker
        this.removeViewportChanged(this.uid);

        super.remove();
    }

    rerender() {
        // !!! TODO: when does this called?
    }

    zoomed(newXScale: any, newYScale: any) {
        this.xScale(newXScale);
        this.yScale(newYScale);

        this.draw();
    }

    setPosition(newPosition: any) {
        super.setPosition(newPosition);

        this.draw();
    }

    setDimensions(newDimensions: any) {
        super.setDimensions(newDimensions);

        // change the position
        this.gBrush.attr('transform', `translate(${newDimensions[0] / 2.0},${newDimensions[1] / 2.0})`);

        this.draw();
    }
}
