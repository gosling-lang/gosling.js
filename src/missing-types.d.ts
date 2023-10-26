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
    export type { Context, Track, TrackConfig } from '@higlass/tracks';
    export type { ChromInfo } from '@higlass/utils';
    export type { TilesetInfo } from '@higlass/services';
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
    export * as d3Transition from 'd3-transition';
    export * as d3Zoom from 'd3-zoom';
    // minimal typing of https://github.com/taskcluster/slugid/blob/main/slugid.js
    export const slugid: {
        nice(): string;
    };
}

declare module '@higlass/services' {
    import type * as d3 from 'd3';
    import type * as PIXI from 'pixi.js';

    type Scale = d3.ScaleContinuousNumeric<number, number>;

    export type TilesetInfo = {
        min_pos: number[];
        max_pos: number[];
        max_zoom: number;
        tile_size?: number;
        max_tile_width?: number;
    } & (
        | {
              resolutions: number[];
          }
        | {
              max_width: number;
              bins_per_dimension?: number;
          }
    );
    export interface TileDataBase {
        shape: [number, number];
        tilePos?: [number, number];
        zoomLevel: number;
        tileId: string;
    }
    interface DenseTileData extends TileDataBase {
        dense: number[];
    }
    type SparseTile = {
        xStart: number;
        xEnd: number;
        chrOffset: number;
        importance: number;
        uid: string;
        fields: string[];
    };
    type SparseTileData = TileDataBase & Array<SparseTile>;
    export type TileData = DenseTileData | SparseTileData;
    export type Tile = {
        tileId: string;
        remoteId: string;
        drawnAtScale: Scale;
        graphics: PIXI.Graphics;
        tileData: TileData;
    };
    export type FetchedTiles = Record<string, Tile>;
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
    import type * as d3 from 'd3';
    import type * as PIXI from 'pixi.js';
    import type * as d3Selection from 'd3-selection';
    import type { TilesetInfo, ColorRGBA } from '@higlass/services';
    import type { ChromInfo } from '@higlass/utils';

    type Scale = d3.ScaleContinuousNumeric<number, number>;

    type Handler = (data: any) => void;

    type Subscription = { event: string; handler: Handler };

    type PubSub = {
        publish(msg: string, data: any): void;
        subscribe(msg: string, handler: Handler): Subscription;
        unsubscribe(msg: string): void;
    };

    interface OnMouseMoveZoomOptions {
        trackId: string;
        data: number;
        absX: number;
        absY: number;
        relX: number;
        relY: number;
        dataX: number;
        dataY: number;
    }

    interface OnMouseMoveZoomOptions1D extends OnMouseMoveZoomOptions {
        orientation: '1d-horizontal' | '1d-vertical';
    }

    interface OnMouseMoveZoomOptions2D extends OnMouseMoveZoomOptions {
        orientation: '2d';
        dataLens: ArrayLike<number>;
        dim: number;
        toRgb: [number, number, number, number];
        center: [number, number];
        xRange: [number, number];
        yRange: [number, number];
        isGenomicCoords: boolean;
    }

    export type Context<TileData, Options> = {
        id: string;
        viewUid: string;
        pubSub: PubSub;
        scene: PIXI.Graphics;
        dataConfig: DataConfig;
        dataFetcher: DataFetcher<TileData>;
        getLockGroupExtrema(): [min: number, max: number] | null;
        handleTilesetInfoReceived(tilesetInfo: TilesetInfo): void;
        animate(): void;
        svgElement: SVGElement;
        isValueScaleLocked(): boolean;
        onValueScaleChanged(): void;
        onTrackOptionsChanged(newOptions: Options): void;
        onMouseMoveZoom(opts: OnMouseMoveZoomOptions1D | OnMouseMoveZoomOptions2D): void;
        chromInfoPath: string;
        isShowGlobalMousePosition(): boolean;
        getTheme(): string;
    };

