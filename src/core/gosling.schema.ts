import { Chromosome } from './utils/chrom-size';

/* ----------------------------- ROOT SPEC ----------------------------- */
export type GoslingSpec = RootSpecWithSingleView | RootSpecWithMultipleViews;

export type RootSpecWithSingleView = SingleView & {
    title?: string;
    subtitle?: string;
    description?: string;
};

export interface RootSpecWithMultipleViews extends MultipleViews {
    title?: string;
    subtitle?: string;
    description?: string;
}

/* ----------------------------- VIEW ----------------------------- */
export type View = SingleView | MultipleViews;

export type SingleView = OverlaidTracks | StackedTracks | FlatTracks;

export interface FlatTracks extends CommonViewDef {
    tracks: Track[];
}

export type PartialTrack = Partial<Track>;

export interface StackedTracks extends CommonViewDef, Partial<SingleTrack> {
    alignment?: 'stack';
    tracks: (PartialTrack | OverlaidTracks)[];
}

export interface OverlaidTracks extends CommonViewDef, Partial<SingleTrack> {
    alignment: 'overlay';
    tracks: PartialTrack[];
    width: number;
    height: number;
}

export interface MultipleViews extends CommonViewDef {
    /**
     * Specify how multiple views are arranged.
     */
    arrangement?: 'parallel' | 'serial' | 'horizontal' | 'vertical';
    /** An array of view specifications */
    views: Array<SingleView | MultipleViews>;
}

export type Layout = 'linear' | 'circular';
export type Orientation = 'horizontal' | 'vertical';
export type Assembly = 'hg38' | 'hg19' | 'hg18' | 'hg17' | 'hg16' | 'mm10' | 'mm9' | 'unknown';
export type ZoomLimits = [number | null, number | null];

export interface CommonViewDef {
    /** Specify the layout type of all tracks. */
    layout?: Layout;
    /** Specify the orientation. */
    orientation?: Orientation;

    /**
     * - If `{"layout": "linear"}`, specify the space between tracks in pixels;
     *
     * - If `{"layout": "circular"}`, specify the space between tracks in percentage ranging from 0 to 100.
     */
    spacing?: number;
    /** Whether to disable [Zooming and Panning](http://gosling-lang.org/docs/user-interaction#zooming-and-panning),
     * __Default:__ `false`.
     */
    static?: boolean;
    zoomLimits?: ZoomLimits; // limits of zoom levels. default: [1, null]

    /** Specify the x offset of views in the unit of pixels */
    xOffset?: number;
    /** Specify the y offset of views in the unit of pixels */
    yOffset?: number;

    /**
     * A string that specifies the genome builds to use.
     * Currently support `"hg38"`, `"hg19"`, `"hg18"`, `"hg17"`, `"hg16"`, `"mm10"`, `"mm9"`, and `"unknown"`.
     *
     * __Note:__: with `"unknown"` assembly, genomic axes do not show chrN: in labels.
     */
    assembly?: Assembly;

    // TODO: Change to domain?
    xDomain?: DomainInterval | DomainChrInterval | DomainChr;
    /** Specify an ID for [linking multiple views](http://gosling-lang.org/docs/user-interaction#linking-views) */
    linkingId?: string;
    /** not supported  */
    xAxis?: AxisPosition; // not supported currently

    /**
     * Proportion of the radius of the center white space.
     *
     * __Default:__ `0.3`
     * @Range [0, 1]
     */
    centerRadius?: number; // [0, 1] (default: 0.3)

    /**
     * Define the [style](http://gosling-lang.org/docs/visual-channel#style-related-properties) of multive views.
     * Will be overriden by the style of children elements (e.g., view, track).
     */
    style?: Style;
}

/* ----------------------------- TRACK ----------------------------- */
export type Track = SingleTrack | OverlaidTrack | DataTrack | TemplateTrack;

export interface CommonRequiredTrackDef {
    /** Specify the track width in pixels. */
    width: number;
    /** Specify the track height in pixels. */
    height: number;
}

export interface CommonTrackDef extends CommonViewDef, CommonRequiredTrackDef {
    // !! TODO: we can check if the same id is used multiple times.
    // !! TODO: this should be track-specific and not defined in views.
    id?: string; // Assigned to `uid` in a HiGlass view config, used for API and caching.

    /** If defined, will show the textual label on the left-top corner of a track. */
    title?: string;
    subtitle?: string; // Being used only for a title track (i.e., 'text-track')

