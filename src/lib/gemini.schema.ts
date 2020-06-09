// Refer to the following url for dealing with defaults:
// https://github.com/vega/vega-lite/blob/23fe2b9c6a82551f321ccab751370ca48ae002c9/src/channeldef.ts#L961

import { GLYPH_LOCAL_PRESET_TYPE, GLYPH_HIGLASS_PRESET_TYPE } from './test/gemini/glyph'
import { validTilesetUrl } from './utils';

export interface GeminiSpec {
    references?: string[]
    description?: string
    layout?: {
        type: "linear" | "circular"
        direction: "vertical" | "horizontal"
        wrap?: number // TODO: does not work now
        // TODO: Currently, these two are used only for circular layout.
        width?: number
        height?: number
    }
    tracks: (Track | GenericType<Channel> | EmptyTrack)[] // TODO: `Track` does not mean anything here because of `GenericType`
}

export interface GenericType<T> {
    [k: string]: T
}

/**
 * Tracks
 */
export interface DataDeep { url: string, type: 'tileset' | 'csv' }
export interface EmptyTrack { }
export interface Track {
    // primitives
    data: DataDeep | Datum[]
    mark: Mark
    // coordinates
    x?: Channel
    y?: Channel
    xe?: Channel
    ye?: Channel
    // coordinates for link
    x1?: Channel
    y1?: Channel
    x1e?: Channel
    y1e?: Channel
    // others
    color?: Channel
    opacity?: Channel
    size?: Channel
    text?: Channel
    w?: Channel
    h?: Channel
    // styles
    width?: number
    height?: number
    style?: TrackStyle
}

export interface TrackStyle {
    background?: string
}

/**
 * Data
 */
export interface Datum {
    [k: string]: number | string
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
    opacity: 'opacity',
    size: 'size',
    text: 'text',
    w: 'w'
} as const;

export type ChannelType = keyof typeof ChannelTypes | string

export type Channel = ChannelDeep | ChannelValue

export interface ChannelDeep {
    field?: string
    type?: 'genomic' | 'nominal' | 'quantitative'
    aggregate?: Aggregate
    domain?: string[] | number[]
    range?: string[]
    axis?: boolean
}

export interface ChannelValue {
    value: number | string
}

export type Aggregate = 'max' | 'min' | 'mean'

/**
 * Mark
 */
export type Mark = MarkType | MarkDeep

export type MarkType =
    | 'bar'
    | 'point'
    | 'line'
    | 'link-between'
    | 'link-within' // uses either x and x1 or y and y1
    | 'rect'
    | 'text'
    | 'rule'
    | 'triangle-l'
    | 'triangle-r'
    | 'dummy'

/**
 * Glyph
 */
export type MarkDeep = MarkGlyphPreset | MarkGlyph | MarkWithStyle

export interface MarkWithStyle {
    type: MarkType
    curvature?: 'straight' | 'stepwise' | 'curved'
}

export interface MarkGlyphPreset {
    type: GLYPH_LOCAL_PRESET_TYPE | GLYPH_HIGLASS_PRESET_TYPE
    server: string // TODO: Support this.
}

export interface MarkGlyph {
    type: 'groupMark'
    name: string
    referenceColumn?: string // reference column for selecting data tuples for each glyph
    requiredChannels: ChannelType[] // channels that must be assigned
    elements: GlyphElement[]
}

export interface GlyphElement {
    // primitives
    description?: string
    select?: { channel: ChannelType, oneOf: string[] }[]
    mark: MarkType | MarkBind
    // coordinates
    x?: ChannelBind | ChannelValue | 'none'
    y?: ChannelBind | ChannelValue | 'none'
    xe?: ChannelBind | ChannelValue | 'none'
    ye?: ChannelBind | ChannelValue | 'none'
    // coordinates for link
    x1?: ChannelBind | ChannelValue | 'none'
    y1?: ChannelBind | ChannelValue | 'none'
    x1e?: ChannelBind | ChannelValue | 'none'
    y1e?: ChannelBind | ChannelValue | 'none'
    // others
    color?: ChannelBind | ChannelValue | 'none'
    size?: ChannelBind | ChannelValue | 'none'
    w?: ChannelBind | ChannelValue | 'none'
    opacity?: ChannelBind | ChannelValue | 'none'
    text?: ChannelBind | ChannelValue | 'none'
    style?: MarkStyle
}

export interface MarkStyle {
    dashed?: string
    dy?: number
    stroke?: string
    strokeWidth?: number
    background?: string
}

export interface MarkBind {
    bind: string
    domain: string[]
    range: MarkType[]
}

export interface ChannelBind {
    bind: ChannelType
    aggregate?: Aggregate
}

export interface AnyGlyphChannels {
    // Allow defining any kinds of chennels for binding data in Glyph
    [key: string]: ChannelBind | ChannelValue
}

/**
 * Consistency
 */
interface Consistency {
    /**
     * `true` and `false` correspond to 'shared' and 'independent', respectively.
     */
    // List of `uniqueName` of `view` or `track` or indexes appear in the specification.
    targets: string[] | number[]
    // Default: The first element of `targets`.
    reference?: string
    color?: 'shared' | 'independent' | 'distinct' | true | false
    x?: 'shared' | 'independent' | true | false
    y?: 'shared' | 'independent' | true | false
    zoomScale?: 'shared' | 'independent' | true | false
    zoomCenter?: 'shared' | 'independent' | true | false
}

/**
 * Type Checks
 */
export function IsDataDeep(data:
    | DataDeep
    | Datum[]
    /* remove the two types below */
    | ChannelDeep
    | ChannelValue
): data is DataDeep {
    return typeof data === 'object'
}

export function IsNotEmptyTrack(
    track:
        | Track
        | GenericType<Channel>
        | EmptyTrack
): track is Track | GenericType<Channel> {
    return track !== {}
}

export function IsTrackStyle(track: TrackStyle | undefined): track is TrackStyle {
    return track !== undefined
}

export function IsShallowMark(mark: any /* TODO */): mark is MarkType {
    return typeof mark !== 'object'
}

export function IsMarkDeep(mark: any /* TODO */): mark is MarkDeep {
    return typeof mark === 'object'
}

export function IsGlyphMark(mark: any /* TODO */): mark is MarkGlyph {
    return typeof mark === 'object' && mark.type === 'groupMark'
}

export function IsHiGlassTrack(track: Track | GenericType<Channel>) {
    return (
        (
            typeof track.mark === 'object' &&
            IsGlyphMark(track.mark) &&
            track.mark.type !== 'groupMark'
        ) ||
        (IsDataDeep(track.data) && validTilesetUrl(track.data.url))
    );
}

export function IsChannelValue(
    channel:
        | ChannelDeep
        | ChannelValue
        | ChannelBind
        | undefined
        | 'none'
): channel is ChannelValue {
    return channel !== null && typeof channel === 'object' && 'value' in channel;
}

export function IsChannelBind(
    channel:
        | ChannelDeep
        | ChannelValue
        | ChannelBind
        | undefined
        | 'none'
): channel is ChannelBind {
    return channel !== null && typeof channel === 'object' && 'bind' in channel;
}

export function IsChannelDeep(
    channel:
        | ChannelDeep
        | ChannelValue
        | undefined
): channel is ChannelDeep {
    return typeof channel === 'object' && !('value' in channel);
}