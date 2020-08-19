import { scaleLinear, min, max } from 'd3';
import vis from './visualizations';
import { getMaxZoomLevel } from './utils/zoom';
import { Track, getVisualizationType, getChannelRange } from '../lib/gemini.schema';
import { GeminiTrackModel } from '../lib/gemini-track-model';
import { findValueExtent } from './utils/minmax';
import { SpriteInfo } from './utils/sprite';

function GeminiTrack(HGC: any, ...args: any[]): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    const { colorToHex } = HGC.utils;

    class GeminiTrackClass extends HGC.tracks.BarTrack {
        private geminiModel: GeminiTrackModel;
        private extent: { min: number; max: number };

        constructor(params: any[]) {
            const [context, options] = params;
            super(context, options);

            this.geminiModel = new GeminiTrackModel(this.options.spec);

            this.extent = { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER };

            // deprecated
            this.maxAndMin = {
                max: null,
                min: null
            };
        }

        initTile(tile: any) {
            // TODO: support gene annotation tilesets
            // e.g., https://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA

            // create the tile
            // should be overwritten by child classes
            this.scale.minRawValue = this.minVisibleValue();
            this.scale.maxRawValue = this.maxVisibleValue();

            this.scale.minValue = this.scale.minRawValue;
            this.scale.maxValue = this.scale.maxRawValue;

            this.maxAndMin.min = min(tile.tileData.dense);
            this.maxAndMin.max = max(tile.tileData.dense);

            this.localColorToHexScale();

            this.preprocessTile(tile);

            this.renderTile(tile);
            this.rescaleTiles();
        }

        // draws exactly one tile
        renderTile(tile: any) {
            tile.mouseOverData = null;
            tile.graphics.clear();
            tile.graphics.removeChildren();
            this.pBorder.clear();
            this.pBorder.removeChildren();
            tile.drawnAtScale = this._xScale.copy(); // being used in `draw()`

            const isNotMaxZoomLevel = tile?.tileData?.zoomLevel !== getMaxZoomLevel();

            if (isNotMaxZoomLevel && this.geminiModel.spec().zoomAction?.type === 'hide') {
                vis.drawZoomInstruction(HGC, this);
                return;
            }

            // select spec based on the zoom level
            const spec: Track = this.geminiModel.spec(isNotMaxZoomLevel);

            switch (getVisualizationType(spec)) {
                case 'bar':
                case 'line':
                case 'area':
                    vis.drawPrimitiveMarks(HGC, this, tile, isNotMaxZoomLevel);
                    break;
                default:
                    console.warn('Not supported visualization');
                    break;
            }
        }

        // y scale should be synced across all tiles
        setTrackLevelExtent() {
            // reset extent
            this.extent = {
                min: Number.MAX_SAFE_INTEGER,
                max: Number.MIN_SAFE_INTEGER
            };

            const visibleAndFetched = this.visibleAndFetchedTiles();

            visibleAndFetched.forEach((tile: any) => {
                // deprecated
                if (tile.minValue + tile.maxValue > this.maxAndMin.min + this.maxAndMin.max) {
                    this.maxAndMin.min = tile.minValue;
                    this.maxAndMin.max = tile.maxValue;
                }
                //

                if (!tile.extent) {
                    return;
                }
                if (tile.extent.min + tile.extent.max > this.extent.min + this.extent.max) {
                    this.extent.min = tile.extent.min;
                    this.extent.max = tile.extent.max;
                }
            });
        }

        // realign the sprites of all visible tiles when zooming and panning
        rescaleTiles() {
            const visibleAndFetched = this.visibleAndFetchedTiles();
            const trackHeight = this.dimensions[1];

            this.setTrackLevelExtent();

            visibleAndFetched.map((tile: any) => {
                if (!tile.extent || !tile.rowScale) {
                    // data is not ready
                    return;
                }

                const rowHeight = trackHeight / tile.rowScale.domain().length;
                const yScale = scaleLinear()
                    .domain([0, Math.abs(this.extent.min) + this.extent.max])
                    .range([0, rowHeight]);
                const tileBaseline = rowHeight - yScale(Math.abs(this.extent.min));
                const tileHeight = yScale(tile.extent.min + tile.extent.max);
                const tileY = tileBaseline - yScale(tile.extent.max);

                const sprites = tile.sprites;
                if (!sprites) return;

                sprites.forEach((spriteInfo: SpriteInfo) => {
                    const { sprite, scaleKey } = spriteInfo;

                    sprite.height = tileHeight;
                    sprite.y = tileY + tile.rowScale(scaleKey);
                });
            });
        }

        preprocessTile(tile: any) {
            if (tile.tabularData) return;

            // TODO: the server should give us the following metadata of fields, such as field names and categories
            const N_FIELD_FROM_SERVER = '__N__';
            const Q_FIELD_FROM_SERVER = '__Q__';
            const G_FIELD_FROM_SERVER = '__G__';
            const CATEGORIES_OF_N_FIELD_FROM_SERVER = ['A', 'T', 'G', 'C']; // NOTICE: this should be consistent across all tiles

            const numericValues = tile.tileData.dense;
            const numOfGenomicPositions = tile.tileData.shape[1];

            const tabularData: { [k: string]: number | string }[] = [];

            // convert data to visualization-friendly format
            CATEGORIES_OF_N_FIELD_FROM_SERVER.forEach((c: string, i: number) => {
                Array.from(Array(numOfGenomicPositions).keys()).forEach((g: number, j: number) => {
                    tabularData.push({
                        [N_FIELD_FROM_SERVER]: c,
                        [Q_FIELD_FROM_SERVER]: numericValues[numOfGenomicPositions * i + j],
                        [G_FIELD_FROM_SERVER]: j
                    });
                });
            });

            tile.tabularData = tabularData;

            const isMaxZoomLevel = tile?.tileData?.zoomLevel !== getMaxZoomLevel();
            tile.extent = findValueExtent(this.geminiModel.spec(isMaxZoomLevel), tabularData);

            // we need to sync the domain of y-axis so that all tiles are aligned each other
            this.setTrackLevelExtent();
        }

        // rerender all tiles every time track size is changed
        setDimensions(newDimensions: any) {
            this.oldDimensions = this.dimensions;
            super.setDimensions(newDimensions);

            const visibleAndFetched = this.visibleAndFetchedTiles();
            visibleAndFetched.map((a: any) => this.initTile(a));
        }

        // converts all colors in a colorScale to Hex colors.
        localColorToHexScale() {
            const colorScale = [
                ...getChannelRange(this.geminiModel.spec(), 'color'),
                ...getChannelRange(this.geminiModel.spec(true), 'color')
            ];
            const colorHexMap: { [k: string]: string } = {};
            colorScale.forEach((color: string) => {
                colorHexMap[color] = colorToHex(color);
            });
            this.colorHexMap = colorHexMap;
        }

        getIndicesOfVisibleDataInTile(tile: any) {
            const visible = this._xScale.range();

            if (!this.tilesetInfo) return [null, null];

            const { tileX, tileWidth } = this.getTilePosAndDimensions(
                tile.tileData.zoomLevel,
                tile.tileData.tilePos,
                this.tilesetInfo.bins_per_dimension || this.tilesetInfo.tile_size
            );

            const tileXScale = scaleLinear()
                .domain([0, this.tilesetInfo.tile_size || this.tilesetInfo.bins_per_dimension])
                .range([tileX, tileX + tileWidth]);

            const start = Math.max(0, Math.round(tileXScale.invert(this._xScale.invert(visible[0]))));
            const end = Math.min(
                tile.tileData.dense.length,
                Math.round(tileXScale.invert(this._xScale.invert(visible[1])))
            );

            return [start, end];
        }

        /**
         * Returns the minimum in the visible area (not visible tiles)
         */
        minVisibleValue() {}
        // minVisibleValue(ignoreFixedScale = false) {
        //     let visibleAndFetchedIds = this.visibleAndFetchedIds();

        //     if (visibleAndFetchedIds.length === 0) {
        //     visibleAndFetchedIds = Object.keys(this.fetchedTiles);
        //     }

        //     const minimumsPerTile = visibleAndFetchedIds
        //     .map(x => this.fetchedTiles[x])
        //     .map(tile => {
        //         const ind = this.getIndicesOfVisibleDataInTile(tile);
        //         return tile.tileData.denseDataExtrema.getMinNonZeroInSubset(ind);
        //     });

        //     const min = Math.min(...minimumsPerTile);

        //     if (ignoreFixedScale) return min;

        //     return this.valueScaleMin !== null ? this.valueScaleMin : min;
        // }

        /**
         * Returns the maximum in the visible area (not visible tiles)
         */
        maxVisibleValue() {}
        //   maxVisibleValue(ignoreFixedScale = false) {
        //     let visibleAndFetchedIds = this.visibleAndFetchedIds();

        //     if (visibleAndFetchedIds.length === 0) {
        //       visibleAndFetchedIds = Object.keys(this.fetchedTiles);
        //     }

        //     const maximumsPerTile = visibleAndFetchedIds
        //       .map(x => this.fetchedTiles[x])
        //       .map(tile => {
        //         const ind = this.getIndicesOfVisibleDataInTile(tile);
        //         return tile.tileData.denseDataExtrema.getMaxNonZeroInSubset(ind);
        //       });

        //     const max = Math.max(...maximumsPerTile);

        //     if (ignoreFixedScale) return max;

        //     return this.valueScaleMax !== null ? this.valueScaleMax : max;
        //   }

        // rerender tiles using the new options
        rerender(newOptions: any) {
            super.rerender(newOptions);

            this.options = newOptions;

            this.updateTile();

            this.rescaleTiles();
            this.draw();
        }

        updateTile() {
            const visibleAndFetched = this.visibleAndFetchedTiles();

            visibleAndFetched.forEach((tile: any) => {
                // deprecated
                // this.unFlatten(tile);
                this.preprocessTile(tile);
            });

            this.rescaleTiles();
        }

        draw() {
            super.draw();
        }
        drawTile() {} // prevent BarTracks draw method from having an effect
        exportSVG() {}
        getMouseOverHtml() {}
    }
    return new GeminiTrackClass(args);
}

const icon =
    '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// default
GeminiTrack.config = {
    type: 'gemini-track',
    datatype: ['multivec', 'epilogos'],
    local: false,
    orientation: '1d-horizontal',
    thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
    availableOptions: [
        'labelPosition',
        'labelColor',
        'labelTextOpacity',
        'labelBackgroundOpacity',
        'trackBorderWidth',
        'trackBorderColor',
        'trackType',
        'scaledHeight',
        'backgroundColor',
        'barBorder',
        'sortLargestOnTop',
        'axisPositionHorizontal' // TODO: support this
    ],
    defaultOptions: {
        labelPosition: 'none',
        labelColor: 'black',
        labelTextOpacity: 0.4,
        trackBorderWidth: 0,
        trackBorderColor: 'black',
        backgroundColor: 'white',
        barBorder: false,
        sortLargestOnTop: true,
        axisPositionHorizontal: 'left'
    }
};

export default GeminiTrack;
