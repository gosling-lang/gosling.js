import type * as HiGlass from '@higlass/types';
export type { TrackConfig } from '@higlass/types';

export type PluginTrackFactory<Options extends HiGlass.TrackOptions> = (
    HGC: HiGlass.HGC,
    context: HiGlass.Context<Options>,
    options: Options
) => HiGlass.Track;

type AsConstructor<T> = T extends (...args: infer Args) => infer Ret ? { new (...args: Args): Ret } : never;

type PluginTrack<Options extends HiGlass.TrackOptions> = AsConstructor<PluginTrackFactory<Options>> & {
    config: HiGlass.TrackConfig<Options>;
};

export function definePluginTrack<Options extends HiGlass.TrackOptions>(
    config: Omit<HiGlass.TrackConfig<Options>, 'availableOptions'>,
    factory: PluginTrackFactory<Options>
) {
    function Track(...args: Parameters<typeof factory>) {
        if (!new.target) {
            throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
        }
        return factory(...args);
    }
    Track.config = {
        ...config,
        availableOptions: Object.keys(config.defaultOptions ?? {})
    };
    return Track as unknown as PluginTrack<Options> & {
        config: {
            // code above ensures this field is always defined when using the plugin.
            availableOptions: (keyof Options)[];
        };
    };
}
