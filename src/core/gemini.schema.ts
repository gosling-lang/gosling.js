import { GLYPH_LOCAL_PRESET_TYPE, GLYPH_HIGLASS_PRESET_TYPE } from '../editor/example/deprecated/index';

/**
 * Root-level specification
 */
export interface GeminiSpec {
    layout?: Layout;
    tracks: Track[];
    width?: number;
    height?: number;
    description?: string;
}

/**
 * Layout specification for multiple tracks
 */
export interface Layout {
    type: 'linear' | 'circular';
    direction: 'vertical' | 'horizontal';

    colGaps?: number[];
    rowGaps?: number[];

    colSizes?: number[];
    rowSizes?: number[];

    // !deprecated
    wrap?: number;
    gap?: number;
}

/**
 * Data specification
 */
export type DataDeep = DataDeepTileset | DataDeepGemini;

export interface Datum {
    [k: string]: number | string;
}

export interface DataDeepTileset {
    type: 'tileset';
    url: string;
}

export interface DataDeepGemini {
    type: 'csv';
    // TODO: Separate url and data
    url?: string;
    data?: Datum[];
    quantitativeFields?: string[];
    chromosomeField?: string;
    genomicFields?: string[];

    // being used for semantic zooming
    urlAlt?: string;
    quantitativeFieldsAlt?: string[];
}

export type DataMetadata = MultivecMetadata | BEDMetadata;

export interface MultivecMetadata {
    type: 'higlass-multivec';
    column: string;
    row: string;
    value: string;
    categories?: string[];
    start?: string;
    end?: string;
    bin?: number; // Binning the genomic interval in tiles (unit size: 256)
}

export interface BEDMetadata {
    type: 'higlass-bed';
    genomicFields: { index: number; name: string }[];
    valueFields?: { index: number; name: string; type: 'nominal' | 'quantitative' }[];
    // this is a somewhat arbitrary option for reading gene annotation datasets
    // should be multi-value fields (e.g., "1,2,3")
    exonIntervalFields?: [{ index: number; name: string }, { index: number; name: string }];
}

export interface DataTransform {
    filter: Filter[];
}

export type Filter = OneOfFilter | RangeFilter;

export interface RangeFilter {
    field: string;
    inRange: number[];
    not: boolean;
}

export interface OneOfFilter {
    field: string;
    oneOf: string[] | number[];
    not: boolean;
}

// TODO: Ensure to use `EmptyTrack` for the convenient
// export type Track = EmptyTrack | NonEmptyTrack;
// export type NonEmptyTrack = SingleTrack | SuperposedTrack | SuperposedTrackTwoLevels;

export type Track = SingleTrack | SuperposedTrack | SuperposedTrackTwoLevels;

export type SingleTrack = BasicSingleTrack | CustomChannel;

// TODO: how to exclude keys defined in the `BasicSingleTrack`?
export type CustomChannel = {
    [k: string]: Channel;
} & {
    [k in CHANNEL_KEYS]?: never;
};

export interface EmptyTrack {
    type: 'empty';
    width: number;
    height: number;
}

export interface BasicSingleTrack {
    title?: string;
    description?: string;
    zoomable?: boolean;

    // Layout
    width?: number;
    height?: number;
    outerRadius?: number; // circular layout
    innerRadius?: number; // circular layout
    colSpan?: number;
    rowSpan?: number;
    span?: number; // !deprecated

    // Data
    data: DataDeep | Datum[];
    metadata?: DataMetadata; // we could remove this and get this information from the server

    // Data transformation
    dataTransform?: DataTransform;

    // Mark
    mark: Mark;

    // Visual channels
    x?: Channel;
    y?: Channel;
    xe?: Channel;
    ye?: Channel;

    x1?: Channel;
    y1?: Channel;
    x1e?: Channel;
    y1e?: Channel;

    row?: Channel;
    column?: Channel;

    color?: Channel;
    size?: Channel;
    text?: Channel;

    stroke?: Channel;
    strokeWidth?: Channel;
    opacity?: ChannelValue;
    background?: ChannelValue;

    // Stretch the size to the given range? (e.g., [x, xe])
    stretch?: boolean;

    // Visibility
    visibility?: TriggerCondition;

    // Styling
    style?: TrackStyle;

