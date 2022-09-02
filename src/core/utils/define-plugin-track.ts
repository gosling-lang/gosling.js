import type * as HiGlass from '@higlass/types';

export type PluginTrackFactory<Tile, Options> = (
    HGC: HiGlass.HGC,
    context: HiGlass.Context<Tile, Options>,
    options: Options
) => HiGlass.Track<Options>;

type AsConstructor<T> = T extends (...args: infer Args) => infer Ret ? { new (...args: Args): Ret } : never;

type PluginTrack<Tile, Options> = AsConstructor<PluginTrackFactory<Tile, Options>> & {
    config: HiGlass.TrackConfig<Options>;
};

export type TrackConfig<Options> = Omit<HiGlass.TrackConfig<Options>, 'availableOptions'>;

export function createPluginTrack<Tile, Options>(
    config: TrackConfig<Options>,
    factory: PluginTrackFactory<Tile, Options>
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
    return Track as unknown as PluginTrack<Tile, Options> & {
        config: {
            // code above ensures this field is always defined when using the plugin.
            availableOptions: (keyof Options)[];
        };
    };
}