    // Arrangement
    overlayOnPreviousTrack?: boolean;

    // Circular Layout
    /**
     * Specify the outer radius of tracks when `{"layout": "circular"}`.
     */
    outerRadius?: number;
    /**
     * Specify the inner radius of tracks when (`{"layout": "circular"}`).
     */
    innerRadius?: number;
    /**
     * Specify the start angle (in the range of [0, 360]) of circular tracks (`{"layout": "circular"}`).
     */
    startAngle?: number; // [0, 360]
    /**
     * Specify the end angle (in the range of [0, 360]) of circular tracks (`{"layout": "circular"}`).
     */
    endAngle?: number; // [0, 360]

    // Internally used properties
    /** internal */
    _renderingId?: string;
    /** internal */
    _invalidTrack?: boolean; // flag to ignore rendering certain tracks if they have problems // !!! TODO: add tests

    // To test upcoming feature.
    /** internal */
    prerelease?: {
        // ...
    };
}

/**
 * Partial specification of `BasicSingleTrack` to use default visual encoding predefined by data type.
 */
export interface DataTrack extends CommonTrackDef {
    data: DataDeep;
}

/* ----------------------------- MARK ----------------------------- */
export type Mark =
    | 'point'
    | 'line'
    | 'area'
    | 'bar'
    | 'rect'
    | 'text'
    | 'withinLink'
    | 'betweenLink'
    | 'rule'
    | 'triangleLeft'
    | 'triangleRight'
    | 'triangleBottom'
    // experimental
    | 'brush'
    // TODO: perhaps need to make this invisible to users
    // being used to show title/subtitle internally
    | 'header';

/* ----------------------------- TRACK ----------------------------- */
export type SingleTrack = SingleTrackBase & Encoding;

interface SingleTrackBase extends CommonTrackDef {
    // Data
    data: DataDeep;

    // Data transformation
    dataTransform?: DataTransform[];

    tooltip?: Tooltip[];

    // Mark
    mark: Mark;

    // Resolving overlaps
    displacement?: Displacement;

    // Visibility
    visibility?: VisibilityCondition[];

    // Experimental
    flipY?: boolean; // This is only supported for `link` marks.
    stretch?: boolean; // Stretch the size to the given range? (e.g., [x, xe])
    overrideTemplate?: boolean; // Override a spec template that is defined for a given data type.
}

export interface Encoding {
    x?: X | ChannelValue;
    y?: Y | ChannelValue;
    xe?: X | ChannelValue;
    ye?: Y | ChannelValue;

    x1?: X | ChannelValue;
    y1?: Y | ChannelValue;
    x1e?: X | ChannelValue;
    y1e?: Y | ChannelValue;

    row?: Row | ChannelValue;

    color?: Color | ChannelValue;
    size?: Size | ChannelValue;
    text?: Text | ChannelValue;

    stroke?: Stroke | ChannelValue;
    strokeWidth?: StrokeWidth | ChannelValue;
    opacity?: Opacity | ChannelValue;
}

export interface Tooltip {
    field: string;
    type: FieldType;
    alt?: string;
    format?: string;
}

export interface Displacement {
    type: DisplacementType;
    padding?: number; // A pixel value

    // "pile" specific parameters (TODO: make this a separate interface)
    // minRows?: number; // Specify at least how many rows should be generated (default: 0)
    // maxRows?: number; // Specify maximum rows to be generated (default: `undefined` meaning no limit)
}

export type DisplacementType = 'pile' | 'spread';

// TODO: Check whether `Omit` is properly included in the generated `gosling.schema.json`
// https://github.com/vega/ts-json-schema-generator/issues/101
/**
 * Superposing multiple tracks.
 */
export type OverlaidTrack = Partial<SingleTrack> &
    CommonRequiredTrackDef & {
        // This is a property internally used when compiling
        overlay: Partial<Omit<SingleTrack, 'height' | 'width' | 'layout' | 'title' | 'subtitle'>>[];
    };

export interface Style {
    // Top-level Styles
    background?: string;
    backgroundOpacity?: number;
    outline?: string;
    outlineWidth?: number;
    /**
     * Whether to enable smooth paths when drawing curves.
     *
     * __Default__: `false`
     */
    enableSmoothPath?: boolean;

