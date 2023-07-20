import { createPluginTrack, type PluginTrackFactory, type TrackConfig } from '../core/utils/define-plugin-track';

interface DummyTrackOptions {
    label: string;
}

const config: TrackConfig<DummyTrackOptions> = {
    type: 'dummy-track',
    defaultOptions: {
        label: ''
    }
};

const factory: PluginTrackFactory<never, DummyTrackOptions> = (HGC, context, options) => {
    // Services
    const { SVGTrack } = HGC.tracks;

    class DummyTrackClass extends SVGTrack<typeof options> {
        constructor() {
            super(context, options);

            this.draw();
        }

        draw() {}
    }

    return new DummyTrackClass();
};

export default createPluginTrack(config, factory);
