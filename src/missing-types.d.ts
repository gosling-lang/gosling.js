declare module 'monaco-editor/esm/vs/editor/edcore.main' {
    export * from 'monaco-editor';
}

// Partial types from https://github.com/higlass/higlass/blob/develop/app/scripts/configs/available-for-plugins.js
declare module '@higlass/available-for-plugins' {
    export * as libraries from '@higlass/libraries';
    export * as services from '@higlass/services';
    export * as tracks from '@higlass/tracks';
    export * as utils from '@higlass/utils';
}

declare module '@higlass/libraries' {
    export * as PIXI from 'pixi.js';
    export * as d3Array from 'd3-array';
    export * as d3Axis from 'd3-axis';
    export * as d3Brush from 'd3-brush';
    export * as d3Color from 'd3-color';
    export * as d3Drag from 'd3-drag';
    export * as d3Dsv from 'd3-dsv';
    export * as d3Format from 'd3-format';
    export * as d3Geo from 'd3-geo';
    export * as d3Scale from 'd3-scale';
    export * as d3Selection from 'd3-selection';
    // export * as d3Queue from 'd3-queue';
    // export * as d3Request from 'd3-request';
    export * as d3Transition from 'd3-transition';
    export * as d3Zoom from 'd3-zoom';
    // minimal typing of https://github.com/taskcluster/slugid/blob/main/slugid.js
    export declare const slugid: {
        nice(): string;
    };
}

declare module '@higlass/services' {
    import type { ScaleContinuousNumeric } from 'd3-scale';
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
    type TileData = {
        dense: number[];
        shape: number[];
        tilePos: unknown[];
    };
    type Tile = {
        tileData: TileData;
    };
    type ColorRGBA = [r: number, g: number, b: number, a: number];

    export declare const tileProxy: {
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
            scale: ScaleContinuousNumeric<number, number>,
            minX: number,
            maxX: number,
            maxZoom: number,
            maxDim: number
        ): number[];
        calculateTilesFromResolution(
            resolution: number,
            scale: ScaleContinuousNumeric<number, number>,
            minX: number,
            maxX: number,
            pixelsPerTile?: number
        ): number[];
        calculateTileWidth(tilesetInfo: TilesetInfo, zoomLevel: number, binsPerTile: number): number;
        calculateZoomLevel(scale: Scale, minX: number, maxX: number, binsPerTile?: number): number;
        calculateZoomLevelFromResolutions(resolutions: number[], scale: ScaleContinuousNumeric<number, number>): number;
        // fetchTilesDebounced();
        // json();
        // text();
        // tileDataToPixData();
    };
}

// TODO(06-21-22)
declare module '@higlass/tracks' {
    type Track = any;
    export declare const BarTrack: Track;
    export declare const PixiTrack: Track;
}

declare module '@higlass/utils' {
    type ChromInfo<Name> = {
        cumPositions: { pos: number; chr: string }[];
        chrPositions: Record<Name, { pos: number }>;
        chromLengths: Record<Name, number>;
    };

    export declare function showMousePosition(context: Track, is2d?: boolean, isGlobal?: boolean): void;
    export declare function absToChr(
        absPosition: number,
        chrInfo: ChromInfo<string>
    ): [chr: string, chrPositon: number, offset: number, insertPoint: number];
    export declare function chrToAbs<Name>(chrom: Name, chromPos: number, chromInfo: ChromInfo<Name>): number;
    export declare function colorToHex(colorValue: string): number;
    export declare function pixiTextToSvg(text: import('pixi.js').Text): HTMLElement;
    export declare function svgLine(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        strokeWidth: number,
        strokeColor: number
    ): HTMLElement;
    export declare const DenseDataExtrema1D: {
        new (arr: ArrayLike<number>): DenseDataExtrema1D;
    };
    export declare const trackUtils: {
        calculate1DVisibleTiles(tilesetInfo: TilesetInfo, scale: Scale): [zoomLevel: number, x: number][];
    };
}