    // Mark-level styles
    /**
     * Specify the pattern of dashes and gaps for `rule` marks.
     */
    dashed?: [number, number];
    /**
     * Specify the pattern of dashes and gaps for `rule` marks.
     */
    linePattern?: { type: 'triangleLeft' | 'triangleRight'; size: number };
    /**
     * Specify the curve of `rule` marks.
     */
    curve?: 'top' | 'bottom' | 'left' | 'right';
    /**
     * Specify the alignment of marks.
     * This property is currently only supported for `triangle` marks.
     */
    align?: 'left' | 'right';
    /**
     * Offset the position of marks in x direction.
     * This property is currently only supported for `text` marks
     */
    dx?: number;
    /**
     * Offset the position of marks in y direction.
     * This property is currently only supported for `text` marks.
     */
    dy?: number;
    /**
     *  Specify whether to use bazier curves for the `link` marks.
     */
    bazierLink?: boolean;
    /**
     * Deprecated: draw arc instead of bazier curve?
     */
    circularLink?: boolean;
    /**
     * Specify whether to show legend in a single horizontal line?
     */
    inlineLegend?: boolean;
    /**
     * If defined, show legend title on the top or left
     */
    legendTitle?: string;

    // below options could instead be used with channel options (e.g., size, stroke, strokeWidth)
    /**
     * Specify the font size of `text` marks.
     * Can also be specified using the `size` channel option of `text` marks.
     */
    textFontSize?: number;
    /**
     * Specify the stroke of `text` marks.
     * Can also be specified using the `stroke` channel option of `text` marks.
     */
    textStroke?: string;
    /**
     * Specify the stroke width of `text` marks.
     * Can also be specified using the `strokeWidth` channel option of `text` marks.
     */
    textStrokeWidth?: number;
    /** Specify the font weight of `text` marks. */
    textFontWeight?: 'bold' | 'normal';
    /** Specify the alignment of `text` marks to a given point.
     */
    textAnchor?: 'start' | 'middle' | 'end';
    /** Specify the connetion type of `betweenLink` marks.
     *
     * __Default__: `"corner"`
     */
    linkConnectionType?: 'straight' | 'curve' | 'corner';
}

/* ----------------------------- SEMANTIC ZOOM ----------------------------- */
export type VisibilityCondition = SizeVisibilityCondition | ZoomLevelVisibilityCondition;

interface CommonVisibilityCondition {
    /**
     * A string that pecifies the logical operation to conduct between `threshold` and the `measure` of `target`.
     * Support
     *
     * - greater than : "greater-than", "gt", "GT"
     *
     * - less than : "less-than", "lt", "LT"
     *
     * - greater than or equal to : "greater-than-or-equal-to", "gtet", "GTET"
     *
     * - less than or equal to : "less-than-or-equal-to", "ltet", "LTET"
     */
    operation: LogicalOperation;
    /**
     * Specify the buffer size (in pixel) of width or height when calculating the visibility.
     *
     * __Default__: `0`
     */
    conditionPadding?: number;
    /**
     * Specify the buffer size (in pixel) of width or height for smooth transition.
     *
     * __Default__: `0`
     */
    transitionPadding?: number;
}

export interface SizeVisibilityCondition extends CommonVisibilityCondition {
    /**
     * Target specifies the object that you want to compare with the threshold.
     */
    target: 'track' | 'mark';
    /**
     * Specify which aspect of the `target` will be compared to the `threshold`.
     */
    measure: 'width' | 'height';
    /**
     * Specify the threshold as one of:
     *
     * - A number representing a fixed threshold in the unit of pixels;
     *
     * - `"|xe-x|"`, using the distance between `xe` and `x` as threshold
     */
    threshold: number | '|xe-x|';
}

export interface ZoomLevelVisibilityCondition extends CommonVisibilityCondition {
    /**
     * Target specifies the object that you want to compare with the threshold.
     */
    target: 'track' | 'mark';
    /**
     * Specify which aspect of the `target` will be compared to the `threshold`.
     */
    measure: 'zoomLevel';
    /**
     * Set a threshold in the unit of base pairs (bp)
     */
    threshold: number;
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

/* ----------------------------- VISUAL CHANNEL ----------------------------- */
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
    text: 'text'
} as const;

export type ChannelType = keyof typeof ChannelTypes | string;

export type Channel = ChannelDeep | ChannelValue; // TODO: support null to allow removing spec when overriding

