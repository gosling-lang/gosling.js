import type { List } from 'lodash';
import type { GoslingSpec, Track, PartialTrack, DataDeep, DataTransform, Mark, Encoding, Assembly, Layout, Orientation, DomainInterval, DomainChrInterval, DomainChr, ZoomLimits, AxisPosition, Style } from '../core/gosling.schema';

export type composition = ''



export interface AltCounter {
    nTracks: number;
    rowViews: number;
    colViews: number;
}

export interface AltParentValues {
    layout: 'linear' | 'circular';
    arrangement: 'parallel' | 'serial' | 'horizontal' | 'vertical';
    alignment: 'singular' | 'stack' | 'overlay'
    allVertical: Boolean;
    allHorizontal: Boolean;
}


export interface AltEncodingSeparated {
    encodingField: Encoding;
    encodingStatic: Encoding;
}


export interface AltTrackPositionDetails {
    trackNumber: number;
    rowNumber: number;
    colNumber: number;
}

export interface AltTrackAppearanceDetails {
    assembly?: Assembly;
    layout?: Layout;
    orientation?: Orientation;
    overlaid: boolean;
    mark: Mark | Mark[];
    encodingSeparated: AltEncodingSeparated;
}

export interface AltTrackDataDetails {
    xDomain?: DomainInterval | DomainChrInterval | DomainChr;
    yDomain?: DomainInterval | DomainChrInterval | DomainChr;
    data: DataDeep;
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
    description: string;

    type: string | unknown;
    title: string | unknown;
    
    position: AltTrackPosition;
    appearance: AltTrackAppearance;
    data: AltTrackData; 
}






// export interface AltTrack {
//     description: string;
    
//     position: {
//         description: string;
//         details: {
//             trackNumber: number;
//             rowNumber: number;
//             colNumber: number;
//             // width?: number;
//             // height?: number;
//         }
//     }
    
//     type: string | unknown;
//     title: string | unknown;
    
//     appearance: {
//         description: string;
//         details: {
//             assembly?: Assembly;
//             layout?: Layout;
//             orientation?: Orientation;
//             overlaid: boolean;
//             mark: Mark | Mark[];
//             encodingSeparated: AltEncodingSeparated;
//         }
//     }
//     data: {
//         description: string;
//         details: {
//             xDomain?: DomainInterval | DomainChrInterval | DomainChr;
//             yDomain?: DomainInterval | DomainChrInterval | DomainChr;
//             data: DataDeep;
//         }
//     }
// }


// interface TrackAltOld {
//     trackNumber: number;
//     rowNumber: number;
//     colNumber: number;
//     title?: string;
//     assembly?: Assembly;
//     layout?: Layout;
//     orientation?: Orientation;
//     xDomain?: DomainInterval | DomainChrInterval | DomainChr;
//     yDomain?: DomainInterval | DomainChrInterval | DomainChr;
//     data: DataDeep;
// }

// export interface TrackSingleAlt extends TrackAlt {
//     mark: Mark;
//     encodingSeparated: EncodingSeparated;
//     width?: number;
//     height?: number;
//     specialDesc?: string;
// }

// export interface TrackOverlaidAlt extends TrackAlt {

// }

// export interface TrackMultipleAlt extends TrackAlt {

// }

export interface AltGoslingSpec {
    title?: string;
    subtitle?: string;
    composition: {
        description: string;
        nTracks: number;
        allSame: AltParentValues;
        counter: AltCounter;
    }
    tracks: Array<AltTrack> // TrackSingleAlt | TrackOverlaidAlt | TrackMultipleAlt>;
}


export interface AltAttributes {
    arrangement: 'parallel' | 'serial' | 'horizontal' | 'vertical';
    alignment: 'stack' | 'overlay';
}








import type { ResponsiveSize, ResponsiveSpecOfSingleView, ResponsiveSpecOfMultipleViews} from '../core/gosling.schema';





/** fixed things */

export interface CommonViewDefFixed {
    /** Similar to CommonViewDef, except forces every attribute ficed in traverseToFixSpecDownstream to not be optional. */
    layout: Layout;
    orientation: Orientation;
    spacing: number;
    static: boolean;
    zoomLimits: ZoomLimits;
    xOffset: number;
    yOffset: number;
    assembly: Assembly;

    /** Still optional: */
    xDomain?: DomainInterval | DomainChrInterval | DomainChr;
    yDomain?: DomainInterval | DomainChrInterval | DomainChr;
    linkingId?: string;
    xAxis?: AxisPosition; // not supported currently
    centerRadius?: number;
    style?: Style;
    _assignedWidth?: number;
    _assignedHeight?: number;
}


interface SingleTrackBaseFixed extends CommonViewDefFixed {
    // Data
    data: DataDeep;

    // Data transformation
    dataTransform?: DataTransform[];

    // Mark
    mark: Mark;
}

export type SingleTrackFixed = SingleTrackBaseFixed & Encoding;

export type TrackFixed = SingleTrackFixed;



export interface FlatTracksFixed extends CommonViewDefFixed {
    tracks: TrackFixed[];
}

export type SingleViewFixed = FlatTracksFixed;

export type ViewFixed = SingleViewFixed;

export type RootSpecWithSingleViewFixed = SingleViewFixed & {
    title?: string;
    subtitle?: string;
    description?: string;
    responsiveSize?: ResponsiveSize;
};

// export interface RootSpecWithMultipleViewsFixed extends MultipleViewsFixed {
//     title?: string;
//     subtitle?: string;
//     description?: string;
//     /** Determine whether to make the size of `GoslingComponent` bound to its parent element. __Default__: `false` */
//     responsiveSize?: ResponsiveSize;
// }

export type GoslingSpecFixed = (RootSpecWithSingleViewFixed & ResponsiveSpecOfSingleView)


// export type GoslingSpecFixed =
//     | (RootSpecWithSingleViewFixed & ResponsiveSpecOfSingleView)
//     | (RootSpecWithMultipleViewsFixed & ResponsiveSpecOfMultipleViews);



export interface DataInfo {
    raw?: any,
    positions?: any,
    genomicMin?: any,
    genomicMax?: any,
    peaks?: any,
    peakMin?: any,
    peakMax?: any,
    peakAvr?: any,
}

//xport type specPart