    export class Track<Options> {
        /* Properites */
        id: string;
        _xScale: Scale;
        _yScale: Scale;
        _refXScale: Scale;
        _refYScale: Scale;
        position: [number, number];
        dimensions: [number, number];
        options: Options;
        pubSubs: Subscription[];
        /* Constructor */
        constructor(props: { id: string; pubSub: PubSub; getTheme?: () => string });
        /* Methods */
        isWithin(x: number, y: number): boolean;
        getProp<Prop extends keyof this>(prop: Prop): this[Prop];
        getData(): void;
        getDimensions(): this['dimensions'];
        setDimensions(newDimensions: [number, number]): void;
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
        rerender(options?: Options, force?: boolean): void;
        /**
         * Whether this track should respond to events at this mouse position.
         *
         * The difference to `isWithin()` is that it can be overwritten if a track is inactive for example.
         */
        respondsToPosition(x: number, y: number): boolean;
        zoomedY<T extends Track<any>>(trackY: T, kMultiplier: number): void;
        movedY(dY: number): void;
    }

    type DataConfig = Record<string, any>;
    export interface DataFetcher<Tile> {
        tilesetInfo(finished: (info: TilesetInfo) => void): void;
        fetchTilesDebounced(receivedTiles: (tiles: Record<string, Tile>) => void, tileIds: string[]): void;
        track?: any;
    }

    type TilePosition1D = [zoom: number, x: number];
    type TilePosition2D = [zoom: number, x: number, y: number];
    type TilePosition = TilePosition1D | TilePosition2D;

    export class PixiTrack<Options> extends Track<Options> {
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
        labelTextFontFamily: string;
        labelTextFontSize: number;
        labelXOffset: number;
        labelText: PIXI.Text;
        errorText: PIXI.Text;
        prevOptions: string;
        flipText?: boolean; // Property never assigned https://github.com/higlass/higlass/blob/develop/app/scripts/PixiTrack.js
        /* Constructor */
        constructor(context: Context<unknown, Options>, options: Options);
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

    export abstract class TiledPixiTrack<TileData, Options> extends PixiTrack<Options> {
        /* Constructor */
        constructor(context: Context<TileData, Options>, options: Options);

        renderVersion: number;

        // the tiles which should be visible (although they're not necessarily fetched)
        visibleTiles: Set<TileData>;
        visibleTileIds: Set<string>;

        // keep track of tiles that are currently being rendered
        renderingTiles: Set<TileData>;
        // the tiles we already have requests out for
        fetching: Set<TileData>;
        scale: Record<string, unknown>;

        fetchedTiles: Record<string, TileData>;

        // the graphics that have already been drawn for this track
        tileGraphics: Record<string, PIXI.Graphics>;

        maxZoom: number;
        medianVisibleValue: number | null;

        backgroundTaskScheduler: unknown;

        continuousScaling: boolean;

        valueScaleMin: null | number;
        fixedValueScaleMin: null | number;
        valueScaleMax: null | number;
        fixedValueScaleMax: null | number;

        listeners: Record<string, unknown>;

        pubSub: Pick<Context<TileData, Options>, 'pubSub'>;
        animate: Pick<Context<TileData, Options>, 'animate'>;
        onValueScaleChanged: Pick<Context<TileData, Options>, 'onValueScaleChanged'>;

        // store the server and tileset uid so they can be used in draw()
        // if the tileset info is not found
        prevValueScale: number | null;
        dataFetcher: DataFetcher<TileData>;
        tilesetInfo: TilesetInfo | null;
        uuid: string;
        trackNotFoundText: PIXI.Text;

        refreshTilesDebounced(): void;

        tilesetUid?: string;
        server?: string;
        chromInfo?: ChromInfo;

