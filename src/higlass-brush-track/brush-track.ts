import { arc as d3arc } from 'd3-shape';
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
                .attr('fill-opacity', this.options.projectionFillOpacity)
                .attr('stroke-opacity', this.options.projectionStrokeOpacity)
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
                    startAngle: extent[0] + this.RR,
                    endAngle: extent[1] - this.RR,
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

            if (
                (s <= RADIAN_GAP && e <= RADIAN_GAP) ||
                (s >= Math.PI * 2 - RADIAN_GAP && e >= Math.PI * 2 - RADIAN_GAP)
            ) {
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
                // rotate the origin +90 degree so that it is positioned on the 12 O'clock
                const radDiff =
                    // radian of the start position
                    Math.atan2(this.startEvent.layerX - w / 2.0, this.startEvent.layerY - h / 2.0) -
                    // radian of the current position
                    Math.atan2(endEvent.layerX - w / 2.0, endEvent.layerY - h / 2.0);

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

                const xDomain = [
                    this._xScale.invert(w - (w * e) / Math.PI / 2),
                    this._xScale.invert(w - (w * s) / Math.PI / 2)
                ];

                const yDomain = this.viewportYDomain;

                if (!this.hasFromView) {
                    this.viewportXDomain = xDomain;
                }

                this.setDomainsCallback(xDomain, yDomain);

                this.updateBrush([s, e]);
            };

            return HGC.libraries.d3Drag.drag().on('start', start).on('drag', drag);
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
            let e = valueToRadian(x0, w, 0, 360) + Math.PI / 2.0;
            let s = valueToRadian(x1, w, 0, 360) + Math.PI / 2.0;

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

    return new BrushTrackClass(args);
}

// TODO: Change the icon
const icon =
    '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// TODO:
// default
BrushTrack.config = {
    type: 'brush-track',
    datatype: ['projection'],
    local: false, // TODO:
    projection: true,
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
