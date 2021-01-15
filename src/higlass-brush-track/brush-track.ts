import * as d3 from 'd3';
import uuid from 'uuid';
import { RADIAN_GAP, valueToRadian } from '../core/utils/polar';

type CircularBrushData = {
    type: 'brush' | 'start' | 'end';
    startAngle: number;
    endAngle: number;
    cursor: string;
};

function BrushTrack(HGC: any, ...args: any[]): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    class BrushTrackClass extends HGC.tracks.SVGTrack {
        public circularBrushData: CircularBrushData[];
        public prevExtent: [number, number];

        constructor(params: any[]) {
            super(...params); // context, options

            const [context, options] = params;
            const { registerViewportChanged, removeViewportChanged, setDomainsCallback } = context;

            this.uid = uuid.v1();
            this.options = options;

            // Is there actually a linked from view? Or is this projection "independent"?
            this.hasFromView = !context.projectionXDomain;

            this.removeViewportChanged = removeViewportChanged;
            this.setDomainsCallback = setDomainsCallback;

            this.viewportXDomain = this.hasFromView ? null : context.projectionXDomain;
            this.viewportYDomain = this.hasFromView ? null : [0, 0];

            /* ---------------------------- */
            const outerRadius = 200;
            const innerRadius = 150;

            this.prevExtent = [0, 0];
            this.RR = 0.02; // radian angle of resizers on the both sides

            const extent = [0, Math.PI * 1.7];
            this.circularBrushData = [
                {
                    type: 'brush',
                    startAngle: extent[0] + this.RR,
                    endAngle: extent[1] - this.RR,
                    cursor: 'move'
                },
                {
                    type: 'start',
                    startAngle: extent[0],
                    endAngle: extent[0] + this.RR,
                    cursor: 'ew-resize'
                },
                {
                    type: 'end',
                    startAngle: extent[1] - this.RR,
                    endAngle: extent[1],
                    cursor: 'ew-resize'
                }
            ];

            this.brushC = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);
            this.gBrushC = this.gMain
                .append('g')
                .attr('id', `brushC-${this.uid}`)
                .selectAll('.brushC')
                .data(this.circularBrushData)
                .enter()
                .append('path')
                .attr('class', 'brushC')
                .attr('d', this.brushC)
                .attr('fill', this.options.projectionFillColor)
                .attr('stroke', this.options.projectionStrokeColor)
                .attr('fill-opacity', this.options.projectionFillOpacity)
                .attr('stroke-opacity', this.options.projectionStrokeOpacity)
                .attr('stroke-width', this.options.strokeWidth)
                .style('pointer-events', 'all')
                .style('cursor', (d: CircularBrushData) => d.cursor)
                .call(this.dragged());
            /* ---------------------------- */

            // the viewport will call this.viewportChanged immediately upon hearing registerViewportChanged
            registerViewportChanged(this.uid, this.viewportChanged.bind(this));

            this.draw();
        }

        /**
         * Update the position and size of brush.
         */
        updateBrush(extent: [number, number]) {
            const [startAngle, endAngle] = extent;

            this.circularBrushData = [
                {
                    type: 'brush',
                    startAngle: startAngle + this.RR,
                    endAngle: endAngle - this.RR,
                    cursor: 'move'
                },
                {
                    type: 'start',
                    startAngle,
                    endAngle: startAngle + this.RR,
                    cursor: 'ew-resize'
                },
                {
                    type: 'end',
                    startAngle: endAngle - this.RR,
                    endAngle,
                    cursor: 'ew-resize'
                }
            ];
            this.gBrushC.data(this.circularBrushData).attr('d', this.brushC);
        }

        // called upon hearing click event on the brush
        dragged() {
            const start = () => {
                this.startEvent = HGC.libraries.d3Selection.event.sourceEvent;
                this.prevExtent = [
                    this.circularBrushData[0].startAngle - this.RR,
                    this.circularBrushData[0].endAngle + this.RR
                ];
            };

            const drag = (d: CircularBrushData) => {
                const [w, h] = this.dimensions;
                const endEvent = HGC.libraries.d3Selection.event.sourceEvent;

                // calculate the radian difference from the drag event
                const radDiff =
                    // radian of the current position
                    Math.atan2(endEvent.layerY - h / 2.0, endEvent.layerX - w / 2.0) -
                    // radian of the start position
                    Math.atan2(this.startEvent.layerY - h / 2.0, this.startEvent.layerX - w / 2.0);

                // previous extent of brush
                let [startAngle, endAngle] = this.prevExtent;

                if (d.type === 'brush') {
                    startAngle = startAngle + radDiff;
                    endAngle = endAngle + radDiff;
                } else if (d.type === 'start') {
                    startAngle = startAngle + radDiff;

                    if (startAngle < 0) {
                        startAngle += Math.PI * 2;
                    }

                    startAngle = Math.max(0 + RADIAN_GAP, Math.min(startAngle, endAngle));
                } else if (d.type === 'end') {
                    endAngle = endAngle + radDiff;

                    if (endAngle > Math.PI * 2) {
                        endAngle -= Math.PI * 2;
                    }

                    endAngle = Math.min(Math.PI * 2 - RADIAN_GAP, Math.max(endAngle, startAngle));
                }

                if (startAngle > Math.PI * 2 || endAngle > Math.PI * 2) {
                    startAngle -= Math.PI * 2;
                    endAngle -= Math.PI * 2;
                } else if (startAngle < 0 || endAngle < 0) {
                    startAngle += Math.PI * 2;
                    endAngle += Math.PI * 2;
                }

                if (!this._xScale || !this._yScale) {
                    return;
                }

                const xDomain = [
                    this._xScale.invert(w - (w * endAngle) / Math.PI / 2),
                    this._xScale.invert(w - (w * startAngle) / Math.PI / 2)
                ];

                const yDomain = this.viewportYDomain;

                if (!this.hasFromView) {
                    this.viewportXDomain = xDomain;
                }

                this.setDomainsCallback(xDomain, yDomain);

                this.updateBrush([startAngle, endAngle]);
            };

            return HGC.libraries.d3Drag.drag().on('start', start).on('drag', drag);
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
            const endAngle = valueToRadian(x0, w, 0, 360) + Math.PI / 2.0;
            const startAngle = valueToRadian(x1, w, 0, 360) + Math.PI / 2.0;

            this.updateBrush([startAngle, endAngle]);

            // user hasn't actively brushed so we don't want to emit a
            // 'brushed' event
            // this.brush.on('brush', null);
            // this.gBrush.call(this.brush.move, dest);
            // this.brush.on('brush', this.brushed.bind(this));
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
            this.gBrushC.attr('transform', `translate(${newDimensions[0] / 2.0},${newDimensions[1] / 2.0})`);

            this.draw();
        }
    }

    return new BrushTrackClass(args);
}

// TODO: Change the icon
const icon =
    '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// TODO:
// default
BrushTrack.config = {
    type: 'brush-track',
    datatype: ['multivec', 'matrix', 'vector', 'csv', 'bed', 'json'],
    local: false, // TODO:
    orientation: '2d',
    thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
    availableOptions: [
        'axisPositionHorizontal',
        'projectionFillColor',
        'projectionStrokeColor',
        'projectionFillOpacity',
        'projectionStrokeOpacity',
        'strokeWidth'
    ],
    defaultOptions: {
        axisPositionHorizontal: 'left',
        projectionFillColor: '#777',
        projectionStrokeColor: '#777',
        projectionFillOpacity: 0.3,
        projectionStrokeOpacity: 0.7,
        strokeWidth: 1
    }
};

export default BrushTrack;
