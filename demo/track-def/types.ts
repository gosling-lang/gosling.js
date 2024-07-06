import type { DataDeep, Assembly } from '@gosling-lang/gosling-schema';
/** A Track after it has been compiled */
export type ProcessedTrack = ProcessedLinearTrack | ProcessedCircularTrack;
/** All tracks potentially have these properties */
export interface ProcessedTrackBase {
    id: string;
    height: number;
    width: number;
    static: boolean;
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

/** Tracks in the _overlay */
export interface OverlayTrack {
    id: string;
    mark: string;
    x?: unknown;
    y?: unknown;
    color?: { value: string };
    stroke?: { value: string };
}
