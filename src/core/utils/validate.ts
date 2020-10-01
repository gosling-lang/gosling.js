import { IsChannelDeep, ChannelDeep, ChannelTypes, Track } from '../../core/gemini.schema';
import { resolveSuperposedTracks } from './superpose';

export function validateTrack(track: Track) {
    let valid = true;
    const errorMessages: string[] = [];

    const resolvedTrack = resolveSuperposedTracks(track);

    resolvedTrack.forEach(spec => {
        // Validate with json schema
        // ...

        // Additionally, validate the schema with the aspects that cannot be validated by the json schema
        if (!getGenomicChannelFromTrack(spec)) {
            errorMessages.push('genomic type is not encoded to either a x- or y- axis');
            valid = false;
        }
        const color = spec.color;
        if (IsChannelDeep(color) && color.type === 'genomic') {
            errorMessages.push('genomic type cannot be used for a color channel');
            valid = false;
        }
        const row = spec.row;
        if (IsChannelDeep(row) && row.type !== 'nominal') {
            errorMessages.push(`${row.type} type cannot be used for a row channel`);
            valid = false;
        }

        // combination of visual mark and channel
        if (spec.mark === 'line' && IsChannelDeep(color) && color.type === 'quantitative') {
            errorMessages.push('`line` mark cannot be used with `quantitative` value');
            valid = false;
        }

        /**
         * Linking
         */
        // are the linking used for same visual channels (do not work betwee `x` and `size`)
    });

    return { valid, errorMessages };
}

/**
 * Find an axis channel that is encoded with genomic coordinate.
 * `undefined` if not found.
 */
export function getGenomicChannelFromTrack(track: Track): ChannelDeep | undefined {
    // we do not support using two genomic coordinates yet
    let genomicChannel: ChannelDeep | undefined = undefined;
    ['x', 'y', 'xe', 'ye', 'x1', 'y1', 'x1e', 'y1e'].reverse().forEach(channelType => {
        const channel = track[channelType as keyof typeof ChannelTypes];
        if (IsChannelDeep(channel) && channel.type === 'genomic') {
            genomicChannel = channel;
        }
    });
    return genomicChannel;
}

/**
 * Find an axis channel that is encoded with genomic coordinate and return 'x' or 'y'.
 * `undefined` if not found.
 */
export function getGenomicChannelKeyFromTrack(
    track: Track
): 'x' | 'xe' | 'y' | 'ye' | 'x1' | 'y1' | 'x1e' | 'y1e' | undefined {
    // we do not support using two genomic coordinates yet
    let genomicChannelKey: string | undefined = undefined;
    ['x', 'xe', 'y', 'ye', 'x1', 'y1', 'x1e', 'y1e'].reverse().forEach(channelKey => {
        const channel = track[channelKey as keyof typeof ChannelTypes];
        if (IsChannelDeep(channel) && channel.type === 'genomic') {
            genomicChannelKey = channelKey;
        }
    });
    return genomicChannelKey;
}
