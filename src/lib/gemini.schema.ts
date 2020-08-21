// Refer to the following url for dealing with defaults:
// https://github.com/vega/vega-lite/blob/23fe2b9c6a82551f321ccab751370ca48ae002c9/src/channeldef.ts#L961

import { GLYPH_LOCAL_PRESET_TYPE, GLYPH_HIGLASS_PRESET_TYPE } from './test/gemini/glyph';
import { validTilesetUrl } from './utils';
import * as d3 from 'd3';

export interface GeminiSpec {
    references?: string[];
    description?: string;
    layout?: Layout;
    tracks: (Track | GenericType<Channel> | EmptyTrack)[]; // TODO: `Track` does not mean anything here because of `GenericType`
}

export interface Layout {
    type: 'linear' | 'circular';
    direction: 'vertical' | 'horizontal';
    wrap?: number;
}

export interface GenericType<T> {
    [k: string]: T;
}

/**
 * Tracks
 */
export interface DataDeep {
    url: string;
    type: 'tileset' | 'csv';
}
export interface EmptyTrack {}
export interface Track {
    // primitives
    data: DataDeep | Datum[];
    mark: Mark;
    // zoom technique
    zoomAction?: SemanticZoom;
    // coordinates
    x?: Channel;
    y?: Channel;
    xe?: Channel;
    ye?: Channel;
    // coordinates for link
    x1?: Channel;
    y1?: Channel;
    x1e?: Channel;
    y1e?: Channel;
    // separation
    row?: Channel;
    column?: Channel;
    // others
    color?: Channel;
    opacity?: Channel;
    size?: Channel;
    text?: Channel;
    w?: Channel;
    h?: Channel;
    stroke?: Channel;
    strokeWidth?: Channel;
    // styles
    width?: number;
    height?: number;
    style?: TrackStyle;
}
// export type TrackKey = keyof Track

export interface TrackStyle {
    background?: string;
    stroke?: string;
    strokeWidth?: number;
}

/**
 * Data
 */
export interface Datum {
    [k: string]: number | string;
}

/**
 * Zoom technique (How should we show visualization based on different zoom level?)
 */
export interface SemanticZoom {
    // TODO: separate this interface by type, e.g., { type: 'aggregate', aggFunction: 'max' | ... }
    type: 'auto' | 'hide' | 'aggregate' | 'filter' | 'alternative-encoding';
    zoomLevel?: number; // TODO: what meaning to contain?
    aggFunction?: 'max' | 'min' | 'mean' | 'count' | 'sum';
    importance?: string; // field name
    spec?: Partial<Track>;
}

/**
 * Channel
 */
export const ChannelTypes = {
    // coordinates
    x: 'x',
    y: 'y',
    xe: 'xe',
    ye: 'ye',
    // coordinates for link
    x1: 'x1',
    y1: 'y1',
    x1e: 'x1e',
    y1e: 'y1e',
    // others
    color: 'color',
    row: 'row',
    opacity: 'opacity',
    stroke: 'stroke',
    strokeWidth: 'strokeWidth',
    size: 'size',
    text: 'text',
    w: 'w'
} as const;

export type ChannelType = keyof typeof ChannelTypes | string;

export type Channel = ChannelDeep | ChannelValue;

export interface ChannelDeep {
    field?: string;
    type?: FieldType;
    aggregate?: Aggregate;
    domain?: Domain;
    range?: Range;
    zeroBaseline?: boolean;
    axis?: boolean;
}
export type FieldType = 'genomic' | 'nominal' | 'quantitative';

export interface ChannelValue {
    value: number | string;
}

export type Domain = string[] | number[] | DomainInterval | DomainChrInterval | DomainChr | DomainGene;
export type Range = string[] | number[] | PREDEFINED_COLORS;
export type PREDEFINED_COLORS = 'viridis';
export const PREDEFINED_COLOR_STR_MAP: { [k: string]: (t: number) => string } = {
    viridis: d3.interpolateViridis
};
export interface DomainChr {
    // For showing a certain chromosome
    chromosome: string;
}
export interface DomainChrInterval {
    // For showing a certain interval in a chromosome
    chromosome: string;
    interval: [number, number];
}
export interface DomainInterval {
    // For showing a certain interval in intire chromosomes
    interval: [number, number]; // This is consistent to HiGlass's initXDomain and initYDomain.
}
export interface DomainGene {
    // For showing genes
    // TODO: Not supported yet
    gene: string | [string, string];
}

export type Aggregate = 'max' | 'min' | 'mean';

/**
 * Mark
 */
export type Mark = MarkType | MarkDeep;

export type MarkType =
    | 'bar'
    | 'point'
    | 'line'
    | 'area'
    | 'link-between'
    | 'link-within' // uses either x and x1 or y and y1
    | 'rect'
    | 'text'
    | 'rule'
    | 'triangle-l'
    | 'triangle-r'
    | 'dummy';

/**
 * Glyph
 */
export type MarkDeep = MarkGlyphPreset | MarkGlyph | MarkWithStyle;

export interface MarkWithStyle {
    type: MarkType;
    curvature?: 'straight' | 'stepwise' | 'curved';
}