export interface AxisCommon {
    /** Name of the data field. */
    field?: string;
    /** Specify the data type. */
    type?: 'quantitative' | 'nominal' | 'genomic';
    /** Values of the data */
    domain?: ValueExtent | GenomicDomain;
    /** Values of the visual channel. */
    range?: ValueExtent;
    /** Specify where should the axis be put  */
    axis?: AxisPosition;
    /** Whether to display legend. __Default__: `false` */
    legend?: boolean;
    /** Users need to assign a unique linkingId for [linking views](/docs/user-interaction#linking-views) and [Brushing and Linking](/docs/user-interaction#brushing-and-linking) */
    linkingId?: string;
    /** Specify how to aggregate data. __Default__: `undefined` */
    aggregate?: Aggregate;
    /** Whether to display grid. __Default__: `false` */
    grid?: boolean;
}

export interface X extends AxisCommon {
    type?: 'genomic';
    domain?: GenomicDomain;
}

export interface Y extends AxisCommon {
    type?: 'quantitative' | 'nominal' | 'genomic';
    domain?: ValueExtent;
    /** Custom baseline of the y-axis. __Default__: `0` */
    baseline?: string | number;
    /** Specify whether to use zero baseline. __Default__: `true`  */
    zeroBaseline?: boolean; // TODO: We could remove this and use the `baseline` option instead
    /** Whether to flip the y-axis. This is done by inverting the `range` property. __Default__: `false` */
    flip?: boolean;
}

export interface ChannelDeepCommon {
    /** Name of the data field */
    field?: string;
    /** Specify the data type */
    type?: 'quantitative' | 'nominal' | 'genomic';
    /** Values of the data */
    domain?: ValueExtent;
    /** Ranges of visual channel values */
    range?: ValueExtent | Range;
}

export interface Row extends ChannelDeepCommon {
    type?: 'nominal';
    domain?: ValueExtent;
    /** Determine the start and end position of rendering area of this track along vertical axis. __Default__: `[0, height]` */
    range?: ValueExtent;
    /** Whether to display legend. __Default__: `false` */
    legend?: boolean;
    /** Determines the size of inner white spaces on the top and bottom of individiual rows. __Default__: `0` */
    padding?: number;
    /** Whether to display grid. __Default__: `false` */
    grid?: boolean;
}

export interface Color extends ChannelDeepCommon {
    type?: 'quantitative' | 'nominal';
    domain?: ValueExtent;
    /** Determine the colors that should be bound to data value. Default properties are determined considering the field type. */
    range?: Range;
    /** Whether to display legend. __Default__: `false` */
    legend?: boolean;
}

export interface Size extends ChannelDeepCommon {
    type?: 'quantitative' | 'nominal';
    domain?: ValueExtent;
    range?: ValueExtent;
    /** not supported: Whether to display legend. __Default__: `false` */
    legend?: boolean;
}

export interface Stroke extends ChannelDeepCommon {
    type?: 'quantitative' | 'nominal';
    domain?: ValueExtent;
    range?: Range;
}

export interface StrokeWidth extends ChannelDeepCommon {
    type?: 'quantitative' | 'nominal';
    domain?: ValueExtent;
    range?: ValueExtent;
}

export interface Opacity extends ChannelDeepCommon {
    type?: 'quantitative' | 'nominal';
    domain?: ValueExtent;
    range?: ValueExtent;
}

export interface Text extends Omit<ChannelDeepCommon, 'baseline'> {
    type?: 'quantitative' | 'nominal';
    domain?: string[];
    range?: string[];
}

export type ChannelDeep = X | Y | Row | Color | Size | Stroke | StrokeWidth | Opacity | Text;

export interface ChannelValue {
    /** Assign a constant value for a visual channel. */
    value: number | string;
}

export type AxisPosition = 'none' | 'top' | 'bottom' | 'left' | 'right';
export type FieldType = 'genomic' | 'nominal' | 'quantitative';
export type ValueExtent = string[] | number[];
export type GenomicDomain = DomainInterval | DomainChrInterval | DomainChr | DomainGene;
export type Domain = ValueExtent | GenomicDomain;
export type Range = ValueExtent | PREDEFINED_COLORS;
export type PREDEFINED_COLORS = 'viridis' | 'grey' | 'spectral' | 'warm' | 'cividis' | 'bupu' | 'rdbu';

