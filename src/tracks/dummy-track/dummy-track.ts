import { createPluginTrack, type PluginTrackFactory, type TrackConfig } from '../../core/utils/define-plugin-track';
import { publish } from '../../api/pubsub';
import { type DummyTrackStyle } from '@gosling-lang/gosling-schema';

interface DummyTrackOptions extends DummyTrackStyle {
    title: string;
    height: number;
    width: number;
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
        outline: '#fff'
    }
};

const factory: PluginTrackFactory<never, DummyTrackOptions> = (HGC, context, options) => {
    // Services
    const { SVGTrack } = HGC.tracks;

    class DummyTrackClass extends SVGTrack<typeof options> {
        constructor() {
            super(context, options);
            this.#drawBackground();
            this.#drawText();
            publish('onNewTrack', {
                id: context.viewUid
            });
        }

        #drawBackground() {
            this.gMain
                .append('rect')
                .attr('fill', options.background)
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', options.width)
                .attr('height', options.height)
                .style('stroke', options.outline);
        }
        /**
         * Draws the title of the dummy track
         */
        #drawText() {
            this.gMain
                .append('text')
                .attr('x', options.width / 2)
                .attr('y', (options.height + options.textFontSize!) / 2)
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