        // methods
        setError(error: string): void;
        setFixedValueScaleMin(value: number): void;
        setFixedValueScaleMax(value: number): void;
        checkValueScaleLimits(): void;
        /**
         * Register an event listener for track events. Currently, the only supported
         * event is ``dataChanged``.
         *
         * @param event The event to listen for.
         * @param cb The callback to call when the event occurs. The
         *  parameters for the event depend on the event called.
         *
         * @example
         *
         *  trackObj.on('dataChanged', (newData) => {
         *   console.log('newData:', newData)
         *  });
         */
        on(event: 'dataChanged', cb: (data: TileData[]) => void): void;
        off(event: 'dataChanged', cb: (data: TileData[]) => void): void;
        visibleAndFetchedIds(): string[];
        visibleAndFetchedTiles(): TileData[];
        setVisibleTiles(tilePositions: (TilePosition & { mirrored?: boolean })[]): void;
        abstract tileToLocalId(tile: TilePosition): string;
        abstract tileToRemoteId(tile: TilePosition): string;
        removeOldTiles(): void;
        refreshTiles(): void;
        parentInFetched(tile: TileData): boolean;
        parentTileId(tile: TileData): string;
        removeTiles(toRemoveIds: string[]): void;
        zoomed(newXScale: Scale, newYScale: Scale, k?: number, tx?: number, ty?: number): void;
        /**
         * Check to see if all the visible tiles are loaded.
         *
         * If they are, remove all other tiles.
         */
        areAllVisibleTilesLoaded(): boolean;
        /**
         * Function is called when all tiles that should be visible have
         * been received.
         */
        allTilesLoaded(): void;
        minValue(value: number): this;
        minValue(): number;
        maxValue(value: number): this;
        maxValue(): number;
        minRawValue(): number;
        maxRawValue(): number;
        initTile(tile?: TileData): void;
        updateTile(tile?: TileData): void;
        destroyTile(tile?: TileData): void;
        addMissingGraphics(): void;
        updateExistingGraphics(): void;
        synchronizeTilesAndGraphics(): void;
        // Requires this.lruCache which is not implemented anywhere in higlass??
        // loadTileData<TData, TType>(
        //     tile: { tileId: string, data: TData, type: TType },
        //     dataLoader: (data: TData, type: TType) => TileData,
        // ): TileData;
        fetchNewTiles(toFetch: { remoteId: string }[]): void;
        receivedTiles(loadedTiles: Record<string, TileData>): void;
        /**
         * Draw a tile on some graphics
         */
        drawTile(tile?: TileData): void;
        calculateMedianVisibleValue(): number;
        /** Caution! assumes dense tile data */
        allVisibleValues(): number[];
        /**
         * Should be overwriten by child clases to get the true minimum
         * visible value in the currently viewed area
         */
        minVisibleValue(ignoreFixedScale?: boolean): number;
        minVisibleValueInTiles(ignoreFixedScale?: boolean): number;
        /**
         * Should be overwriten by child clases to get the true maximal
         * visible value in the currently viewed area
         */
        maxVisibleValue(ignoreFixedScale?: boolean): number;
        maxVisibleValueInTiles(ignoreFixedScale?: boolean): number;
        /**
         * Create a value scale that will be used to position values along the y axis.
         *
         *  @param minValue The minimum value of the data
         *  @param medianValue The median value of the data. Potentially used for adding a pseudocount
         *  @param maxValue The maximum value of the data
         *  @param inMargin A number of pixels to be left free on the top and bottom of the track. For example if the glyphs have a certain width and we want all of them to fit into the space.
         */
        makeValueScale(
            minValue: number,
            medianValue: number,
            maxValue: number,
            inMargin: number
        ): [scale: Scale, offset: number];
    }

    export abstract class Tiled1DPixiTrack<TileData, Options> extends TiledPixiTrack<TileData, Options> {
        onMouseMoveZoom: Pick<Context<TileData, Options>, 'onMouseMoveZoom'>;
        isValueScaleLocked: Pick<Context<TileData, Options>, 'isValueScaleLocked'>;
        getLockGroupExtrema: Pick<Context<TileData, Options>, 'getLockGroupExtrema'>;
        initTile(tile: TileData): void;
        tileToLocalId(tile: TilePosition): string;
        tileToRemoteId(tile: TilePosition): string;
        /**
         * Which scale should we use for calculating tile positions?
         *
         * Horizontal tracks should use the xScale and vertical tracks
         * should use the yScale
         *
         * This function should be overwritten by HorizontalTiled1DPixiTrack.js
         * and VerticalTiled1DPixiTrack.js
         */
        abstract relevantScale(): Scale;
        calculateVisibleTiles(): void;
        /** Get the tile's position in its coordinate system. */
        getTilePosAndDimensions(
            zoomLevel: number,
            tilePos: [x: number, y: number],
            binsPerTileIn?: number
        ): { tileX: number; tileY: number; tileWidth: number; tileHeight: number };
        updateTile(tile: TileData): void;
        scheduleRerender(): void;
        handleRerender(): void;
        /** Caution! Assumes dense data */
        getIndicesOfVisibleDataInTile(tile: TileData): [start: number, end: number];
        minVisibleValue(ignoreFixedScale?: boolean): number;
        maxVisibleValue(ignoreFixedScale?: boolean): number;
        /**
         * Return an aggregated visible value. For example, the minimum or maximum.
         *
         * @description
         *   The difference to `minVisibleValueInTiles`
         *   is that the truly visible min or max value is returned instead of the
         *   min or max value of the tile. The latter is not necessarily visible.
         *
         *   For 'min' and 'max' this is identical to minVisibleValue and maxVisibleValue
         *
         * @param aggregator Aggregation method.
         */
        getAggregatedVisibleValue(aggregator?: 'min' | 'max'): number;
        /**
         * Get the data value at a relative pixel position
         * @param relPos  Relative pixel position, where 0 indicates the start of the track.
         * @return The data value at `relPos`.
         */
        getDataAtPos(relPos: number): number;
        mouseMoveHandler(mousePosition?: { x?: number; y?: number }): void;
        abstract mouseMoveZoomHandler(absX?: number, abxY?: number): void;
    }