export interface DomainChr {
    // For showing a certain chromosome
    chromosome: Chromosome;
}
export interface DomainChrInterval {
    /** If specified, only showing a certain interval in a chromosome. */
    chromosome: Chromosome;
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

/* ----------------------------- DATA ----------------------------- */
export type DataDeep = JSONData | CSVData | BIGWIGData | MultivecData | BEDDBData | VectorData | MatrixData | BAMData;

/** Values in the form of JSON. */
export interface Datum {
    [k: string]: number | string;
}

/**
 * The JSON data format allows users to include data directly in the Gosling's JSON specification.
 */

export interface JSONData {
    /**
     * Define data type.
     */
    type: 'json';

    /** Values in the form of JSON. */
    values: Datum[];

    /** Specify the name of quantitative data fields. */
    quantitativeFields?: string[];

    /** Specify the name of chromosome data fields. */
    chromosomeField?: string;

    /** Specify the name of genomic data fields. */
    genomicFields?: string[];

    /** Specify the number of rows loaded from the URL.
     *
     * __Default:__ `1000`
     */
    sampleLength?: number;

    /** experimental */
    genomicFieldsToConvert?: {
        chromosomeField: string;
        genomicFields: string[];
    }[];
}

/**
 * Any small enough tabular data files, such as tsv, csv, BED, BEDPE, and GFF, can be loaded using "csv" data specification.
 */

export interface CSVData {
    type: 'csv';

    /**
     * Specify the URL address of the data file.
     */
    url: string;

    /**
     * Specify file separator, __Default:__ ','
     */
    separator?: string;

    /**
     * Specify the name of quantitative data fields.
     */
    quantitativeFields?: string[];

    /**
     * Specify the name of chromosome data fields.
     */
    chromosomeField?: string;

    /**
     * Specify the name of genomic data fields.
     */
    genomicFields?: string[];

    /**
     * Specify the number of rows loaded from the URL.
     *
     * __Default:__ `1000`
     */
    sampleLength?: number; // This limit the total number of rows fetched (default: 1000)

    /**
     * Specify the names of data fields if a CSV file is headerless.
     */
    headerNames?: string[];

    /**
     * experimental
     */
    chromosomePrefix?: string;

    /**
     * experimental
     */
    longToWideId?: string;

    /**
     * experimental
     */
    genomicFieldsToConvert?: {
        chromosomeField: string;
        genomicFields: string[];
    }[];
}

/**
 * Two-dimensional quantitative values,
 * one axis for genomic coordinate and the other for different samples, can be converted into HiGlass' `"multivec"` data.
 * For example, multiple BigWig files can be converted into a single multivec file.
 * You can also convert sequence data (FASTA) into this format where rows will be different nucleotide bases (e.g., A, T, G, C)
 * and quantitative values represent the frequency. Find out more about this format at [HiGlass Docs](https://docs.higlass.io/data_preparation.html#multivec-files).
 */
export interface MultivecData {
    type: 'multivec';

    /**
     * Specify the URL address of the data file.
     */
    url: string;

    /**
     * Assign a field name of the middle position of genomic intervals.
     */
    column: string;

    /**
     * Assign a field name of samples.
     */
    row: string;

    /**
     * Assign a field name of quantitative values.
     */
    value: string;

    /**
     *  assign names of individual samples.
     */
    categories?: string[];

    /**
     * Assign a field name of the start position of genomic intervals.
     */
    start?: string;

    /**
     * Assign a field name of the end position of genomic intervals.
     */
    end?: string;

    /**
     * Binning the genomic interval in tiles (unit size: 256).
     */
    binSize?: number;
}

export interface BIGWIGData {
    type: 'bigwig';

    /**
     * Specify the URL address of the data file.
     */
    url: string;

    /**
     * Assign a field name of the middle position of genomic intervals.
     */
    column: string;

    /**
     * Assign a field name of quantitative values.
     */
    value: string;
    /**
     * Assign a field name of the start position of genomic intervals.
     */
    start?: string;

    /**
     * Assign a field name of the end position of genomic intervals.
     */
    end?: string;

    /**
     * Binning the genomic interval in tiles (unit size: 256).
     */
    binSize?: number;
}

/**
 * One-dimensional quantitative values along genomic position (e.g., bigwig) can be converted into HiGlass' `"vector"` format data.
 * Find out more about this format at [HiGlass Docs](https://docs.higlass.io/data_preparation.html#bigwig-files).
 */

export interface VectorData {
    type: 'vector';
    /**
     * Specify the URL address of the data file.
     */
    url: string;

