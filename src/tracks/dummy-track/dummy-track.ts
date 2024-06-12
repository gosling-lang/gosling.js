import { SVGTrack, type SVGTrackContext } from '@higlass/tracks';
import { type DummyTrackStyle } from '@gosling-lang/gosling-schema';

export interface DummyTrackOptions extends DummyTrackStyle {
    title: string;
    height: number;
    width: number;
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
    outline: '#fff'
};

export class DummyTrackClass extends SVGTrack<DummyTrackOptions> {
    constructor(context: SVGTrackContext, options: DummyTrackOptions) {
        super(context, options);
        // @ts-expect-error Typescript things that the default option for textFontWeight is not compatible
        this.options = { ...defaultOptions, ...options };
        // Set the width and height of the rect element so that other elements appended to gMain will be shown
        this.clipRect.attr('width', this.options.width).attr('height', this.options.height);

        this.#drawBackground();
        this.#drawText();
    }

    #drawBackground() {
        this.gMain
            .append('rect')
            .attr('fill', this.options.background)
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.options.width)
            .attr('height', this.options.height)
            .style('stroke', this.options.outline);
    }
    /**
     * Draws the title of the dummy track
     */
    #drawText() {
        this.gMain
            .append('text')
            .attr('x', this.options.width / 2)
            .attr('y', (this.options.height + this.options.textFontSize!) / 2)
            .style('text-anchor', 'middle')
            .style('font-size', `${this.options.textFontSize}px`)
            .style('font-weight', this.options.textFontWeight)
            .style('stroke', this.options.textStroke)
            .style('stroke-width', this.options.textStrokeWidth)
            .text(this.options.title);
    }
}
