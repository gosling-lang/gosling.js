import { scaleLinear, min, max } from 'd3';
import { findExtent, getMaxZoomLevel, findExtentByTrackType } from './utils/zoom';
import vis from './visualizations';

import { Track, getVisualizationType, getChannelRange } from '../lib/gemini.schema';
import { GeminiTrackModel } from '../lib/gemini-track-model';

// @ts-ignore
function GeminiTrack(HGC: any, ...args: any[]): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    const { colorToHex } = HGC.utils;

    class GeminiTrackClass extends HGC.tracks.BarTrack {
        private geminiModel: GeminiTrackModel;

        constructor(params: any[]) {
            const [context, options] = params;
            super(context, options);

            this.geminiModel = new GeminiTrackModel(this.options.spec);

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

            this.unFlatten(tile);

            // TODO: Metadata, such as field names, should be come from the server
            // This should replace the `unFlatten()`
            this.tabularizeTile(tile);

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
                    vis.drawGeminiTrack(HGC, this, tile, isNotMaxZoomLevel);
                    break;
                default:
                    console.warn('Not supported visualization');
                    break;
            }
        }

        // y scale should be synced across all tiles
        syncMaxAndMin() {
            const visibleAndFetched = this.visibleAndFetchedTiles();

            visibleAndFetched.map((tile: any) => {
                if (tile.minValue + tile.maxValue > this.maxAndMin.min + this.maxAndMin.max) {
                    this.maxAndMin.min = tile.minValue;
                    this.maxAndMin.max = tile.maxValue;
                }
            });
        }

        // rescales the sprites of all visible tiles when zooming and panning
        rescaleTiles() {
            const visibleAndFetched = this.visibleAndFetchedTiles();

            this.syncMaxAndMin();

            visibleAndFetched.map((tile: any) => {
                const valueToPixels = scaleLinear()
                    .domain([0, this.maxAndMin.max + Math.abs(this.maxAndMin.min)])
                    .range([0, this.dimensions[1]]);
                const newZero = this.dimensions[1] - valueToPixels(Math.abs(this.maxAndMin.min));
                const height = valueToPixels(tile.minValue + tile.maxValue);
                const sprite = tile.sprite;
                const y = newZero - valueToPixels(tile.maxValue);

                if (sprite) {
                    sprite.height = height;
                    sprite.y = y;
                }
            });
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

        // un-flatten data into matrix of tile.tileData.shape[0] x tile.tileData.shape[1]
        unFlatten(tile: any) {
            if (tile.matrix) {
                return tile.matrix;
            }

            const flattenedArray = tile.tileData.dense;

            const matrix = this.simpleUnFlatten(tile, flattenedArray);

            const maxAndMin = findExtent(matrix);

            tile.matrix = matrix;
            tile.maxValue = maxAndMin.max;
            tile.minValue = maxAndMin.min;

            this.syncMaxAndMin();

            return matrix;
        }

        tabularizeTile(tile: any) {
            if (tile.tabularData) return;

            // TODO: These data should be come from the server
            const N_FIELD = '__N__',
                Q_FIELD = '__Q__',
                G_FIELD = '__G__';
            const CATEGORIES = ['A', 'T', 'G', 'C'];
            const numericValues = tile.tileData.dense;
            const numOfCategories = min([tile.tileData.shape[0], CATEGORIES.length]); // TODO:
            const numOfGenomicPositions = tile.tileData.shape[1];
            ///

            const tabularData = [];

            for (let i = 0; i < numOfCategories; i++) {
                for (let j = 0; j < numOfGenomicPositions; j++) {
                    tabularData.push({
                        [N_FIELD]: CATEGORIES[i],
                        [Q_FIELD]: numericValues[numOfGenomicPositions * i + j],
                        [G_FIELD]: j
                    });
                }
            }

            tile.tabularData = tabularData;

            const isMaxZoomLevel = tile?.tileData?.zoomLevel !== getMaxZoomLevel();
            const isStackedBarChart = this.geminiModel.getVisualizationType(isMaxZoomLevel);
            const { min: minValue, max: maxValue } = findExtentByTrackType(tabularData, isStackedBarChart);

            tile.maxValue = maxValue;
            tile.minValue = minValue;

            // we need to sync the domain of y-axis so that all tiles are aligned each other
            this.syncMaxAndMin();
        }

        simpleUnFlatten(tile: any, data: any) {
            const shapeX = tile.tileData.shape[0]; // number of different nucleotides in each bar
            const shapeY = tile.tileData.shape[1]; // number of bars

            // matrix[0] will be [flattenedArray[0], flattenedArray[256], flattenedArray[512], etc.]
            // because of how flattenedArray comes back from the server.
            const matrix: number[][] = [];
            for (let i = 0; i < shapeX; i++) {
                // 6
                for (let j = 0; j < shapeY; j++) {
                    // 256;
                    let singleBar: number[];
                    if (matrix[j] === undefined) {
                        singleBar = [];
                    } else {
                        singleBar = matrix[j];
                    }
                    singleBar.push(data[shapeY * i + j]);
                    matrix[j] = singleBar;
                }
            }

            return matrix;
        }

        // deprecated
        // Map each value in every array in the matrix to a color depending on position in the array
        // Divides each array into positive and negative sections and sorts them
        mapOriginalColors(matrix: any, alt: boolean) {
            // mapping colors to unsorted values
            const matrixWithColors: any[] = [];
            matrix.forEach((row: any) => {
                const columnColors: any[] = [];
                row.forEach((value: any, i: number) => {
                    columnColors[i] = {
                        value: isNaN(value) ? 0 : value,
                        color: getChannelRange(this.geminiModel.spec(alt), 'color')[i] as any
                    };
                });

                // separate positive and negative array values
                const positive: any[] = [];
                const negative: any[] = [];
                columnColors.forEach(color => {
                    if (color.value >= 0) {
                        positive.push(color);
                    } else if (color.value < 0) {
                        negative.push(color);
                    }
                });
                if (this.options.sortLargestOnTop) {
                    positive.sort((a, b) => a.color - b.color);
                    negative.sort((a, b) => b.value - a.value);
                } else {
                    positive.sort((a, b) => b.value - a.value);
                    negative.sort((a, b) => a.value - b.value);
                }

                matrixWithColors.push([positive, negative]);
            });
            return matrixWithColors;
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

        // rerender all tiles every time track size is changed
        setDimensions(newDimensions: any) {
            this.oldDimensions = this.dimensions;
            super.setDimensions(newDimensions);

            const visibleAndFetched = this.visibleAndFetchedTiles();
            visibleAndFetched.map((a: any) => this.initTile(a));
        }

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
                this.unFlatten(tile);
                this.tabularizeTile(tile);
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
