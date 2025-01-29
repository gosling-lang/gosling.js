import type { DataDeep, Assembly, DummyTrackStyle } from '@gosling-lang/gosling-schema';

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
export type ProcessedTrack = ProcessedLinearTrack | ProcessedCircularTrack | ProcessedTitleTrack | ProcessedDummyTrack;

/** All tracks potentially have these properties */
export interface ProcessedTrackBase {
    id: string;
    height: number;
    width: number;
    static: boolean;
    mark?: string;
    orientation: 'horizontal' | 'vertical';
    title?: string;
    subtitle?: string;
    data?: DataDeep;
    assembly?: Assembly;
    overlayOnPreviousTrack?: boolean; // TODO: this can be non-optional.
    _overlay?: OverlayTrack[];
    color?: { value: string };
    stroke?: { value: string };
    opacity?: { value: number };
    strokeWidth?: { value: number };
    xOffset: number; // TODO: need to double check if this is actually filled in all the time after processed.
    yOffset: number;
}

export type ProcessedTitleTrack = Pick<ProcessedTrackBase, 'id' | 'width' | 'height' | 'title' | 'subtitle'> & {
    mark: '_header';
};

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

export type ProcessedDummyTrack = ProcessedTrackBase & {
    type?: string;
    style?: DummyTrackStyle;
};

/** Tracks in the _overlay */
export interface OverlayTrack {
    id: string;
    mark: string;
    x?: unknown;
    y?: unknown;
    color?: { value: string };
    stroke?: { value: string };
}
