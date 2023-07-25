import { createPluginTrack, type PluginTrackFactory, type TrackConfig } from '../core/utils/define-plugin-track';
import { type DummyTrackStyle, type Layout } from '@gosling.schema';

interface DummyTrackOptions extends DummyTrackStyle {
    title: string;
    height: number;
    width: number;
    layout: Layout;
    outerRadius: number;
    innerRadius: number;
}

const config: TrackConfig<DummyTrackOptions> = {
    type: 'dummy-track',
    defaultOptions: {
        height: 0, // default height gets set in when spec is preprocessed
        width: 0, // default width gets set in when spec is preprocessed
        title: '',
        background: '#fff',
        textFontSize: 12,
        textFontWeight: 'normal',
        textStroke: '#000',
        textStrokeWidth: 0.1,
        layout: 'linear',
        outerRadius: 0,
        innerRadius: 0
    }
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
    const startAngle = 0;
    const endAngle = 2 * Math.PI - 0.000001; // In radians

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


const factory: PluginTrackFactory<never, DummyTrackOptions> = (HGC, context, options) => {
    // Services
    const { SVGTrack } = HGC.tracks;

    class DummyTrackClass extends SVGTrack<typeof options> {
        constructor() {
            super(context, options);
            this.#drawBackground();
            this.#drawText();
        }

        #drawBackground() {
            if (options.layout === 'linear') {
                // Background rectangle
                this.gMain
                    .append('rect')
                    .attr('fill', options.background)
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', options.width)
                    .attr('height', options.height);
            } else {
                // We need to draw a circle with a certain inner and outer radius
                this.gMain
                    .append('path')
                    .attr('d', makeArc(options.width, options.height, options.innerRadius, options.outerRadius))
                    .attr('fill', options.background)
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
                options.layout === 'linear'
                    ? (options.height + options.textFontSize!) / 2
                    : options.height / 2 - options.innerRadius - options.textFontSize!;

            this.gMain
                .append('text')
                .attr('x', options.width / 2)
                .attr('y', height)
                .style('text-anchor', 'middle')
                .style('font-size', `${options.textFontSize}px`)
                .style('font-weight', options.textFontWeight)
                .style('stroke', options.textStroke)
                .style('stroke-width', options.textStrokeWidth)
                .text(options.title);
        }
    }

    return new DummyTrackClass();
};

export default createPluginTrack(config, factory);
