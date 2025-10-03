import { SVGTrack, type SVGTrackContext } from '@higlass/tracks';
import type { DummyTrackStyle, Layout } from '@gosling-lang/gosling-schema';

export interface DummyTrackOptions extends DummyTrackStyle {
    title: string;
    height: number;
    width: number;
    layout: Layout;
    outerRadius?: number;
    innerRadius?: number;
}

const defaultOptions = {
    height: 0, // default height gets set in when spec is preprocessed
    width: 0, // default width gets set in when spec is preprocessed
    title: '',
    background: '#fff',
    textFontSize: 12,
    textFontWeight: 'normal',
    textStroke: '#000',
    textStrokeWidth: 0.1,
    outline: '#fff',
    layout: 'linear',
    outerRadius: 0,
    innerRadius: 0
};

/**
 * Creates the arc needed for the circular dummy track
 * @param width
 * @param height
 * @param innerRadius
 * @param outerRadius
 * @returns path data which draws a circle with a certain inner and outer radius
 */
function makeArc(width: number, height: number, innerRadius: number, outerRadius: number) {
    // Calculate the start and end angles for the arc (in radians)
    const startAngle = -Math.PI / 2;
    const endAngle = -Math.PI / 2 + 2 * Math.PI - 0.000001; // In radians

    // Calculate the coordinates of the starting and ending points of the arc
    const startX = width / 2 + outerRadius * Math.cos(startAngle);
    const startY = height / 2 + outerRadius * Math.sin(startAngle);
    const endX = width / 2 + outerRadius * Math.cos(endAngle);
    const endY = height / 2 + outerRadius * Math.sin(endAngle);

    // Calculate the coordinates of the starting and ending points of the inner arc
    const innerStartX = width / 2 + innerRadius * Math.cos(startAngle);
    const innerStartY = height / 2 + innerRadius * Math.sin(startAngle);
    const innerEndX = width / 2 + innerRadius * Math.cos(endAngle);
    const innerEndY = height / 2 + innerRadius * Math.sin(endAngle);

    const pathData = [
        `M ${startX} ${startY}`,
        `A ${outerRadius} ${outerRadius} 0 1 1 ${endX} ${endY}`, // Draw outer arc
        `L ${innerEndX} ${innerEndY}`, // Draw a line to the ending point of the inner arc
        `A ${innerRadius} ${innerRadius} 0 1 0 ${innerStartX} ${innerStartY}`, // Draw inner arc
        'Z' // Close the path
    ].join(' ');

    return pathData;
}

export class DummyTrackClass extends SVGTrack<DummyTrackOptions> {
    constructor(context: SVGTrackContext, options: DummyTrackOptions) {
        super(context, options);
        // @ts-expect-error Typescript things that the default option for textFontWeight is not compatible
        this.options = { ...defaultOptions, ...options };
        console.warn(this.options);
        // Set the width and height of the rect element so that other elements appended to gMain will be shown
        this.clipRect.attr('width', this.options.width).attr('height', this.options.height);

        this.#drawBackground();
        this.#drawText();
    }

    #drawBackground() {
        if (this.options.layout === 'linear') {
            this.gMain
                .append('rect')
                .attr('fill', this.options.background)
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', this.options.width)
                .attr('height', this.options.height)
                .style('stroke', this.options.outline);
        } else {
            // We need to draw a circle with a certain inner and outer radius
            this.gMain
                .append('path')
                .attr(
                    'd',
                    makeArc(
                        this.options.width,
                        this.options.height,
                        this.options.innerRadius!,
                        this.options.outerRadius!
                    )
                )
                .attr('fill', this.options.background)
                .attr('stroke', this.options.outline)
                .attr('x', 0)
                .attr('y', 0);
        }
    }
    /**
     * Draws the title of the dummy track
     */
    #drawText() {
        // if layout is linear, put title in center, otherwise layout is circular and it can't be in center
        const height =
            this.options.layout === 'linear'
                ? (this.options.height + this.options.textFontSize!) / 2
                : this.options.height / 2 - this.options.innerRadius! - this.options.textFontSize!;
        this.gMain
            .append('text')
            .attr('x', this.options.width / 2)
            .attr('y', height)
            .style('text-anchor', 'middle')
            .style('font-size', `${this.options.textFontSize}px`)
            .style('font-weight', this.options.textFontWeight)
            .style('stroke', this.options.textStroke)
            .style('stroke-width', this.options.textStrokeWidth)
            .text(this.options.title);
    }
}