export interface MarkGlyphPreset {
    type: GLYPH_LOCAL_PRESET_TYPE | GLYPH_HIGLASS_PRESET_TYPE;
    server: string; // TODO: Not supported yet
}

export interface MarkGlyph {
    type: 'compositeMark';
    name: string;
    referenceColumn?: string; // reference column for selecting data tuples for each glyph
    requiredChannels: ChannelType[]; // channels that must be assigned // TODO: What about optional channels?
    elements: GlyphElement[];
}

export interface GlyphElement {
    // primitives
    description?: string;
    select?: { channel: ChannelType; oneOf: string[] }[];
    mark: MarkType | MarkBind;
    // coordinates
    x?: ChannelBind | ChannelValue | 'none';
    y?: ChannelBind | ChannelValue | 'none';
    xe?: ChannelBind | ChannelValue | 'none';
    ye?: ChannelBind | ChannelValue | 'none';
    // coordinates for link
    x1?: ChannelBind | ChannelValue | 'none';
    y1?: ChannelBind | ChannelValue | 'none';
    x1e?: ChannelBind | ChannelValue | 'none';
    y1e?: ChannelBind | ChannelValue | 'none';
    // others
    stroke?: ChannelBind | ChannelValue | 'none';
    strokeWidth?: ChannelBind | ChannelValue | 'none';
    row?: ChannelBind | ChannelValue | 'none';
    color?: ChannelBind | ChannelValue | 'none';
    size?: ChannelBind | ChannelValue | 'none';
    w?: ChannelBind | ChannelValue | 'none';
    opacity?: ChannelBind | ChannelValue | 'none';
    text?: ChannelBind | ChannelValue | 'none';
    style?: MarkStyle;
}

export interface MarkStyle {
    dashed?: string;
    dy?: number;
    stroke?: string;
    strokeWidth?: number;
    background?: string;
}

export interface MarkBind {
    bind: string;
    domain: string[];
    range: MarkType[];
}

export interface ChannelBind {
    bind: ChannelType;
    aggregate?: Aggregate;
}

export interface AnyGlyphChannels {
    // Allow defining any kinds of chennels for binding data in Glyph
    [key: string]: ChannelBind | ChannelValue;
}

/**
 * Consistency
 */
interface Consistency {
    /**
     * `true` and `false` correspond to 'shared' and 'independent', respectively.
     */
    // List of `uniqueName` of `view` or `track` or indexes appear in the specification.
    targets: string[] | number[];
    // Default: The first element of `targets`.
    reference?: string;
    color?: 'shared' | 'independent' | 'distinct' | true | false;
    x?: 'shared' | 'independent' | true | false;
    y?: 'shared' | 'independent' | true | false;
    zoomScale?: 'shared' | 'independent' | true | false;
    zoomCenter?: 'shared' | 'independent' | true | false;
}

/**
 * Type Checks
 */
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

export function IsNotEmptyTrack(
    track: Track | GenericType<Channel> | EmptyTrack
): track is Track | GenericType<Channel> {
    return track !== {};
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

export function IsHiGlassTrack(track: Track | GenericType<Channel>) {
    return (
        (typeof track.mark === 'object' && IsGlyphMark(track.mark) && track.mark.type !== 'compositeMark') ||
        (IsDataDeep(track.data) && validTilesetUrl(track.data.url))
    );
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

export function IsChannelDeep(channel: ChannelDeep | ChannelValue | undefined): channel is ChannelDeep {
    return typeof channel === 'object' && !('value' in channel);
}

// TODO: perhaps, combine this with `isStackedChannel`
/**
 * Check whether visual marks can be stacked on top of each other.
 */
export function isStackedMark(track: Track): boolean {
    return (
        // TODO: confirm this
        (track.mark === 'bar' || track.mark === 'area') &&
        IsChannelDeep(track.color) &&
        track.color.type === 'nominal' &&
        (!track.row || IsChannelValue(track.row))
    );
}

/**
 * Check whether visual marks in this channel are stacked on top of each other.
 * For example, `area` marks with a `quantitative` `y` channel are being stacked.
 */
export function isStackedChannel(track: Track, channelKey: keyof typeof ChannelTypes): boolean {
    const channel = track[channelKey];
    return (
        isStackedMark(track) &&
        // only x or y channel can be stacked
        (channelKey === 'x' || channelKey === 'y') &&
        // only quantitative channel can be stacked
        IsChannelDeep(channel) &&
        channel.type === 'quantitative'
    );
}

/**
 * Get `range` of a certain channel.
 * `undefined` if missing.
 */
export function getChannelRangeFromTrack(
    track: Track,
    channelKey: keyof typeof ChannelTypes
): string[] | number[] | undefined {
    const channel = track[channelKey];
    if (IsChannelValue(channel) && channel.value) {
        return [channel.value] as string[] | number[];
    }
    if (IsChannelDeep(channel) && channel.range) {
        return channel.range as string[] | number[];
    }
    return undefined;
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

export type VisualizationType = 'unknown' | 'composite' | 'bar' | 'line' | 'area' | 'point' | 'rect'; // ...
export function getVisualizationType(track: Track): VisualizationType {
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
