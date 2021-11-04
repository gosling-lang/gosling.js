import {
    ChannelDeep,
    ChannelValue,
    DataDeep,
    Datum,
    DomainChr,
    DomainInterval,
    DomainChrInterval,
    DomainGene,
    Style,
    Track,
    SingleTrack,
    OverlaidTrack,
    ChannelTypes,
    Channel,
    FieldType,
    Domain,
    FilterTransform,
    OneOfFilter,
    RangeFilter,
    IncludeFilter,
    BEDDBData,
    MultivecData,
    VectorData,
    BIGWIGData,
    SingleView,
    FlatTracks,
    OverlaidTracks,
    StackedTracks,
    BAMData,
    Range,
    TemplateTrack,
    XMultipleFields,
    YMultipleFields
} from './gosling.schema';
import { SUPPORTED_CHANNELS } from './mark';
import { isArray } from 'lodash-es';
import {
    interpolateGreys,
    interpolateWarm,
    interpolateSpectral,
    interpolateCividis,
    interpolateBuPu,
    interpolateRdBu,
    interpolateViridis
} from 'd3-scale-chromatic';

export const PREDEFINED_COLOR_STR_MAP: { [k: string]: (t: number) => string } = {
    viridis: interpolateViridis,
    grey: interpolateGreys,
    warm: interpolateWarm,
    spectral: interpolateSpectral,
    cividis: interpolateCividis,
    bupu: interpolateBuPu,
    rdbu: interpolateRdBu
};

export function IsFlatTracks(_: SingleView): _ is FlatTracks {
    return !('alignment' in _) && !_.tracks.find(d => (d as any).alignment === 'overlay' || 'tracks' in d);
}
export function IsOverlaidTracks(_: SingleView): _ is OverlaidTracks {
    return 'alignment' in _ && _.alignment === 'overlay';
}
export function IsStackedTracks(_: SingleView): _ is StackedTracks {
    return !IsFlatTracks(_) && !IsOverlaidTracks(_);
}

export function IsDataTemplate(_: Partial<Track>): boolean {
    return !!('data' in _ && 'overrideTemplate' in _ && _.overrideTemplate);
}

export function IsDataDeep(data: DataDeep | Datum[]): data is DataDeep {
    return typeof data === 'object';
}

export function IsDomainFlat(domain: Domain): domain is string[] | number[] {
    return Array.isArray(domain);
}

export function IsDomainChr(domain: Domain): domain is DomainChr {
    return 'chromosome' in domain && !('interval' in domain);
}

export function IsDomainInterval(domain: Domain): domain is DomainInterval {
    return !('chromosome' in domain) && 'interval' in domain;
}

export function IsDomainChrInterval(domain: Domain): domain is DomainChrInterval {
    return 'chromosome' in domain && 'interval' in domain;
}

export function IsDomainGene(domain: Domain): domain is DomainGene {
    return 'gene' in domain;
}

export function IsTrackStyle(track: Style | undefined): track is Style {
    return track !== undefined;
}

export function IsSingleTrack(track: Track): track is SingleTrack {
    return !('overlay' in track);
}

export function IsOverlaidTrack(track: Partial<Track>): track is OverlaidTrack {
    return 'overlay' in track;
}

export function IsTemplateTrack(track: Partial<Track>): track is TemplateTrack {
    return 'template' in track;
}

/**
 * Is this 2D track, i.e., two genomic axes?
 */
export function Is2DTrack(track: Track) {
    return (
        IsSingleTrack(track) &&
        IsChannelDeep(track.encoding.x) &&
        track.encoding.x.type === 'genomic' &&
        IsChannelDeep(track.encoding.y) &&
        track.encoding.y.type === 'genomic'
    );
}

export function IsChannelValue(channel: ChannelDeep | ChannelValue | undefined | 'none'): channel is ChannelValue {
    return channel !== null && typeof channel === 'object' && 'value' in channel;
}

export function IsDataDeepTileset(
    _: DataDeep | undefined
): _ is BEDDBData | VectorData | MultivecData | BIGWIGData | BAMData {
    return (
        _ !== undefined &&
        (_.type === 'vector' ||
            _.type === 'beddb' ||
            _.type === 'multivec' ||
            _.type === 'bigwig' ||
            _.type === 'matrix' ||
            _.type === 'bam')
    );
}

export function IsChannelDeep(channel: ChannelDeep | ChannelValue | undefined): channel is ChannelDeep {
    return typeof channel === 'object' && !('value' in channel);
}

