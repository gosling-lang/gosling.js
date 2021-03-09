import {
    ChannelDeep,
    ChannelValue,
    DataTransform,
    DataDeep,
    Datum,
    DomainChr,
    DomainInterval,
    DomainChrInterval,
    DomainGene,
    TrackStyle,
    MarkType,
    MarkDeep,
    Track,
    SingleTrack,
    OverlaidTrack,
    ChannelBind,
    ChannelTypes,
    Channel,
    FieldType,
    Domain,
    Filter,
    OneOfFilter,
    RangeFilter,
    IncludeFilter,
    BEDDBData,
    MultivecData,
    VectorData,
    DataTrack,
    BIGWIGData,
    SingleView,
    FlatTracks,
    OverlaidTracks,
    StackedTracks
} from './gosling.schema';
import { SUPPORTED_CHANNELS } from './mark';
import { isArray } from 'lodash';
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

export function IsDataTransform(_: DataTransform | ChannelDeep | ChannelValue): _ is DataTransform {
    return 'filter' in _;
}

export function IsFlatTracks(_: SingleView): _ is FlatTracks {
    return !('alignment' in _) && !_.tracks.find(d => (d as any).alignment === 'overlay' || 'tracks' in d);
}
export function IsOverlaidTracks(_: SingleView): _ is OverlaidTracks {
    return 'alignment' in _ && _.alignment === 'overlay';
}
export function IsStackedTracks(_: SingleView): _ is StackedTracks {
    return !IsFlatTracks(_) && !IsOverlaidTracks(_);
}

export function IsDataTrack(_: Track): _ is DataTrack {
    // !!! Track might not contain `mark` when it is superposed one
    return !IsOverlaidTrack(_) && 'data' in _ && !('mark' in _);
}

export function IsTemplate(_: Partial<Track>): boolean {
    return !!('data' in _ && (!('mark' in _) || _.overrideTemplate) && !IsOverlaidTrack(_));
}

export function IsDataDeep(
    data:
        | DataDeep
        | Datum[]
        /* remove the two types below */
        | ChannelDeep
        | ChannelValue
): data is DataDeep {
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

export function IsTrackStyle(track: TrackStyle | undefined): track is TrackStyle {
    return track !== undefined;
}

export function IsShallowMark(mark: any /* TODO */): mark is MarkType {
    return typeof mark !== 'object';
}

export function IsMarkDeep(mark: any /* TODO */): mark is MarkDeep {
    return typeof mark === 'object';
}

export function IsSingleTrack(track: Track): track is SingleTrack {
    return !('overlay' in track);
}

export function IsOverlaidTrack(track: Partial<Track>): track is OverlaidTrack {
    return 'overlay' in track;
}

export function IsChannelValue(
    channel: ChannelDeep | ChannelValue | ChannelBind | undefined | 'none'
): channel is ChannelValue {
    return channel !== null && typeof channel === 'object' && 'value' in channel;
}

export function IsChannelBind(
    channel: ChannelDeep | ChannelValue | ChannelBind | undefined | 'none'
): channel is ChannelBind {
    return channel !== null && typeof channel === 'object' && 'bind' in channel;
}

export function IsDataDeepTileset(_: DataDeep | undefined): _ is BEDDBData | VectorData | MultivecData | BIGWIGData {
    return (
        _ !== undefined && (_.type === 'vector' || _.type === 'beddb' || _.type === 'multivec' || _.type === 'bigwig')
    );
}

export function IsChannelDeep(channel: ChannelDeep | ChannelValue | undefined): channel is ChannelDeep {
    return typeof channel === 'object' && !('value' in channel);
}

export function IsOneOfFilter(_: Filter): _ is OneOfFilter {
    return 'oneOf' in _;
}

export function IsRangeFilter(_: Filter): _ is RangeFilter {
    return 'inRange' in _;
}

export function IsIncludeFilter(_: Filter): _ is IncludeFilter {
    return 'include' in _;
}

/**
 * Check whether domain is in array shape.
 */
export function IsDomainArray(domain?: Domain): domain is string[] | number[] {
    return isArray(domain);
}

// TODO: perhaps, combine this with `isStackedChannel`
/**
 * Check whether visual marks can be stacked on top of each other.
 */
export function IsStackedMark(track: SingleTrack): boolean {
    return (
        (track.mark === 'bar' || track.mark === 'area' || track.mark === 'text') &&
        IsChannelDeep(track.color) &&
        track.color.type === 'nominal' &&
        (!track.row || IsChannelValue(track.row)) &&
        // TODO: determine whether to use stacked bar for nominal fields or not
        IsChannelDeep(track.y) &&
        track.y.type === 'quantitative'
    );
}

/**
 * Check whether visual marks in this channel are stacked on top of each other.
 * For example, `area` marks with a `quantitative` `y` channel are being stacked.
 */
export function IsStackedChannel(track: SingleTrack, channelKey: keyof typeof ChannelTypes): boolean {
    const channel = track[channelKey];
    return (
        IsStackedMark(track) &&
        // only x or y channel can be stacked
        (channelKey === 'x' || channelKey === 'y') &&
        // only quantitative channel can be stacked
        IsChannelDeep(channel) &&
        channel.type === 'quantitative'
    );
}

/**
 * Retreive value using a `channel`.
 * `undefined` if unable to retreive the value.
 */
export function getValueUsingChannel(datum: { [k: string]: string | number }, channel: Channel) {
    if (IsChannelDeep(channel) && channel.field) {
        return datum[channel.field];
    }
    return undefined;
}

export function getChannelKeysByAggregateFnc(spec: SingleTrack) {
    const keys: (keyof typeof ChannelTypes)[] = [];
    SUPPORTED_CHANNELS.forEach(k => {
        const c = spec[k];
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
        const c = spec[k];
        if (IsChannelDeep(c) && c.type === t) {
            keys.push(k);
        }
    });
    return keys;
}

export function IsXAxis(_: Track) {
    if ((IsSingleTrack(_) || IsOverlaidTrack(_)) && IsChannelDeep(_.x) && _.x.axis && _.x.axis !== 'none') {
        return true;
    } else if (IsOverlaidTrack(_)) {
        let isFound = false;
        _.overlay.forEach(t => {
            if (isFound) return;

            if (IsChannelDeep(t.x) && (t.x.axis === 'top' || t.x.axis === 'bottom')) {
                isFound = true;
            }
        });
        return isFound;
    }
    return false;
}
