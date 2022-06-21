declare module 'monaco-editor/esm/vs/editor/edcore.main' {
    export * from 'monaco-editor';
}

// Partial types from https://github.com/higlass/higlass/blob/develop/app/scripts/configs/available-for-plugins.js
declare namespace HGC {
    type Libraries = {
        PIXI: typeof import('pixi.js');

        d3Array: typeof import('d3-array');
        d3Axis: typeof import('d3-axis');
        d3Brush: typeof import('d3-brush');
        d3Color: typeof import('d3-color');
        d3Dsv: typeof import('d3-dsv');
        d3Format: typeof import('d3-format');
        d3Geo: typeof import('d3-geo');
        d3Scale: typeof import('d3-scale');
        d3Selection: typeof import('d3-selection');
        // Types not installed in this repo.
        // Can always add later if needed, but this provides
        // more strictness since unresolved imports resolve to `any`.
        d3Queue: unknown;
        d3Request: unknown;
        d3Transition: unknown;
        d3Zoom: unknown;

        // minimal typing of https://github.com/taskcluster/slugid/blob/main/slugid.js
        slugid: {
            nice(): string;
        };
    };

    type Services = {
        tileProxy: TileProxy;
    };

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

    type TileProxy = {
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

    type Tracks = {
        BarTrack: Track; // TODO(06-21-22)
    };

    type Track = any;

    type Utils = {
        setupShowMousePosition(context: Track, is2d?: boolean, isGlobal?: boolean): void;
        trackUtils: {
            calculate1DVisibleTiles(tilesetInfo: TilesetInfo, scale: Scale): [zoomLevel: number, x: number][];
        };
    };

    export const libraries: Libraries;
    export const services: Services;
    export const tracks: Tracks;
    export const utils: Utils;
}

declare module '@higlass/available-for-plugins' {
    export = HGC;
}