    class AxisPixi<Track> {
        pAxis: PIXI.Graphics;
        track: Track;
        axisTexts: string[];
        axisTextFontFamily: string;
        axisTextFontSize: number;

        constructor(track: Track);

        startAxis(axisHeight: number): void;
        createAxisTexts(valueScale: Scale, axisHeight: number): void;
        calculateAxisTickValues(valueScale: Scale, axisHeight: number): ReturnType<Scale['ticks']>;
        drawAxisLeft(valueScale: Scale, axisHeight: number): void;
        drawAxisRight(valueScale: Scale, axisHeight: number): void;
        hideOverlappingAxisLabels(): void;
        exportVerticalAxis(axisHeight: number): SVGGElement;
        createAxisSVGLine(): SVGPathElement;
        createAxisSVGText(text: string): SVGTextElement;
        exportAxisLeftSVG(valueScale: Scale, axisHeight: number): SVGGElement;
        exportAxisRightSVG(valueScale: Scale, axisHeight: number): SVGGElement;
        clearAxis(): void;
    }

    export class HorizontalTiled1DPixiTrack<T, Options> extends Tiled1DPixiTrack<T, Options> {
        constIndicator: PIXI.Graphics;
        axis: AxisPixi<this>;
        animate(): void;
        isShowGlobalMousePosition(): boolean;
        is2d?: boolean;
        calculateZoomLevel(): number;
        relevantScale(): Scale;
        drawAxis(valueScale: Scale): void;
        mouseMoveZoomHandler(absX?: number, absY?: number): void;
        drawConstIndicator(): void;
    }

    export class HorizontalLine1DPixiTrack<T, Options> extends HorizontalTiled1DPixiTrack<T, Options> {
        stopHover(): void;
        getMouseOverHtml(mouseX: number, mouseY?: number): string;
        renderTile(tile: T): void;
        drawTile(tile: T): void;
        zoomed(newXScale: Scale, newYScale: Scale): void;
        superSVG(): [HTMLElement, HTMLElement];
        tileToLocalId(tile: TilePosition): string;
        tileToRemoteId(tile: TilePosition): string;
    }

    export class BarTrack<T, Options> extends HorizontalLine1DPixiTrack<T, Options> {
        zeroLine: PIXI.Graphics;
        valueScaleTransform: d3.ZoomTransform;
        initialized?: boolean;
        colorScale?: ColorRGBA[];
        setColorScale(colorRange: ColorRGBA[]): void;
        colorGradientColors?: { from: number; color: ColorRGBA }[];
        setColorGradient(colorGradient: ColorRGBA[]): void;
        drawZeroLine(): void;
        drawZeroLineSvg(output: HTMLElement): void;
        getXScaleAndOffset(drawnAtScale: Scale): [number, number];
        /**
         * Adds information to recreate the track in SVG to the tile.
         * Warning. Mutates the tile!
         *
         * @param tile
         * @param x x value of bar
         * @param y y value of bar
         * @param width width of bar
         * @param height height of bar
         * @param color color of bar (not converted to hex)
         */
        addSVGInfo(tile: T, x: number, y: number, width: number, height: number, color: string): void;
        /**
         * Export an SVG representation of this track
         *
         * @returns {Array} The two returned DOM nodes are both SVG
         * elements [base,track]. Base is a parent which contains track as a
         * child. Track is clipped with a clipping rectangle contained in base.
         *
         */
        exportSVG(): [HTMLElement, HTMLElement];
    }

