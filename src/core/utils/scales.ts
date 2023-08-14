import type { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import type { Assembly, Domain } from '@gosling-lang/gosling-schema';
import { SUPPORTED_CHANNELS } from '../mark';
import { IsDomainChr, IsDomainInterval, IsDomainChrInterval, IsChannelDeep } from '@gosling-lang/gosling-schema';
import { computeChromSizes } from './assembly';

/**
 * Get a numeric domain based on a domain specification.
 * For example, domain: { chromosome: 'chr1', interval: [1, 300,000] } => domain: [1, 300,000]
 */
export function getNumericDomain(domain: Domain, assembly?: Assembly) {
    const chromInterval = computeChromSizes(assembly).interval;
    if ('chromosome' in domain) {
        const isThereChr = Object.keys(chromInterval).find(chr => chr === domain.chromosome);
        if (!isThereChr) {
            // Did not find the chromosome, so return early.
            return;
        }
    }
    if (IsDomainChr(domain)) {
        return [chromInterval[domain.chromosome][0] + 1, chromInterval[domain.chromosome][1]];
    } else if (IsDomainInterval(domain)) {
        return domain.interval;
    } else if (IsDomainChrInterval(domain)) {
        const chrStart = chromInterval[domain.chromosome][0];
        const [start, end] = domain.interval;
        return [chrStart + start, chrStart + end];
    }
}

// TODO: IMPORTANT: when panning the tiles, the extent only becomes larger
/**
 * Use a shared scale (i.e., `domain`) across multiple gosling tracks.
 */
export function shareScaleAcrossTracks(trackModels: GoslingTrackModel[], force?: boolean) {
    // we update the spec with a global domain
    const globalDomain: { [k: string]: number[] | string[] } = {};
    const channelKeys = SUPPORTED_CHANNELS;

    // generate global domains
    trackModels.forEach(model => {
        channelKeys.forEach(channelKey => {
            const channel = model.spec()[channelKey];
            if (!IsChannelDeep(channel) || channel.domain === undefined) {
                return;
            }

            const { domain, type } = channel;

            if (type === 'quantitative') {
                const numericDomain: number[] = Array.from(domain as number[]);
                if (!globalDomain[channelKey]) {
                    globalDomain[channelKey] = numericDomain;
                } else {
                    const channelGlobalDomain = globalDomain[channelKey] as number[];

                    if (channelGlobalDomain[0] > numericDomain[0]) {
                        // min
                        channelGlobalDomain[0] = numericDomain[0];
                    }
                    if (channelGlobalDomain[1] < numericDomain[1]) {
                        // max
                        channelGlobalDomain[1] = numericDomain[1];
                    }
                }
            } else if (type === 'nominal') {
                const nominalDomain: string[] = Array.from(domain as string[]);
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
    trackModels.forEach(model => {
        channelKeys.forEach(channelKey => {
            const channel = model.spec()[channelKey];
            if (IsChannelDeep(channel) && channel.type === 'genomic') return;
            model.setChannelDomain(channelKey, globalDomain[channelKey], force);
            model.generateScales();
        });

        // update constant default values using the updated scales
        model.updateChannelValue();
    });
}
