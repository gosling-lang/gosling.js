import type * as HiGlass from '@higlass/types';

type TrackConfig<Options> = {
    type: string;
    datatype: string[];
    local: boolean;
    orientation: string;
    thumbnail: Element;
    availableOptions: (keyof Options)[];
    defaultOptions: Options;
};

type PluginTrack<Options> = {
    new (HGC: HiGlass.HGC, context: HiGlass.TrackContext<Options>, options: Options): HiGlass.Track;
    config: TrackConfig<Options>;
};

export function defineTrack<Options extends HiGlass.TrackOptions>(
    factory: (HGC: HiGlass.HGC, context: HiGlass.TrackContext<Options>, options: Options) => HiGlass.Track
) {
    const ctr = function (HGC: HiGlass.HGC, context: HiGlass.TrackContext<Options>, options: Options) {
        if (!new.target) {
            throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
        }
        return factory(HGC, context, options);
    };
    return ctr as unknown as PluginTrack<Options>;
}

export function defineConfig<Options extends HiGlass.TrackOptions>(config: TrackConfig<Options>) {
    return config;
}
