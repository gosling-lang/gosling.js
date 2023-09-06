import type { GoslingSpec, Track, PartialTrack,ChannelDeep, ChannelValue, ChannelTypes, DataDeep, DataTransform, Mark, Encoding, Assembly, Layout, Orientation, DomainInterval, DomainChrInterval, DomainChr, ZoomLimits, AxisPosition, Style, Datum, X, Y, Row, Color, Size, Stroke, StrokeWidth, Opacity } from '@gosling-lang/gosling-schema';


export type AltCounter = {
    nTracks: number;
    rowViews: number;
    colViews: number;
    allPositions: number[][];
    totalRows: number;
    totalCols: number;
    matrix: number[][];
}

export type AltParentValues = {
    layout: 'linear' | 'circular';
    arrangement: 'parallel' | 'serial' | 'horizontal' | 'vertical';
    alignment: 'singular' | 'stack' | 'overlay';
    data?: DataDeep;
    mark?: Mark;
}

export type AltEncodingSeparated = {
    encodingDeepGenomic: EncodingDeepSingle[];
    encodingDeepQuantitative: EncodingDeepSingle[];
    encodingDeepNominal: EncodingDeepSingle[];
    encodingValue: EncodingValueSingle[];
}

export type EncodingDeepSingle = {
    name: keyof typeof ChannelTypes;
    description: String;
    details: ChannelDeep;
}

export type EncodingValueSingle = {
    name: keyof typeof ChannelTypes;
    description: String;
    details: ChannelValue;
}

export type AltTrackPositionDetails = {
    trackNumber: number;
    rowNumber: number;
    colNumber: number;
}

export type AltTrackAppearanceDetails = {
    overlaid: false;
    layout: Layout;
    mark: Mark;
    encodings: AltEncodingSeparated;
    orientation?: Orientation;
    assembly?: Assembly;
}

export type AltTrackAppearanceDetailsOverlaid = {
    overlaid: true;
    layout: Layout;
    mark: Mark[];
    encodings: AltEncodingSeparated;
    encodingsByMark: AltEncodingSeparated[];
    orientation?: Orientation;
    assembly?: Assembly;
}

export interface AltTrackDataFields {
    genomicField?: string;
    valueField?: string;
    categoryField?: string;
}

export interface AltTrackDataDetails {
    data: DataDeep;
    fields: AltTrackDataFields;
    dataStatistics?: AltDataStatistics;
}

export interface AltTrackPosition {
    description: string;
    details: AltTrackPositionDetails;
}

export interface AltTrackAppearance {
    description: string;
    details: AltTrackAppearanceDetails;
}

export interface AltTrackAppearanceOverlaid {
    description: string;
    details: AltTrackAppearanceDetailsOverlaid;
}

export interface AltTrackData {
    description: string;
    details: AltTrackDataDetails;
}

export interface AltTrackOverlaidByDataInd {
    description: string;
    charttype?: string;
    appearance: AltTrackAppearance;
    data: AltTrackData; 
}

export interface AltTrackBase {
    type: 'single' | 'ov-mark' | 'ov-data';
    description: string;
    title?: string;
    position: AltTrackPosition;
}


export interface AltTrackSingle extends AltTrackBase {
    type: 'single';
    uid: string;
    charttype?: string;
    appearance: AltTrackAppearance;
    data: AltTrackData; 
}

export interface AltTrackOverlaidByMark extends AltTrackBase {
    type: 'ov-mark';
    uid: string;
    charttype?: string[];
    appearance: AltTrackAppearanceOverlaid;
    data: AltTrackData; 
}

export interface AltTrackOverlaidByData extends AltTrackBase {
    type: 'ov-data';
    uids: string[];
    tracks: AltTrackOverlaidByDataInd[];
}

export type AltTrackOverlaid = AltTrackOverlaidByMark | AltTrackOverlaidByData;

export type AltTrack = AltTrackSingle | AltTrackOverlaid;

export interface AltDataStatistics {
    id: string;
    flatTileData: Datum[];
    genomicMin?: number;
    genomicMax?: number;
    valueMin?: number;
    valueMax?: number;
    valueMinGenomic?: number[];
    valueMaxGenomic?: number[];
    categories?: string[];
    categoryMinMaxWG?: { [key: string]: (number | number[])[] };
    highestCategory?: string[];
}

export type compositionTracker = {
    nRows: number;
    nCols: number;
    allVertical: boolean;
    allHorizontal: boolean;
    everyRowSameCols: boolean;
    RowsCols: number[]
}

export type AltSpecComposition = {
    description: string;
    nTracks: number;
    parentValues: AltParentValues;
    counter: AltCounter;
}

export type AltGoslingSpec = {
    title?: string;
    subtitle?: string;
    alt: string;
    longDescription: string;
    composition: AltSpecComposition;
    tracks: Array<AltTrack>
}


// export interface AltAttributes {
//     arrangement: 'parallel' | 'serial' | 'horizontal' | 'vertical';
//     alignment: 'stack' | 'overlay';
// }