export function IsMultiFieldChannel(
    channel: ChannelDeep | ChannelValue | undefined
): channel is XMultipleFields | YMultipleFields {
    return typeof channel === 'object' && 'startField' in channel && 'endField' in channel;
}

export function IsOneOfFilter(_: FilterTransform): _ is OneOfFilter {
    return 'oneOf' in _;
}

export function IsRangeFilter(_: FilterTransform): _ is RangeFilter {
    return 'inRange' in _;
}

export function IsIncludeFilter(_: FilterTransform): _ is IncludeFilter {
    return 'include' in _;
}

/**
 * Check whether domain is in array shape.
 */
export function IsDomainArray(domain?: Domain): domain is string[] | number[] {
    return isArray(domain);
}

/**
 * Check whether range is in array shape.
 */
export function IsRangeArray(range?: Range): range is string[] | number[] {
    return isArray(range);
}

/**
 * Check whether visual marks are stacked on top of each other.
 */
export function IsStackedMark(track: SingleTrack): boolean {
    return (
        (track.mark === 'bar' || track.mark === 'area' || track.mark === 'text') &&
        IsChannelDeep(track.encoding.color) &&
        track.encoding.color.type === 'nominal' &&
        (!track.encoding.row || IsChannelValue(track.encoding.row)) &&
        IsChannelDeep(track.encoding.y) &&
        track.encoding.y.type === 'quantitative' &&
        !IsMultiFieldChannel(track.encoding.y)
    );
}

/**
 * Check whether visual marks in this channel are stacked on top of each other.
 * For example, `area` marks with a `quantitative` `y` channel are being stacked.
 */
export function IsStackedChannel(track: SingleTrack, channelKey: keyof typeof ChannelTypes): boolean {
    const channel = track.encoding[channelKey];
    return (
        IsStackedMark(track) &&
        // only the y channel can be stacked
        channelKey === 'y' &&
        // only quantitative channel can be stacked
        IsChannelDeep(channel) &&
        channel.type === 'quantitative'
    );
}

/**
 * Retreive value using a `channel`.
 * `undefined` if unable to retreive the value.
 */
export function getValueUsingChannel(
    datum: { [k: string]: string | number },
    channel: Channel,
    fieldKey?: 'field' | 'startField' | 'endField' | 'startField2' | 'endField2'
) {
    const field = getChannelField(channel, fieldKey);
    if (IsChannelDeep(channel) && field) {
        return datum[field];
    }
    return undefined;
}

/**
 * Get a field name from a channel. If there are multiple fields (e.g., start and end fields), get the first one
 * unless `channelKey` is defined. Return `undefined` if a channel does not have any fields specified.
 */
export function getChannelField(
    channel: Channel | undefined,
    fieldKey?: 'field' | 'startField' | 'endField' | 'startField2' | 'endField2'
): string | undefined {
    if (IsMultiFieldChannel(channel)) {
        // This means a channel is either X or Y and contains multiple fields (e.g., start and end fields).
        return channel[!fieldKey || fieldKey === 'field' ? 'startField' : fieldKey];
    } else if (channel && 'field' in channel) {
        // This means a channel contains a single field
        if (!fieldKey || fieldKey === 'field') {
            return channel.field;
        }
    }
    // Otherwise, just return `undefined`
    return undefined;
}

export function getChannelKeysByAggregateFnc(spec: SingleTrack) {
    const keys: (keyof typeof ChannelTypes)[] = [];
    SUPPORTED_CHANNELS.forEach(k => {
        const c = spec.encoding[k];
        if (IsChannelDeep(c) && 'aggregate' in c) {
            keys.push(k);
        }
    });
    return keys;
}

/**
 * Get channel keys by a field type.
 */
export function getChannelKeysByType(spec: SingleTrack, t: FieldType) {
    const keys: (keyof typeof ChannelTypes)[] = [];
    SUPPORTED_CHANNELS.forEach(k => {
        const c = spec.encoding[k];
        if (IsChannelDeep(c) && c.type === t) {
            keys.push(k);
        }
    });
    return keys;
}

export function IsXAxis(_: Track) {
    if (
        (IsSingleTrack(_) || IsOverlaidTrack(_)) &&
        IsChannelDeep(_.encoding?.x) &&
        _.encoding?.x.axis &&
        _.encoding?.x.axis !== 'none'
    ) {
        return true;
    } else if (IsOverlaidTrack(_)) {
        let isFound = false;
        _.overlay.forEach(t => {
            if (isFound) return;

            if (IsChannelDeep(t.encoding?.x) && t.encoding?.x.axis && t.encoding?.x.axis !== 'none') {
                isFound = true;
            }
        });
        return isFound;
    }
    return false;
}
