import * as d3 from 'd3';
import uuid from 'uuid';
import { valueToRadian } from '../core/utils/polar';

type CircularBrushData = {
    type: 'brush' | 'resizer-1' | 'resizer-2';
    startAngle: number;
    endAngle: number;
    class: string;
    cursor: string;
};

function BrushTrack(HGC: any, ...args: any[]): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    class BrushTrackClass extends HGC.tracks.SVGTrack {
        public circularBrushData: CircularBrushData[];

        constructor(params: any[]) {
            super(...params); // context, options

            const [context, options] = params;
            const { registerViewportChanged, removeViewportChanged, setDomainsCallback } = context;

            this.uid = uuid.v1();
            this.options = options;

            // Is there actually a linked _from_ view? Or is this projection "independent"?
            this.hasFromView = !context.projectionXDomain;

            this.removeViewportChanged = removeViewportChanged;
            this.setDomainsCallback = setDomainsCallback;

            this.viewportXDomain = this.hasFromView ? null : context.projectionXDomain;
            this.viewportYDomain = this.hasFromView ? null : [0, 0];

            // this.brush = HGC.libraries.d3Brush.brushX().on('brush', this.brushed.bind(this));

            // this.gBrush = this.gMain.append('g').attr('id', `brush-${this.uid}`).call(this.brush);

            // turn off the ability to select new regions for this brush
            // this.gBrush.selectAll('.overlay').style('pointer-events', 'none');

            // turn off the ability to modify the aspect ratio of the brush
            // this.gBrush.selectAll('.handle--ne').style('pointer-events', 'none');

            // this.gBrush.selectAll('.handle--nw').style('pointer-events', 'none');

            // this.gBrush.selectAll('.handle--sw').style('pointer-events', 'none');

            // this.gBrush.selectAll('.handle--se').style('pointer-events', 'none');

            // this.gBrush.selectAll('.handle--n').style('pointer-events', 'none');

            // this.gBrush.selectAll('.handle--s').style('pointer-events', 'none');

            /* ---------------------------- */
            this.dragStart = {};
            this.GAP_ANGLE = 0.02;

            const extent = [0, Math.PI * 1.7];
            this.circularBrushData = [
                {
                    type: 'brush',
                    startAngle: extent[0] + this.GAP_ANGLE,
                    endAngle: extent[1] - this.GAP_ANGLE,
                    class: 'extent',
                    cursor: 'move'
                },
                {
                    type: 'resizer-1',
                    startAngle: extent[0],
                    endAngle: extent[0] + this.GAP_ANGLE,
                    class: 'resize e',
                    cursor: 'ew-resize'
                },
                {
                    type: 'resizer-2',
                    startAngle: extent[1] - this.GAP_ANGLE,
                    endAngle: extent[1],
                    class: 'resize w',
                    cursor: 'ew-resize'
                }
            ];
            const outerRadius = 200;
            const innerRadius = 150;

            const drag = HGC.libraries.d3Drag
                .drag()
                .on('start', () => {
                    this.dragStart = HGC.libraries.d3Selection.event.sourceEvent;
                    this.dragStartAngle = {
                        startAngle: this.circularBrushData[0].startAngle - this.GAP_ANGLE,
                        endAngle: this.circularBrushData[0].endAngle + this.GAP_ANGLE
                    };
                })
                .on('drag', (d: CircularBrushData) => {
                    const event = HGC.libraries.d3Selection.event.sourceEvent;

                    const [w, h] = this.dimensions;
                    const from = Math.atan2(this.dragStart.layerY - h / 2.0, this.dragStart.layerX - w / 2.0);
                    const to = Math.atan2(event.layerY - h / 2.0, event.layerX - w / 2.0);
                    const diffAngle = to - from;
                    // console.log(diffAngle);

                    let startAngle = this.dragStartAngle.startAngle;
                    let endAngle = this.dragStartAngle.endAngle;

                    if (d.type === 'brush') {
                        // diffAngle = Math.min(diffAngle, )
                        startAngle = this.dragStartAngle.startAngle + diffAngle;
                        endAngle = this.dragStartAngle.endAngle + diffAngle;
                    } else if (d.type === 'resizer-1') {
                        startAngle = this.dragStartAngle.startAngle + diffAngle;
                        endAngle = this.dragStartAngle.endAngle;

                        if (startAngle < 0) startAngle += Math.PI * 2;

                        startAngle = Math.max(0 + 0.04 /* TODO */, Math.min(startAngle, endAngle));
                    } else if (d.type === 'resizer-2') {
                        startAngle = this.dragStartAngle.startAngle;
                        endAngle = this.dragStartAngle.endAngle + diffAngle;

                        if (endAngle > Math.PI * 2) endAngle -= Math.PI * 2;

                        endAngle = Math.min(Math.PI * 2 - 0.04 /* TODO */, Math.max(endAngle, startAngle));
                    }

                    if (startAngle > Math.PI * 2 || endAngle > Math.PI * 2) {
                        startAngle -= Math.PI * 2;
                        endAngle -= Math.PI * 2;
                    } else if (startAngle < 0 || endAngle < 0) {
                        startAngle += Math.PI * 2;
                        endAngle += Math.PI * 2;
                    }

                    this.circularBrushData = [
                        {
                            type: 'brush',
                            startAngle: startAngle + this.GAP_ANGLE,
                            endAngle: endAngle - this.GAP_ANGLE,
                            class: 'extent',
                            cursor: 'move'
                        },
                        {
                            type: 'resizer-1',
                            startAngle: startAngle,
                            endAngle: startAngle + this.GAP_ANGLE,
                            class: 'resize e',
                            cursor: 'ew-resize'
                        },
                        {
                            type: 'resizer-2',
                            startAngle: endAngle - this.GAP_ANGLE,
                            endAngle: endAngle,
                            class: 'resize w',
                            cursor: 'ew-resize'
                        }
                    ];

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

                    // console.log('xDomain:', xDomain);
                    // console.log('yDomain:', yDomain);

                    this.setDomainsCallback(xDomain, yDomain);

                    this.gBrushC.data(this.circularBrushData).attr('d', this.brushC);
                });

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
                .call(drag);
            /* ---------------------------- */

            registerViewportChanged(this.uid, this.viewportChanged.bind(this));

            // the viewport will call this.viewportChanged immediately upon hearing registerViewportChanged
            this.draw();
        }

        brushed() {
            // console.log('brushed()');
            /**
             * Should only be called  on active brushing, not in response to the
             * draw event
             */
            const s = HGC.libraries.d3Selection.event.selection;

            if (!this._xScale || !this._yScale) {
                return;
            }

            const xDomain = [this._xScale.invert(s[0]), this._xScale.invert(s[1])];

            const yDomain = this.viewportYDomain;

            if (!this.hasFromView) {
                this.viewportXDomain = xDomain;
            }

            // console.log('xDomain:', xDomain);
            // console.log('yDomain:', yDomain);

            this.setDomainsCallback(xDomain, yDomain);
        }

        viewportChanged(viewportXScale: any, viewportYScale: any) {
            // console.log('viewport changed:', viewportXScale.domain());
            const viewportXDomain = viewportXScale.domain();
            const viewportYDomain = viewportYScale.domain();

            this.viewportXDomain = viewportXDomain;
            this.viewportYDomain = viewportYDomain;

            this.draw();
        }

        remove() {
            // console.log('remove()');
            // remove the event handler that updates this viewport tracker
            this.removeViewportChanged(this.uid);

            super.remove();
        }

        rerender() {
            // console.log('rerender()');
            // set the fill and stroke colors
            // this.gBrush
            //     .selectAll('.selection')
            //     .attr('fill', this.options.projectionFillColor)
            //     .attr('stroke', this.options.projectionStrokeColor)
            //     .attr('fill-opacity', this.options.projectionFillOpacity)
            //     .attr('stroke-opacity', this.options.projectionStrokeOpacity)
            //     .attr('stroke-width', this.options.strokeWidth);
            // this.gBrushC
            //     .selectAll('g .brushC')
            //         .attr('fill', this.options.projectionFillColor)
            //         .attr('stroke', this.options.projectionStrokeColor)
            //         .attr('fill-opacity', this.options.projectionFillOpacity)
            //         .attr('stroke-opacity', this.options.projectionStrokeOpacity)
            //         .attr('stroke-width', this.options.strokeWidth);
        }

        draw() {
            // console.log('draw()');
            if (!this._xScale || !this.yScale) {
                return;
            }

            if (!this.viewportXDomain || !this.viewportYDomain) {
                return;
            }

            const x0 = this._xScale(this.viewportXDomain[0]);
            const x1 = this._xScale(this.viewportXDomain[1]);

            // const dest = [x0, x1];

            const [w] = this.dimensions;
            const endAngle = valueToRadian(x0, w, 0, 360) + Math.PI / 2.0;
            const startAngle = valueToRadian(x1, w, 0, 360) + Math.PI / 2.0;
            this.circularBrushData = [
                {
                    type: 'brush',
                    startAngle: startAngle + this.GAP_ANGLE,
                    endAngle: endAngle - this.GAP_ANGLE,
                    class: 'extent',
                    cursor: 'move'
                },
                {
                    type: 'resizer-1',
                    startAngle: startAngle,
                    endAngle: startAngle + this.GAP_ANGLE,
                    class: 'resize e',
                    cursor: 'ew-resize'
                },
                {
                    type: 'resizer-2',
                    startAngle: endAngle - this.GAP_ANGLE,
                    endAngle: endAngle,
                    class: 'resize w',
                    cursor: 'ew-resize'
                }
            ];

            this.gBrushC.data(this.circularBrushData).attr('d', this.brushC);
            // console.log('dest:', dest[0], dest[1]);

            // user hasn't actively brushed so we don't want to emit a
            // 'brushed' event
            // this.brush.on('brush', null);
            // this.gBrush.call(this.brush.move, dest);
            // this.brush.on('brush', this.brushed.bind(this));
        }

        zoomed(newXScale: any, newYScale: any) {
            // console.log('zoomed()');
            this.xScale(newXScale);
            this.yScale(newYScale);

            this.draw();
        }

        setPosition(newPosition: any) {
            // console.log('setPosition()');
            super.setPosition(newPosition);

            this.draw();
        }

        setDimensions(newDimensions: any) {
            // console.log('setDimensions()');
            super.setDimensions(newDimensions);

            // const xRange = this._xScale.range();
            // const yRange = this._yScale.range();
            // const xDiff = xRange[1] - xRange[0];

            // this.brush.extent([
            //     [xRange[0] - xDiff, yRange[0]],
            //     [xRange[1] + xDiff, yRange[1]]
            // ]);
            // this.gBrush.call(this.brush);

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
    // !!! we are using the name of the existing track type to properly overide `registerViewportChanged` function
    // Refer to https://github.com/higlass/higlass/blob/f82c0a4f7b2ab1c145091166b0457638934b15f3/app/scripts/TrackRenderer.js#L1604
    type: 'brush-track',
    datatype: ['multivec', 'matrix', 'vector', 'csv', 'bed', 'json'],
    local: false, // TODO:
    orientation: '2d',
    thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
    availableOptions: [
        'labelPosition',
        'labelColor',
        'labelTextOpacity',
        'labelBackgroundOpacity',
        'trackBorderWidth',
        'trackBorderColor',
        'trackType',
        'scaledHeight',
        'backgroundColor',
        'barBorder',
        'sortLargestOnTop',
        'axisPositionHorizontal' // TODO: support this
    ],
    defaultOptions: {
        labelPosition: 'none',
        labelColor: 'black',
        labelTextOpacity: 0.4,
        trackBorderWidth: 0,
        trackBorderColor: 'black',
        backgroundColor: 'white',
        barBorder: false,
        sortLargestOnTop: true,
        axisPositionHorizontal: 'left',
        projectionFillColor: '#777',
        projectionStrokeColor: '#777',
        projectionFillOpacity: 0.3,
        projectionStrokeOpacity: 0.7,
        strokeWidth: 1
    }
};

export default BrushTrack;
