import type { GoslingSpec, Track, PartialTrack,ChannelDeep, ChannelValue, ChannelTypes, DataDeep, DataTransform, Mark, Encoding, Assembly, Layout, Orientation, DomainInterval, DomainChrInterval, DomainChr, ZoomLimits, AxisPosition, Style, Datum, X, Y, Row, Color, Size, Stroke, StrokeWidth, Opacity } from '@gosling-lang/gosling-schema';


export interface AltCounter {
    nTracks: number;
    rowViews: number;
    colViews: number;
    allPositions: number[][];
    totalRows: number;
    totalCols: number;
    matrix: number[][];
}

export interface AltParentValues {
    layout: 'linear' | 'circular';
    arrangement: 'parallel' | 'serial' | 'horizontal' | 'vertical';
    alignment: 'singular' | 'stack' | 'overlay';
    data?: DataDeep;
    mark?: Mark;
    //encodings for stacked?
}

export interface AltEncodingSeparated {
    encodingDeepGenomic: EncodingDeepSingle[];
    encodingDeepQuantitative: EncodingDeepSingle[];
    encodingDeepNominal: EncodingDeepSingle[];
    encodingValue: EncodingValueSingle[];
}

export interface EncodingDeepSingle {
    name: keyof typeof ChannelTypes;
    description: String;
    details: ChannelDeep;
}

export interface EncodingValueSingle {
    name: keyof typeof ChannelTypes;
    description: String;
    details: ChannelValue;
}

export interface AltTrackPositionDetails {
    trackNumber: number;
    rowNumber: number;
    colNumber: number;
}

export interface AltTrackAppearanceDetails {
    layout: Layout;
    overlaid: boolean;
    mark: Mark;
    encodings: AltEncodingSeparated;
    orientation?: Orientation;
    assembly?: Assembly;
}

export interface AltTrackDataFields {
    genomicField?: string;
    valueField?: string;
    categoryField?: string;
}

export interface AltTrackDataDetails {
    // xDomain?: DomainInterval | DomainChrInterval | DomainChr;
    // yDomain?: DomainInterval | DomainChrInterval | DomainChr;
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

export interface AltTrackData {
    description: string;
    details: AltTrackDataDetails;
}

export interface AltTrack {
    uid: string;
    description: string;

    type: string | unknown;
    title: string | unknown;
    
    position: AltTrackPosition;
    appearance: AltTrackAppearance;
    data: AltTrackData; 
}

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

export interface compositionTracker {
    nRows: number;
    nCols: number;
    allVertical: boolean;
    allHorizontal: boolean;
    everyRowSameCols: boolean;
    RowsCols: number[]
}

export interface AltSpecComposition {
    description: string;
    nTracks: number;
    parentValues: AltParentValues;
    counter: AltCounter;
}

export interface AltGoslingSpec {
    title?: string;
    subtitle?: string;
    alt: string;
    longDescription: string;
    composition: AltSpecComposition;
    tracks: Array<AltTrack> // TrackSingleAlt | TrackOverlaidAlt | TrackMultipleAlt>;
}


// export interface AltAttributes {
//     arrangement: 'parallel' | 'serial' | 'horizontal' | 'vertical';
//     alignment: 'stack' | 'overlay';
// }