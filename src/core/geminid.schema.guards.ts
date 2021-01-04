import {
    DataMetadata,
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
    MarkGlyph,
    Track,
    BasicSingleTrack,
    SuperposedTrack,
    ChannelBind,
    ChannelTypes,
    Channel,
    FieldType,
    Domain,
    Filter,
    OneOfFilter,
    RangeFilter,
    IncludeFilter,
    DataDeepTileset
} from './geminid.schema';
import { SUPPORTED_CHANNELS } from './mark';
import { isArray } from 'lodash';
import * as d3 from 'd3';

export const PREDEFINED_COLOR_STR_MAP: { [k: string]: (t: number) => string } = {
    viridis: d3.interpolateViridis,
    grey: d3.interpolateGreys,
    warm: d3.interpolateWarm,
    spectral: d3.interpolateSpectral,
    cividis: d3.interpolateCividis,
    bupu: d3.interpolateBuPu,
    rdbu: d3.interpolateRdBu
};

// TODO: these are not neccessary. Resolve the issue with `Channel`.
export function IsDataMetadata(_: DataMetadata | ChannelDeep | ChannelValue | undefined): _ is DataMetadata {
    return (
        typeof _ === 'object' &&
        'type' in _ &&
        (_.type === 'higlass-vector' || _.type === 'higlass-multivec' || _.type === 'higlass-bed')
    );
}
export function IsDataTransform(_: DataTransform | ChannelDeep | ChannelValue): _ is DataTransform {
    return 'filter' in _;
}
//

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

export function IsGlyphMark(mark: any /* TODO */): mark is MarkGlyph {
    return typeof mark === 'object' && mark.type === 'compositeMark';
}

export function IsSingleTrack(track: Track): track is BasicSingleTrack {
    return !('superpose' in track);
}

export function IsSuperposedTrack(track: Track): track is SuperposedTrack {
    return 'superpose' in track;
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

export function IsDataDeepTileset(_: DataDeep): _ is DataDeepTileset {
    return _.type === 'tileset';
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
export function IsStackedMark(track: BasicSingleTrack): boolean {
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
export function IsStackedChannel(track: BasicSingleTrack, channelKey: keyof typeof ChannelTypes): boolean {
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

export function getChannelKeysByAggregateFnc(spec: BasicSingleTrack) {
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
export function getChannelKeysByType(spec: BasicSingleTrack, t: FieldType) {
    const keys: (keyof typeof ChannelTypes)[] = [];
    SUPPORTED_CHANNELS.forEach(k => {
        const c = spec[k];
        if (IsChannelDeep(c) && c.type === t) {
            keys.push(k);
        }
    });
    return keys;
}

export type VisualizationType = 'unknown' | 'composite' | 'bar' | 'line' | 'area' | 'point' | 'rect'; // ...
export function getVisualizationType(track: BasicSingleTrack): VisualizationType {
    if (IsGlyphMark(track)) {
        return 'composite';
    } else if (track.mark === 'bar') {
        return 'bar';
    } else if (track.mark === 'line') {
        return 'line';
    } else if (track.mark === 'area') {
        return 'area';
    } else if (track.mark === 'point') {
        return 'point';
    } else if (track.mark === 'rect') {
        return 'rect';
    } else {
        return 'unknown';
    }
}
