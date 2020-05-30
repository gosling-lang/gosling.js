// Refer to the following url for dealing with defaults:
// https://github.com/vega/vega-lite/blob/23fe2b9c6a82551f321ccab751370ca48ae002c9/src/channeldef.ts#L961

import { PREDEFINED_GLYPHS_TYPE as PREDEFINED_GLYPHS } from "./test/gemini/glyph";

export interface GeminiSpec {
    tracks: TrackExtended[];
    // ...
}

/**
 * Tracks
 */
type ChannelType = "x" | "y" | "color" | "x1" | "y1" | string;
export type TrackExtended = Track | AnyChannels;
export interface Datum {
    [key: string]: number | string;
}
interface Track {
    // Primitive.
    data: string | Datum[];
    mark: Mark;

    x?: ChannelFlexible;
    y?: ChannelFlexible;
    color?: ChannelFlexible;
    opacity?: ChannelFlexible;

    x1?: ChannelFlexible;
    y1?: ChannelFlexible;
    // TODO: add a reference column for glyph

    // Styles.
    width?: number;
    height?: number;
}
export interface AnyChannels {
    // Allow defining any kinds of chennels for Glyph
    [key: string]: ChannelFlexible;
}

/**
 * Marks
 */
export type Mark = PrimitiveMarkType | GlyphMarkPredefined | MarkDeep;
type PrimitiveMarkType = "bar" | "point" | "line" | "rect" | "text" | "rule" | "opacity" | SymbolMarkType;
type SymbolMarkType = "triangle-l" | "triangle-r";
type GlyphMarkType = "glyph";
export interface GlyphMarkPredefined {
    type: PREDEFINED_GLYPHS;
    server: string; // Doesn't mean anything now.
}

export type MarkDeep = {
    type: PrimitiveMarkType | GlyphMarkType;
    name: string;
    referenceColumn?: string;   // A reference column for making `glyph`.
    requiredChannels: ChannelType[];    // Channels that must be assigned.
    elements: GlyphElement[];
}

/**
 * Glyph
 */
export interface GlyphElement {
    description?: string;
    select?: { channel: ChannelType, equal: string }[];
    mark: PrimitiveMarkType | GlyphMarkDeep;

    x?: null | GlyphChannel;
    y?: null | GlyphChannel;
    x1?: null | GlyphChannel;
    y1?: null | GlyphChannel;
    color?: null | string | GlyphChannel;
    size?: null | number | GlyphChannel;
    opacity?: null | number | GlyphChannel;
}

export interface GlyphMarkDeep {
    bind: string;
    domain: string[];
    range: PrimitiveMarkType[];
}
type Aggregate = "max" | "min" | "mean";

export interface GlyphChannel {
    bind: ChannelType;
    aggregate?: Aggregate;
}
export interface AnyGlyphChannels {
    // Allow defining any kinds of chennels for binding data in Glyph
    [key: string]: GlyphChannel;
}

export type ChannelFlexible = Value | Channel;
export type Value = string | number;
export interface Channel {
    field: string;
    type: "nominal" | "quantitative";
    aggregate?: Aggregate;
}

interface Data {
    type?: string;  // TODO: What kinds of types exist?
    children?: any[];
    tiles?: Object;
    tilesetInfo?: Object;
}

/**
 * Consistency
 */
interface Consistency {
    /**
     * `true` and `false` correspond to "shared" and "independent", respectively.
     */
    // List of `uniqueName` of `view` or `track` or indexes appear in the specification.
    targets: string[] | number[];
    // Default: The first element of `targets`.
    reference?: string;
    color?: "shared" | "independent" | "distinct" | true | false;
    x?: "shared" | "independent" | true | false;
    y?: "shared" | "independent" | true | false;
    zoomScale?: "shared" | "independent" | true | false;
    zoomCenter?: "shared" | "independent" | true | false;
}