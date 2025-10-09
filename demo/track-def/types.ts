import type { DataDeep, Assembly, DummyTrackStyle, Mark, X, Y } from '@gosling-lang/gosling-schema';

/**
 * After the Gosling spec is compiled, it is a "processed spec".
 * A processed spec has most of the same properties as the original spec, but some properties are
 * added or modified during the compilation process.
 *
 * For example, a valid Gosling spec may have no 'id' property, but a processed spec will always have an 'id' property.
 *
 * This file contains the types for the processed spec.
 *
 * TODO: this file is incomplete. It should be updated to include all the properties that a processed spec can have.
 */

/** A Track after it has been compiled */
export type ProcessedTrack =
    | ProcessedLinearTrack
    | ProcessedCircularTrack
    | ProcessedDummyTrack
    | ProcessedSpatialTrack;
/** All tracks potentially have these properties */
export interface ProcessedTrackBase {
    layout?: 'linear' | 'circular' | 'spatial';
    id: string;
    height: number;
    width: number;
    static: boolean;
    mark?: Mark;
    orientation: 'horizontal' | 'vertical';
    title?: string;
    subtitle?: string;
    data?: DataDeep;
    assembly?: Assembly;
    overlayOnPreviousTrack?: boolean;
    _overlay?: OverlayTrack[];
    color?: { value: string };
    stroke?: { value: string };
    opacity?: { value: number };
    strokeWidth?: { value: number };
    xOffset?: number;
    yOffset?: number;
}

export type ProcessedLinearTrack = ProcessedTrackBase & {
    layout: 'linear';
};

export type ProcessedCircularTrack = ProcessedTrackBase & {
    id: string;
    layout: 'circular';
    startAngle: number;
    endAngle: number;
    outerRadius: number;
    innerRadius: number;
};

//~ DK: AFAIK, this needs to loosely fit definitions in Track.
//~ it is force casted via `as ProcessedTrack`, so there's no strict type checking.
export type ProcessedSpatialTrack = ProcessedTrackBase & {
    layout: 'spatial';
    spatial: {
        x: string;
        y: string;
        z: string;
        chr: string;
        coord: string;
    };
};

export type ProcessedDummyTrack = (ProcessedLinearTrack | ProcessedCircularTrack) & {
    type: 'dummy-track';
    style?: DummyTrackStyle;
    x?: X;
};

/** Tracks in the _overlay */
export interface OverlayTrack {
    id: string;
    mark?: Mark;
    x?: X;
    y?: Y;
    color?: { value: string };
    stroke?: { value: string };
}
