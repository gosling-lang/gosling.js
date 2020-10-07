import { GeminiTrackModel } from '../gemini-track-model';
import { Domain } from '../gemini.schema';
import { CHROMOSOME_INTERVAL_HG19 } from './chrom-size';
import { SUPPORTED_CHANNELS } from '../mark';
import {
    IsDomainChr,
    IsDomainInterval,
    IsDomainChrInterval,
    IsDomainGene,
    IsChannelDeep
} from '../gemini.schema.guards';

/**
 * Get a numeric domain based on a domain specification.
 * For example, domain: { chromosome: '1', interval: [1, 300,000] } => domain: [1, 300,000]
 */
export function getNumericDomain(domain: Domain) {
    if (IsDomainChr(domain)) {
        return CHROMOSOME_INTERVAL_HG19[`chr${domain.chromosome}`];
    } else if (IsDomainInterval(domain)) {
        return domain.interval;
    } else if (IsDomainChrInterval(domain)) {
        const chrStart = CHROMOSOME_INTERVAL_HG19[`chr${domain.chromosome}`][0];
        const [start, end] = domain.interval;
        return [chrStart + start, chrStart + end];
    } else if (IsDomainGene(domain)) {
        // TODO: Not supported yet
    }
}

// TODO: this could be based on the spec (e.g., shareX: [track1, track2, ...])
// TODO: we do not consider sharing `genomic` scales yet
// TODO: we consider data-driven values and not constant values yet (e.g., color: { value: 'red' })
// TODO: IMPORTANT: when panning the tiles, the extent only becomes larger
/**
 * Use a shared scale (i.e., `domain`) across multiple gemini tracks.
 */
export function shareScaleAcrossTracks(trackModels: GeminiTrackModel[], force?: boolean) {
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
                    if (globalDomain[channelKey][0] > numericDomain[0]) {
                        // min
                        globalDomain[channelKey][0] = numericDomain[0];
                    }
                    if (globalDomain[channelKey][1] < numericDomain[1]) {
                        // max
                        globalDomain[channelKey][1] = numericDomain[1];
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
    });
}