    /** Assign a field name of the middle position of genomic intervals. */
    column: string;

    /** Assign a field name of quantitative values. */
    value: string;

    /** Assign a field name of the start position of genomic intervals. */
    start?: string;

    /** Assign a field name of the end position of genomic intervals. */
    end?: string;

    /** Binning the genomic interval in tiles (unit size: 256). */
    binSize?: number;
}

/**
 * Regular BED or similar files can be pre-aggregated for the scalable data exploration.
 * Find our more about this format at [HiGlass Docs](https://docs.higlass.io/data_preparation.html#bed-files).
 */
export interface BEDDBData {
    type: 'beddb';
    /** Specify the URL address of the data file. */
    url: string;

    /** Specify the name of genomic data fields. */
    genomicFields: { index: number; name: string }[];

    /** Specify the column indexes, field names, and field types. */
    valueFields?: { index: number; name: string; type: 'nominal' | 'quantitative' }[];

    // this is a somewhat arbitrary option for reading gene annotation datasets
    // should be multi-value fields (e.g., "1,2,3")
    /** experimental */
    exonIntervalFields?: [{ index: number; name: string }, { index: number; name: string }];
}

/**
 * Binary Alignment Map (BAM) is the comprehensive raw data of genome sequencing;
 * it consists of the lossless, compressed binary representation of the Sequence Alignment Map-files.
 */
export interface BAMData {
    type: 'bam';

    /** URL link to the BAM data file */
    url: string;

    /** URL link to the index file of the BAM file */
    indexUrl: string;
    loadMates?: boolean; // load mates as well?
    maxInsertSize?: number; // default 50,000bp, only applied for across-chr, JBrowse https://github.com/GMOD/bam-js#async-getrecordsforrangerefname-start-end-opts
}

export interface MatrixData {
    type: 'matrix';
    url: string;
}

/* ----------------------------- DATA TRANSFORM ----------------------------- */

export type DataTransform =
    | FilterTransform
    | StrConcatTransform
    | StrReplaceTransform
    | LogTransform
    | DisplaceTransform
    | ExonSplitTransform
    | GenomicLengthTransform
    | CoverageTransform
    | CombineMatesTransform
    | JSONParseTransform;

export type FilterTransform = OneOfFilter | RangeFilter | IncludeFilter;

interface CommonFilterTransform {
    type: 'filter';
    /** A filter is applied based on the values of the specified data field */
    field: string;
    /**
     * when `{"not": true}`, apply a NOT logical operation to the filter.
     *
     * __Default:__ `false` */
    not?: boolean;
}

export interface RangeFilter extends CommonFilterTransform {
    /** Check whether the value is in a number range. */
    inRange: number[];
}

export interface IncludeFilter extends CommonFilterTransform {
    /** Check whether the value includes a substring. */
    include: string;
}

export interface OneOfFilter extends CommonFilterTransform {
    /** Check whether the value is an element in the provided list. */
    oneOf: string[] | number[];
}

export type LogBase = number | 'e';
export interface LogTransform {
    type: 'log';
    field: string;
    /** If not specified, 10 is used. */
    base?: LogBase;
    /** If specified, store transformed values in a new field. */
    newField?: string;
}

export interface StrConcatTransform {
    type: 'concat';
    fields: string[];
    newField: string;
    separator: string;
}

export interface StrReplaceTransform {
    type: 'replace';
    field: string;
    newField: string;
    replace: { from: string; to: string }[];
}

export interface DisplaceTransform {
    type: 'displace';
    // We could support different types of bounding boxes (e.g., using a center position and a size)
    boundingBox: {
        /** The name of a quantitative field that represents the start position. */
        startField: string;

        /** The name of a quantitative field that represents the end position. */
        endField: string;

        /** The padding around visual lements. Either px or bp */
        padding?: number;

        /** Whether to consider `padding` as the bp length. */
        isPaddingBP?: boolean;

        /** The name of a nominal field to group rows by in prior to piling-up. */
        groupField?: string;
    };
    /** A string that specifies the type of diseplancement.  */
    method: DisplacementType;
    newField: string;

