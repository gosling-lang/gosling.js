import { GeminiTrackModel } from '../lib/gemini-track-model';
import { IsChannelDeep } from '../lib/gemini.schema';
import { SUPPORTED_CHANNELS } from './mark';

// TODO: this could be based on the spec (e.g., shareX: [track1, track2, ...])
// TODO: we do not consider sharing `genomic` scales yet
// TODO: we consider data-driven values and not constant values yet (e.g., color: { value: 'red' })
/**
 * Use a shared scale (i.e., `domain`) across multiple gemini tracks.
 */
export function shareScaleAcrossTracks(tracks: GeminiTrackModel[]) {
    // we update the spec with a global domain
    const globalDomain: { [k: string]: number[] | string[] } = {};
    const channelKeys = SUPPORTED_CHANNELS;

    // get global domains
    tracks.forEach(track => {
        channelKeys.forEach(channelKey => {
            const channel = track.spec()[channelKey];
            if (!IsChannelDeep(channel) || typeof channel.domain === 'undefined') return;

            const { domain, type } = channel;

            if (type === 'quantitative') {
                const numericDomain: number[] = domain as number[];
                if (!globalDomain[channelKey]) {
                    globalDomain[channelKey] = numericDomain;
                } else {
                    if (globalDomain[channelKey][0] > numericDomain[0]) {
                        globalDomain[channelKey][0] = numericDomain[0];
                    }
                    if (globalDomain[channelKey][1] < numericDomain[1]) {
                        globalDomain[channelKey][1] = numericDomain[1];
                    }
                }
            } else if (type === 'nominal') {
                const nominalDomain: string[] = domain as string[];
                if (!globalDomain[channelKey]) {
                    globalDomain[channelKey] = nominalDomain;
                } else {
                    globalDomain[channelKey] = Array.from(
                        new Set([...globalDomain[channelKey], ...nominalDomain])
                    ) as string[];
                }
            }
        });
    });

    // replace the domain and update scales
    tracks.forEach(gm => {
        channelKeys.forEach(channelKey => {
            const channel = gm.spec()[channelKey];
            if (!IsChannelDeep(channel) || typeof channel.domain === 'undefined') return;

            gm.setChannelDomain(channelKey, globalDomain[channelKey]);

            gm.setChannelScalesBasedOnCompleteSpec();
        });
    });
}