    export class SVGTrack<Options> extends Track<Options> {
        /* Properties */
        gMain: d3Selection.Selection<d3Selection.Datum, d3Selection.PElement, d3Selection.PDatum>;
        clipUid: string;
        clipRect: d3Selection.Selection<d3Selection.Datum, d3Selection.PElement, d3Selection.PDatum>;
        /* Constructor */
        constructor(context: Context<unknown, Options>, options: Options);
    }

    /* eslint-disable-next-line @typescript-eslint/ban-types */
    type LiteralUnion<T, U = string> = T | (U & {});

    type Orientation = '2d' | '1d-vertical' | '1d-horizontal' | 'whole' | 'any';

    type DataType =
        | 'map-tiles'
        | 'axis'
        | 'x-coord'
        | 'y-coord'
        | 'xy-coord'
        | 'matrix'
        | 'vector'
        | 'multivec'
        | 'bed-value'
        | 'stacked-interval'
        | '1d-projection'
        | '2d-projection'
        | 'gene-annotation'
        | 'arrowhead-domains'
        | '2d-rectangle-domains'
        | 'nothing'
        | '2d-annotations'
        | 'bedpe'
        | 'any'
        | 'chromsizes'
        | '1d-tiles'
        | 'image-tiles'
        | 'bedlike';

    type OptionsInfo<Options> = {
        [Key in keyof Options]?: {
            name: string;
            inlineOptions: Record<string, { name: string; value: Options[Key] }>;
        };
    };

    export type TrackConfig<Options> = {
        type: string;
        defaultOptions?: Options;
        availableOptions?: (keyof Options)[];
        name?: string;
        datatype?: readonly LiteralUnion<DataType>[];
        aliases?: string[];
        local?: boolean;
        orientation?: Orientation;
        thumbnail?: Element;
        chromInfoPath?: string;
        optionsInfo?: OptionsInfo<Options>;
    };
}

declare module '@higlass/utils' {
    import type { ScaleContinuousNumeric } from 'd3-scale';
    import type { TilesetInfo } from '@higlass/services';

    export type ChromInfo<Name extends string = string> = {
        cumPositions: { id?: number; pos: number; chr: string }[];
        chrPositions: Record<Name, { pos: number }>;
        chromLengths: Record<Name, number>;
        totalLength: number;
    };

    /**
     * @param context Class context, i.e., `this`.
     * @param is2d If `true` both dimensions of the mouse location should be shown. E.g., on a central track.
     * @param isGlobal  If `true` local and global events will trigger the mouse position drawing.
     * @return  {Function}  Method to remove graphics showing the mouse location.
     */
    export function showMousePosition<T>(context: T, is2d?: boolean, isGlobal?: boolean): () => void;
    export function absToChr(
        absPosition: number,
        chrInfo: Pick<ChromInfo, 'cumPositions' | 'chromLengths'>
    ): [chr: string, chrPositon: number, offset: number, insertPoint: number];
    export function chrToAbs<Name extends string>(
        chrom: Name,
        chromPos: number,
        chromInfo: Pick<ChromInfo<Name>, 'chrPositions'>
    ): number;
    export function colorToHex(colorValue: string | number): number;
    export function pixiTextToSvg(text: import('pixi.js').Text): HTMLElement;
    export function svgLine(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        strokeWidth: number,
        strokeColor: number
    ): HTMLElement;
    export class DenseDataExtrema1D {
        constructor(arr: ArrayLike<number | null>);
        minNonZeroInTile: number;
        maxNonZeroInTile: number;
    }
    export const trackUtils: {
        calculate1DVisibleTiles(
            tilesetInfo: TilesetInfo,
            scale: ScaleContinuousNumeric<number, number>
        ): [zoomLevel: number, x: number][];
    };
}