    /** Specify maximum rows to be generated (default has no limit). */
    maxRows?: number;
}

export interface ExonSplitTransform {
    type: 'exonSplit';
    separator: string;
    flag: { field: string; value: number | string };
    fields: { field: string; type: FieldType; newField: string; chrField: string }[];
}

/**
 * Calculate genomic length using two genomic fields
 */
export interface GenomicLengthTransform {
    type: 'genomicLength';
    startField: string;
    endField: string;
    newField: string;
}

/**
 * Aggregate rows and calculate coverage
 */
export interface CoverageTransform {
    type: 'coverage';
    startField: string;
    endField: string;
    newField?: string;
    /** The name of a nominal field to group rows by in prior to piling-up */
    groupField?: string;
}

/**
 * By looking up ids, combine mates (a pair of reads) into a single row, performing long-to-wide operation.
 * Result data have `{field}` and `{field}_2` names.
 */
export interface CombineMatesTransform {
    type: 'combineMates';
    idField: string;
    isLongField?: string; // is this pair long reads, exceeding max insert size? default, `is_long`
    maxInsertSize?: number; // thresold to determine long reads, default 360
    maintainDuplicates?: boolean; // do not want to remove duplicated row? If true, the original reads will be contained in `{field}`
}

/**
 * Parse JSON Object Array and append vertically
 */
export interface JSONParseTransform {
    type: 'subjson';
    /** The field that contains the JSON object array. */
    field: string;
    /** Base genomic position when parsing relative position. */
    baseGenomicField: string;
    /** Relative genomic position to parse. */
    genomicField: string;
    /** Length of genomic interval. */
    genomicLengthField: string;
}

/* ----------------------------- Templates ----------------------------- */

/**
 * Template specification that will be internally converted into `SingleTrack` for rendering.
 */
export interface TemplateTrack extends CommonRequiredTrackDef, CommonTrackDef {
    // Template name (e.g., 'gene')
    template: string;

    // Data specification that is identical to the one in `SingleTrack`
    data: DataDeep;

    // ! TODO: Is there a way to make this not nested while preserving the other specific properties like `data` and `template`?
    // https://basarat.gitbook.io/typescript/type-system/index-signatures#excluding-certain-properties-from-the-index-signature
    // https://stackoverflow.com/questions/51465182/how-to-remove-index-signature-using-mapped-types
    encoding?: {
        // Custom channels (e.g., geneHeight, strandColor, ...)
        [k: string]: Channel;
    };
}

/**
 * Definition of Track Templates.
 */
export interface TemplateTrackDef {
    name: string;
    channels: CustomChannelDef[];
    mapping: TemplateTrackMappingDef[];
}

/**
 * Definition of custom channels used in a track template.
 */
export interface CustomChannelDef {
    name: string;
    type: FieldType | 'value';
    required?: boolean;
}

// TODO: LogTransform already has `base`
export type DataTransformWithBase = Partial<DataTransform> & { base?: string };

/**
 * This is based on `SingleTrack` but the differeces are only the type of channels
 * which additionally have `base` properties to override properties from a template spec
 * and remove of certain properties (e.g., `data`)
 */
export type TemplateTrackMappingDef = Omit<
    CommonRequiredTrackDef & CommonTrackDef,
    'data' | 'height' | 'width' | 'layout' | 'title' | 'subtitle'
> & {
    // Data transformation
    dataTransform?: DataTransformWithBase[];

    tooltip?: Tooltip[];

    // Mark
    mark: Mark;

    // Visual channels
    x?: ChannelWithBase;
    y?: ChannelWithBase;
    xe?: ChannelWithBase;
    ye?: ChannelWithBase;

    x1?: ChannelWithBase;
    y1?: ChannelWithBase;
    x1e?: ChannelWithBase;
    y1e?: ChannelWithBase;

    row?: ChannelWithBase;

    color?: ChannelWithBase;
    size?: ChannelWithBase;
    text?: ChannelWithBase;

    stroke?: ChannelWithBase;
    strokeWidth?: ChannelWithBase;
    opacity?: ChannelWithBase;

    // Resolving overlaps
    displacement?: Displacement;

    // Visibility
    visibility?: VisibilityCondition[];

    // !! TODO: Remove these?
    // Experimental
    flipY?: boolean; // This is only supported for `link` marks.
    stretch?: boolean; // Stretch the size to the given range? (e.g., [x, xe])
    overrideTemplate?: boolean; // Override a spec template that is defined for a given data type.
};

// The main difference is that this allows to specify a `base` property
export type ChannelWithBase = Channel & {
    base?: string;
};
