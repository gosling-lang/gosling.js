declare module 'monaco-editor/esm/vs/editor/edcore.main' {
    export * from 'monaco-editor';
}

declare module '@higlass/libraries' {
    export const PIXI: typeof import('pixi.js');

    export const d3Array: typeof import('d3-array');
    export const d3Axis: typeof import('d3-axis');
    export const d3Brush: typeof import('d3-brush');
    export const d3Color: typeof import('d3-color');
    export const d3Drag: typeof import('d3-drag');
    export const d3Dsv: typeof import('d3-dsv');
    export const d3Format: typeof import('d3-format');
    export const d3Geo: typeof import('d3-geo');
    export const d3Scale: typeof import('d3-scale');
    export const d3Selection: typeof import('d3-selection');

    // Types not installed in this repo.
    // Can always add later if needed, but this provides
    // more strictness since unresolved imports resolve to `any`.
    export const d3Queue: unknown;
    export const d3Request: unknown;
    export const d3Transition: unknown;
    export const d3Zoom: unknown;

    // minimal typing of https://github.com/taskcluster/slugid/blob/main/slugid.js
    export const slugid: {
        nice(): string;
    };
}

declare module '@higlass/services' {
    type Scale = import('d3-scale').ScaleContinuousNumeric<number, number>;

    type TilesetInfo = {
        min_pos: number[];
        max_pos: number[];
        max_zoom: number;
    } & (
        | {
              resolutions: number[];
          }
        | {
              max_width: number;
              bins_per_dimension: number;
          }
    );

    type Tile = {
        tileData: {
            dense: number[];
            shape: number[];
            tilePos: unknown[];
        };
    };

    type ColorRGBA = [r: number, g: number, b: number, a: number];

    export const tileProxy: {
        calculateResolution(tilesetInfo: TilesetInfo, zoomLevel: number): number;
        calculateTileAndPosInTile(
            tilesetInfo: TilesetInfo,
            maxDim: number,
            dataStartPos: number,
            zoomLevel: number,
            position: number
        ): [tilePosition: number, positionInTile: number];
        calculateTiles(
            zoomLevel: number,
            scale: Scale,
            minX: number,
            maxX: number,
            maxZoom: number,
            maxDim: number
        ): number[];
        calculateTilesFromResolution(
            resolution: number,
            scale: Scale,
            minX: number,
            maxX: number,
            pixelsPerTile?: number
        ): number[];
        calculateTileWidth(tilesetInfo: TilesetInfo, zoomLevel: number, binsPerTile: number): number;
        calculateZoomLevel(scale: Scale, minX: number, maxX: number, binsPerTile?: number): number;
        calculateZoomLevelFromResolutions(resolutions: number[], scale: Scale): number;
        // fetchTilesDebounced();
        // json();
        // text();
        // tileDataToPixData();
    };
}

declare module '@higlass/tracks' {
    type Track = any;
    export const BarTrack: Track;
    export const PixiTrack: Track;
}

declare module '@higlass/utils' {
    type ChromInfo<Name> = {
        cumPositions: { pos: number; chr: string }[];
        chrPositions: Record<Name, { pos: number }>;
        chromLengths: Record<Name, number>;
    };

    export function showMousePosition(context: Track, is2d?: boolean, isGlobal?: boolean): void;
    export const trackUtils: {
        calculate1DVisibleTiles(tilesetInfo: TilesetInfo, scale: Scale): [zoomLevel: number, x: number][];
    };
    export function absToChr(
        absPosition: number,
        chrInfo: ChromInfo<string>
    ): [chr: string, chrPositon: number, offset: number, insertPoint: number];
    export function chrToAbs<Name>(chrom: Name, chromPos: number, chromInfo: ChromInfo<Name>): number;
    export function colorToHex(colorValue: string): number;
    export function pixiTextToSvg(text: import('pixi.js').Text): HTMLElement;
    export function svgLine(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        strokeWidth: number,
        strokeColor: number
    ): HTMLElement;
    export const DenseDataExtrema1D: {
        new (arr: ArrayLike<number>): DenseDataExtrema1D;
    };
}

// Partial types from https://github.com/higlass/higlass/blob/develop/app/scripts/configs/available-for-plugins.js
declare namespace HGC {
    export * as libraries from '@higlass/libraries';
    export * as services from '@higlass/services';
    export * as tracks from '@higlass/tracks';
    export * as utils from '@higlass/utils';
}

declare module '@higlass/available-for-plugins' {
    export = HGC;
}