    // Specs internally used
    _is_circular?: boolean;
}

/**
 * Superposing multiple tracks.
 */
export type SuperposedTrack = Partial<SingleTrack> & {
    superpose: Partial<SingleTrack>[];
};

// TODO: support this to be able to ues two level superposition
export type SuperposedTrackTwoLevels = Partial<SingleTrack> & {
    superpose: Partial<SuperposedTrack>[];
};

export interface TrackStyle {
    dashed?: [number, number];
    linePattern?: { type: 'triangle-l' | 'triangle-r'; size: number };
    curve?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'left' | 'right';
    dy?: number;
    outline?: string;
    circularLink?: boolean;
    // below options could instead be used with channel options (e.g., size, stroke, strokeWidth)
    textFontSize?: number;
    textStroke?: string;
    textStrokeWidth?: number;
    textFontWeight?: 'bold' | 'normal';
    //
    background?: string; // deprecated
    stroke?: string; // deprecated
    strokeWidth?: number; // deprecated
}

/**
 * Semantic zoom: Determine how to change visual representations.
 */
export interface SemanticZoom {
    type: 'alternative-encoding';
    // TODO: consider making the spec and trigger part as an array of object
    spec: Partial<Track>;
    trigger: TriggerCondition;
}

export type LogicalOperation =
    | 'less-than'
    | 'lt'
    | 'LT'
    | 'greater-than'
    | 'gt'
    | 'GT'
    | 'less-than-or-equal-to'
    | 'ltet'
    | 'LTET'
    | 'greater-than-or-equal-to'
    | 'gtet'
    | 'GTET';

export interface TriggerCondition {
    operation: LogicalOperation;
    condition: {
        width?: number | '|xe-x|';
        height?: number;
        zoomLevel?: number;
        conditionPadding?: number; // buffer px size of width or height for calculating the condition
        transitionPadding?: number; // buffer px size of width or height for calculating the level of opacity for smooth transition
    }; // TODO: support AND or OR
    // TODO: separate condition by targets
    target: 'track' | 'mark' | 'glyph';
}

export const enum CHANNEL_KEYS {
    x = 'x',
    y = 'y',
    xe = 'xe',
    ye = 'ye',
    x1 = 'x1',
    y1 = 'y1',
    x1e = 'x1e',
    y1e = 'y1e',
    color = 'color',
    row = 'row',
    opacity = 'opacity',
    stroke = 'stroke',
    strokeWidth = 'strokeWidth',
    size = 'size',
    text = 'text',
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
    background: 'background'
} as const;

export type ChannelType = keyof typeof ChannelTypes | string;

export type Channel = ChannelDeep | ChannelValue; // TODO: support null to allow removing spec when overriding

export interface ChannelDeep {
    field?: string;
    type?: FieldType;
    aggregate?: Aggregate;
    domain?: Domain;
    range?: Range;
    axis?: AxisPosition;
    legend?: boolean;
    baseline?: string | number;
    zeroBaseline?: boolean; // We could remove this and use the `baseline` option instead
    mirrored?: boolean; // Show baseline on the top or right instead of bottom or left?
    grid?: boolean;
    linker?: string;
}
export type AxisPosition = 'top' | 'bottom' | 'left' | 'right';
export type FieldType = 'genomic' | 'nominal' | 'quantitative';

export interface ChannelValue {
    value: number | string;
}

export type Domain = string[] | number[] | DomainInterval | DomainChrInterval | DomainChr | DomainGene;
export type Range = string[] | number[] | PREDEFINED_COLORS;
export type PREDEFINED_COLORS = 'viridis' | 'grey' | 'spectral' | 'warm' | 'cividis' | 'bupu';

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

export type Aggregate = 'max' | 'min' | 'mean' | 'bin' | 'count';

/**
 * Mark
 */
export type Mark = MarkType | MarkDeep;

export type MarkType =
    | 'bar'
    | 'point'
    | 'line'
    | 'area'
    | 'link'
    | 'link-between'
    | 'link-within' // uses either x and x1 or y and y1
    | 'rect'
    | 'text'
    | 'rule'
    | 'triangle-l'
    | 'triangle-r'
    | 'triangle-d'
    // experimental
    | 'rect-brush'
    // deprecated
    | 'dummy'
    | 'empty';

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
