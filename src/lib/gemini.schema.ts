// Refer to the following url for dealing with defaults:
// https://github.com/vega/vega-lite/blob/23fe2b9c6a82551f321ccab751370ca48ae002c9/src/channeldef.ts#L961

import { PREDEFINED_GLYPHS_TYPE as PREDEFINED_GLYPH_TYPE } from "./test/gemini/glyph"

export interface GeminiSpec {
    tracks: (Track | GenericType<Channel>)[] // TODO: `Track` does not mean anything here because of `GenericType`
    // ...
}

export interface GenericType<T> {
    [k: string]: T
}

/**
 * Tracks
 */
export interface Track {
    // primitives
    data: string | Datum[]
    mark: Mark
    // channels
    x?: Channel
    y?: Channel
    color?: Channel
    opacity?: Channel
    x1?: Channel
    y1?: Channel
    size?: Channel
    text?: Channel
    w?: Channel
    h?: Channel
    // styles
    width?: number
    height?: number
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
    x: 'x',
    y: 'y',
    x1: 'x1',
    y1: 'y1',
    color: 'color',
    opacity: 'opacity',
    size: 'size',
    text: 'text',
    w: 'w'
} as const;

export type ChannelType = keyof typeof ChannelTypes | string

export type Channel = ChannelDeep | ChannelValue

export interface ChannelDeep {
    field: string
    type: "nominal" | "quantitative"
    aggregate?: Aggregate
    domain?: string[]
    range?: string[]
}

export interface ChannelValue {
    value: number | string
}

export type Aggregate = "max" | "min" | "mean"

/**
 * Mark
 */
export type Mark = MarkType | MarkDeep

export type MarkType =
    | "bar"
    | "point"
    | "line"
    | "rect"
    | "text"
    | "rule"
    | "triangle-l"
    | "triangle-r"

/**
 * Glyph
 */
export type MarkDeep = MarkGlyphPredefined | MarkGlyph

export interface MarkGlyphPredefined {
    type: PREDEFINED_GLYPH_TYPE
    server: string // TODO: Support this.
}

export interface MarkGlyph {
    type: "glyph"
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
    // chennels
    x?: ChannelBind | ChannelValue | 'none'
    y?: ChannelBind | ChannelValue | 'none'
    x1?: ChannelBind | ChannelValue | 'none'
    y1?: ChannelBind | ChannelValue | 'none'
    color?: ChannelBind | ChannelValue | 'none'
    size?: ChannelBind | ChannelValue | 'none'
    w?: ChannelBind | ChannelValue | 'none'
    opacity?: ChannelBind | ChannelValue | 'none'
    text?: ChannelBind | ChannelValue | 'none'
    styles?: Style
}

export interface Style {
    dashed?: string
    dy?: number
    stroke?: string
    strokeWidth?: number
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
     * `true` and `false` correspond to "shared" and "independent", respectively.
     */
    // List of `uniqueName` of `view` or `track` or indexes appear in the specification.
    targets: string[] | number[]
    // Default: The first element of `targets`.
    reference?: string
    color?: "shared" | "independent" | "distinct" | true | false
    x?: "shared" | "independent" | true | false
    y?: "shared" | "independent" | true | false
    zoomScale?: "shared" | "independent" | true | false
    zoomCenter?: "shared" | "independent" | true | false
}

/**
 * Type Checks
 */
export function IsGlyphMark(mark: any): mark is MarkGlyph {
    // TODO: MarkType | MarkDeep
    return typeof mark === "object" && mark.type === "glyph";
}

export function IsChannelValue(
    channel:
        | ChannelDeep
        | ChannelValue
        | ChannelBind
        | undefined
        | 'none'
): channel is ChannelValue {
    return channel !== null && typeof channel === "object" && 'value' in channel;
}

export function IsChannelBind(
    channel:
        | ChannelDeep
        | ChannelValue
        | ChannelBind
        | undefined
        | 'none'
): channel is ChannelBind {
    return channel !== null && typeof channel === "object" && 'bind' in channel;
}

export function IsChannelDeep(channel: ChannelDeep | ChannelValue | undefined): channel is ChannelDeep {
    return typeof channel === "object" && 'field' in channel;
}