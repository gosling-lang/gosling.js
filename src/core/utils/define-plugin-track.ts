import type * as HiGlass from '@higlass/types';

type TrackConfig<Options extends HiGlass.TrackOptions> = {
    type: string;
    datatype: string[];
    local: boolean;
    orientation: string;
    thumbnail: Element;
    availableOptions: string[]; // (keyof Options)[]
    defaultOptions: Options;
};

type PluginTrack<Options extends HiGlass.TrackOptions> = {
    new (HGC: HiGlass.HGC, context: HiGlass.Context<Options>, options: Options): HiGlass.Track;
    config: TrackConfig<Options>;
};

export function definePluginTrack<Options extends HiGlass.TrackOptions>(
    config: TrackConfig<Options>,
    factory: (HGC: HiGlass.HGC, context: HiGlass.Context<Options>, options: Options) => HiGlass.Track
) {
    function ctr(HGC: HiGlass.HGC, context: HiGlass.Context<Options>, options: Options) {
        if (!new.target) {
            throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
        }
        return factory(HGC, context, options);
    }
    ctr.config = config;
    return ctr as unknown as PluginTrack<Options>;
}
