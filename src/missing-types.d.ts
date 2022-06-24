declare module 'monaco-editor/esm/vs/editor/edcore.main' {
    export * from 'monaco-editor';
}

// Partial types from https://github.com/higlass/higlass/blob/develop/app/scripts/configs/available-for-plugins.js
declare module '@higlass/types' {
    export type HGC = {
        libraries: typeof import('@higlass/libraries');
        services: typeof import('@higlass/services');
        tracks: typeof import('@higlass/tracks');
        utils: typeof import('@higlass/utils');
    };
    export type { Track, TrackContext, TrackOptions } from '@higlass/tracks';
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
    import type { ScaleContinuousNumeric } from 'd3-scale';
    import type * as PIXI from 'pixi.js';

    type Scale = ScaleContinuousNumeric<number, number>;

    type Handler = (data: any) => void;

    type Subscription = { event: string; handler: Handler };

    type PubSub = {
        publish(msg: string, data: any): void;
        subscribe(msg: string, handler: Handler): Subscription;
        unsubscribe(msg: string): void;
    };

    type TrackOptions = Record<string, unknown>;

    export type TrackContext<Options> = {
        id: string;
        viewUid: string;
        pubSub: PubSub;
        scene: PIXI.Graphics;
        dataConfig: DataConfig;
        dataFetcher: DataFetcher;
        getLockGroupExtrema(): [min: number, max: number] | null;
        handleTilesetInfoReceived(tilesetInfo: TilesetInfo): void;
        animate(): void;
        svgElement: HTMLElement;
        isValueScaleLocked(): boolean;
        onValueScaleChanged(): void;
        onTrackOptionsChanged(newOptions: Options): void;
        // TODO: not sure what the props are here
        onMouseMoveZoom(props: unknown): void;
        chromInfoPath: string;
        isShowGlobalMousePosition(): boolean;
        getTheme(): string;
    };

    export declare class Track {
        /* Properites */
        id: string;
        _xScale: Scale;
        _yScale: Scale;
        _refXScale: Scale;
        _refYScale: Scale;
        position: [number, number];
        dimensions: [number, number];
        options: TrackOptions;
        pubSubs: Subscription[];
        /* Constructor */
        constructor(props: { id: string; pubSub: PubSub; getTheme?: () => string });
        /* Methods */
        isWithin(x: number, y: number): boolean;
        getProp<Prop extends keyof this>(prop: Prop): this[Prop];
        getData(): void;
        getDimensions(): this['dimensions'];
        getDimensions(newDimensions: [number, number]): void;
        refXScale(): this['_refXScale'];
        refXScale(scale: Scale): void;
        refYScale(): this['_refYScale'];
        refYScale(scale: Scale): void;
        xScale(): this['_xScale'];
        xScale(scale: Scale): void;
        yScale(): this['_yScale'];
        yScale(scale: Scale): void;
        zoomed(xScale: Scale, yScale: Scale): void;
        draw(): void;
        getPosition(): this['position'];
        setPosition(newPosition: [number, number]): void;
        /**
         * A blank handler for MouseMove / Zoom events. Should be overriden
         * by individual tracks to provide
         */
        defaultMouseMoveHandler(evt: MouseEvent): void;
        remove(): void;
        rerender(options?: TrackOptions, force?: boolean): void;
        /**
         * Whether this track should respond to events at this mouse position.
         *
         * The difference to `isWithin()` is that it can be overwritten if a track is inactive for example.
         */
        respondsToPosition(x: number, y: number): boolean;
        zoomedY<T extends Track>(trackY: T, kMultiplier: number): void;
        movedY(dY: number): void;
    }

    type DataConfig = Record<string, any>;
    type DataFetcher = Record<string, any>;
    type TilesetInfo = Record<string, any>;

    export declare class PixiTrack<Options extends TrackOptions = TrackOptions> extends Track {
        /* Properties */
        delayDrawing: boolean;
        scene: PIXI.Graphics;
        pBase: PIXI.Graphics;
        pMasked: PIXI.Graphics;
        pMask: PIXI.Graphics;
        pMain: PIXI.Graphics;
        pBorder: PIXI.Graphics;
        pBackground: PIXI.Graphics;
        pForeground: PIXI.Graphics;
        pLabel: PIXI.Graphics;
        pMobile: PIXI.Graphics;
        pAxis: PIXI.Graphics;
        pMouseOver: PIXI.Graphics;
        options: Options;
        labelTextFontFamily: string;
        labelTextFontSize: number;
        labelXOffset: number;
        labelText: PIXI.Text;
        errorText: PIXI.Text;
        /* Constructor */
        constructor(context: TrackContext<Options>, options: Options);
        /* Methods */
        setMask(position: [number, number], dimensions: [number, number]): void;
        getForeground(): void;
        drawBorder(): void;
        drawError(): void;
        drawBackground(): void;
        getLabelColor(): string;
        getName(): string;
        drawLabel(): void;
        rerender(options: Options, force?: boolean): void;
        exportSVG(): [HTMLElement, HTMLElement];
    }
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
