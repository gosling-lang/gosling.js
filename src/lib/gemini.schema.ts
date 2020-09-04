// Refer to the following url for dealing with defaults:
// https://github.com/vega/vega-lite/blob/23fe2b9c6a82551f321ccab751370ca48ae002c9/src/channeldef.ts#L961

import { GLYPH_LOCAL_PRESET_TYPE, GLYPH_HIGLASS_PRESET_TYPE } from './test/gemini/glyph';
import * as d3 from 'd3';
import { isArray } from 'lodash';

export interface GeminiSpec {
    references?: string[];
    description?: string;
    layout?: Layout;
    tracks: Track[];
}

export interface Layout {
    type: 'linear' | 'circular';
    direction: 'vertical' | 'horizontal';
    wrap?: number;
}

/**
 * Tracks
 */
export interface DataDeep {
    url: string;
    type: 'tileset' | 'csv';
    quantitativeFields?: string[];
}

export type DataMetadata = MultivecMetadata | GeneAnnotationMetadata; // ...

export interface MultivecMetadata {
    type: 'higlass-multivec';
    column: string;
    row: string;
    value: string;
    categories?: string[];
}

export interface GeneAnnotationMetadata {
    type: 'higlass-gene-annotation';
    chromosome: number;
    geneName: number;
    geneStart: number;
    geneEnd: number;
    strand: number;
    exonName: number;
    exonStarts: number;
    exonEnds: number;
}

export interface DataTransform {
    filter: { field: string; oneOf: string[] | number[]; not: boolean }[];
}

export type Track = SingleTrack | SuperposedTrack;

export type SingleTrack = BasicSingleTrack | CustomChannel;

// TODO: how to exclude keys defined in the `BasicSingleTrack`?
export type CustomChannel = {
    [k: string]: Channel;
} & {
    [k in CHANNEL_KEYS]?: never;
};

export interface BasicSingleTrack {
    description?: string;
    // primitives
    data: DataDeep | Datum[];
    metadata?: DataMetadata; // we could remove this and get this information from the server
    mark: Mark;
    // data transform
    dataTransform?: DataTransform;
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
    background?: ChannelValue;
    // styles
    width?: number;
    height?: number;
    style?: TrackStyle;
}

/**
 * Superposing multiple tracks.
 */
export type SuperposedTrack = Partial<SingleTrack> & {
    superpose: Partial<SingleTrack>[];
};

export interface TrackStyle {
    dashed?: [number, number];
    linePattern?: { type: 'triangle-l' | 'triangle-r'; size: number };
    curve?: 'top' | 'bottom' | 'left' | 'right';
    //
    background?: string; // deprecated
    stroke?: string; // deprecated
    strokeWidth?: number; // deprecated
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

export const enum CHANNEL_KEYS {
    x = 'x',
    y = 'y',
    xe = 'xe',
    ye = 'ye',
    // = '//',
    x1 = 'x1',
    y1 = 'y1',
    x1e = 'x1e',
    y1e = 'y1e',
    // = '//',
    color = 'color',
    row = 'row',
    opacity = 'opacity',
    stroke = 'stroke',
    strokeWidth = 'strokeWidth',
    size = 'size',
    text = 'text',
    w = 'w',
    background = 'background'
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
    w: 'w',
    background: 'background'
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
    | 'triangle-d'
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
    background?: ChannelBind | ChannelValue | 'none';
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
 * Type guards
 */

// TODO: these are not neccessary. Resolve the issue with `Channel`.
export function IsDataMetadata(_: DataMetadata | ChannelDeep | ChannelValue | undefined): _ is DataMetadata {
    return (
        typeof _ === 'object' && 'type' in _ && (_.type === 'higlass-multivec' || _.type === 'higlass-gene-annotation')
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

// TODO: if superposed track, merge specs to remove `superpose`, and deal with the array of tracks.
export function IsHiGlassTrack(track?: Track) {
    return track !== undefined; // do not mean any
    /*(
            IsSingleTrack(track) &&
            (
                (typeof track.mark === 'object' && IsGlyphMark(track.mark) && track.mark.type !== 'compositeMark') ||
                (IsDataDeep(track.data) && validTilesetUrl(track.data.url))
            ) ||
            IsSuperposedTrack(track) &&
            (
                track.superpose.filter(t =>
                    !(typeof t.mark === 'object' && IsGlyphMark(t.mark) && t.mark.type !== 'compositeMark')
                ).length === 0 ||
                track.superpose.filter(t =>
                    !(t.data !== undefined && IsDataDeep(t.data) && validTilesetUrl(t.data.url))
                ).length === 0
            )
        );*/
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
