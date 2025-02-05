import { brushX, type D3BrushEvent } from 'd3-brush';
import { uuid } from '../../core/utils/uuid';
import { type ScaleLinear } from 'd3-scale';
import { SVGTrack, type SVGTrackContext } from '@higlass/tracks';
import type { Scale } from '@higlass/services';

export interface BrushLinearTrackContext extends SVGTrackContext {
    registerViewportChanged: (
        uid: string,
        callback: (viewportXScale: ScaleLinear<number, number>, viewportYScale: ScaleLinear<number, number>) => void
    ) => void;
    removeViewportChanged: (uid: string) => void;
    setDomainsCallback: (xDomain: [number, number], yDomain: [number, number]) => void;
    projectionXDomain: [number, number]; // The domain of the brush
}

export interface BrushLinearTrackOptions {
    projectionFillColor: string;
    projectionStrokeColor: string;
    projectionFillOpacity: number;
    projectionStrokeOpacity: number;
    strokeWidth: number;
}

export class BrushLinearTrackClass<Options> extends SVGTrack<Options> {
    uid: string;
    options: Options & BrushLinearTrackOptions;
    hasFromView: boolean;
    removeViewportChanged: (uid: string) => void;
    setDomainsCallback: (xDomain: [number, number], yDomain: [number, number]) => void;
    viewportXDomain: [number, number] | null;
    viewportYDomain: [number, number] | null;
    brush: any;
    gBrush: any;

    constructor(context: BrushLinearTrackContext, options: Options & BrushLinearTrackOptions) {
        // create a clipped SVG Path
        super(context, options);
        const { registerViewportChanged, removeViewportChanged, setDomainsCallback } = context;

        const uid = uuid();
        this.uid = uid;
        this.options = options;

        // Is there actually a linked _from_ view? Or is this projection "independent"?
        this.hasFromView = !context.projectionXDomain;

        this.removeViewportChanged = removeViewportChanged;
        this.setDomainsCallback = setDomainsCallback;

        this.viewportXDomain = this.hasFromView ? null : context.projectionXDomain;
        this.viewportYDomain = this.hasFromView ? null : [0, 0];

        this.brush = brushX().on('brush', this.brushed.bind(this));

        this.gBrush = this.gMain.append('g').attr('id', `brush-${this.uid}`).call(this.brush);

        // turn off the ability to select new regions for this brush
        this.gBrush.selectAll('.overlay').style('pointer-events', 'none');

        // turn off the ability to modify the aspect ratio of the brush
        this.gBrush.selectAll('.handle--ne').style('pointer-events', 'none');

        this.gBrush.selectAll('.handle--nw').style('pointer-events', 'none');

        this.gBrush.selectAll('.handle--sw').style('pointer-events', 'none');

        this.gBrush.selectAll('.handle--se').style('pointer-events', 'none');

        this.gBrush.selectAll('.handle--n').style('pointer-events', 'none');

        this.gBrush.selectAll('.handle--s').style('pointer-events', 'none');

        // the viewport will call this.viewportChanged immediately upon
        // hearing registerViewportChanged
        registerViewportChanged(uid, this.viewportChanged.bind(this));

        this.rerender();
        this.draw();
    }

    // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/c84a6363898b4c93b7068bf48f16bec6a2c2f60b/types/d3-brush/index.d.ts#L233
    brushed(event: D3BrushEvent<never>) {
        /**
         * Should only be called  on active brushing, not in response to the
         * draw event
         */
        const s = event.selection as [number, number];

        if (!this._xScale || !this._yScale) {
            return;
        }

        const xDomain = [this._xScale.invert(s[0]), this._xScale.invert(s[1])] as [number, number];

        const yDomain = this.viewportYDomain as [number, number];

        if (!this.hasFromView) {
            this.viewportXDomain = xDomain;
        }

        // console.log('xDomain:', xDomain);
        // console.log('yDomain:', yDomain);

        this.setDomainsCallback(xDomain, yDomain);
    }

    viewportChanged(viewportXScale: ScaleLinear<number, number>, viewportYScale: ScaleLinear<number, number>) {
        // console.log('viewport changed:', viewportXScale.domain());
        const viewportXDomain = viewportXScale.domain() as [number, number];
        const viewportYDomain = viewportYScale.domain() as [number, number];

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
        // set the fill and stroke colors
        this.gBrush
            .selectAll('.selection')
            .attr('fill', this.options.projectionFillColor)
            .attr('stroke', this.options.projectionStrokeColor)
            .attr('fill-opacity', this.options.projectionFillOpacity)
            .attr('stroke-opacity', this.options.projectionStrokeOpacity)
            .attr('stroke-width', this.options.strokeWidth);
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

        const dest = [x0, x1];

        // console.log('dest:', dest[0], dest[1]);

        // user hasn't actively brushed so we don't want to emit a
        // 'brushed' event
        this.brush.on('brush', null);
        this.gBrush.call(this.brush.move, dest);
        this.brush.on('brush', this.brushed.bind(this));
    }

    zoomed(newXScale: Scale, newYScale: Scale) {
        this.xScale(newXScale);
        this.yScale(newYScale);

        this.draw();
    }

    setPosition(newPosition: [number, number]) {
        super.setPosition(newPosition);

        this.draw();
    }

    setDimensions(newDimensions: [number, number]) {
        super.setDimensions(newDimensions);

        const xRange = this._xScale.range();
        const yRange = this._yScale.range();
        const xDiff = xRange[1] - xRange[0];

        this.brush.extent([
            [xRange[0] - xDiff, yRange[0]],
            [xRange[1] + xDiff, yRange[1]]
        ]);
        this.gBrush.call(this.brush);

        this.draw();
    }
}
