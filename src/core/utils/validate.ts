import Ajv from 'ajv';
import { ChannelDeep, ChannelTypes, Track } from '../geminid.schema';
import { IsChannelDeep } from '../geminid.schema.guards';
import { resolveSuperposedTracks } from './superpose';
import GeminidSchema from '../../../schema/geminid.schema.json';

export interface Validity {
    message: string;
    state: 'success' | 'warn' | 'error';
    details?: string;
}

export function validateGeminidSpec(spec: any): Validity {
    return validateSpec(GeminidSchema, spec);
}

/**
 *
 */
export function validateSpec(schema: any, spec: any): Validity {
    const validate = new Ajv({ extendRefs: true }).compile(schema);
    const valid = validate(spec);

    let message = '';
    let details = '';

    if (validate.errors) {
        details = JSON.stringify(validate.errors, null, 2);
        console.warn(details);

        message = '⚠️ Some properties are incorrectly used.';
    }

    return { state: valid ? 'success' : 'warn', message, details };
}

export function validateTrack(track: Track) {
    let valid = true;
    const errorMessages: string[] = [];

    const resolvedTrack = resolveSuperposedTracks(track);

    resolvedTrack.forEach(spec => {
        // Validate with json schema
        // ...

        // Additionally, validate the schema with the aspects that cannot be validated by the json schema
        if (!getGenomicChannelFromTrack(spec) && spec.mark !== 'rect-brush') {
            // as an exception, rect-brush can encode no genomic data
            errorMessages.push('genomic type is not encoded to either a x- or y- axis');
            // EXPERIMENTAL: we are removing this rule in our spec.
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
