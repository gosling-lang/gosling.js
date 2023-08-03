import type { List } from 'lodash';
import type { GoslingSpec, Track, PartialTrack, DataDeep, DataTransform, Mark, Encoding, Assembly, Layout, Orientation, DomainInterval, DomainChrInterval, DomainChr, ZoomLimits, AxisPosition, Style } from '../core/gosling.schema';

export type composition = ''



export interface Counter {
    nTracks: number;
    rowViews: number;
    colViews: number;
}

export interface allSameValues {
    assembly: Boolean;
    layout: Boolean;
    arrangement: Boolean;
    allVertical: Boolean;
    allHorizontal: Boolean;
    static: Boolean;
    xDomain: Boolean;
    yDomain: Boolean;
    dataSource: Boolean;
    categories: Boolean;
}


export interface EncodingSeparated {
    encodingField: Encoding;
    encodingStatic: Encoding;
}


export interface TrackAlt {
    description: string;
    
    position: {
        description: string;
        details: {
            trackNumber: number;
            rowNumber: number;
            colNumber: number;
            // width?: number;
            // height?: number;
        }
    }
    
    type: string | unknown;
    title: string | unknown;
    
    appearance: {
        description: string;
        details: {
            assembly?: Assembly;
            layout?: Layout;
            orientation?: Orientation;
            overlaid: boolean;
            mark: Mark | Mark[];
            encodingSeparated: EncodingSeparated;
        }
    }
    data: {
        description: string;
        details: {
            xDomain?: DomainInterval | DomainChrInterval | DomainChr;
            yDomain?: DomainInterval | DomainChrInterval | DomainChr;
            data: DataDeep;
        }
    }
}

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

export interface GoslingSpecAlt {
    title?: string;
    subtitle?: string;
    allSame: allSameValues;
    counter: Counter;
    nTracks: number;
    structure: Array<TrackAlt> // TrackSingleAlt | TrackOverlaidAlt | TrackMultipleAlt>;
}


export interface AttributesAlt {
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