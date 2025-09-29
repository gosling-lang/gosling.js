import type { ChannelValue, SpatialTrack, Color, Size } from '@gosling-lang/gosling-schema';
import * as uchi from 'uchimata';
import type { CsvDataFetcherClass, LoadedTiles } from 'src/data-fetchers/csv/csv-data-fetcher';
import { tableFromArrays, tableFromIPC, tableToIPC, Type } from '@uwdata/flechette';
import { transform } from '../../core/utils/data-transform';
import { getTabularData } from '../gosling-track/data-abstraction';
import { assert } from '../../core/utils/assert';

export type OverlaidSpatialTrack = Partial<SpatialTrack> & {
    // This is a property internally used when compiling
    _overlay: Partial<Omit<SpatialTrack, 'height' | 'width' | 'layout' | 'title' | 'subtitle'>>[];
};

export type SpatialTrackOptions = {
    spec: SpatialTrack | OverlaidSpatialTrack;
};

const ERROR_COLOR = '#ff00ff';

async function transformObjectToArrow(t: LoadedTiles, options: SpatialTrackOptions): Promise<Uint8Array | null> {
    // Some genomics file formats, such as BigWig and MultiVec, do not have tabular data already stored.
    // So, create one if missing by running `getTabularData()`.
    // The tile ID of '0.0' extracts all data for a given file at the lowest resolution.
    let tabularData = t['0.0'].tabularData ?? getTabularData(options.spec, t['0.0']);

    tabularData = structuredClone(tabularData);
    for (const t of options.spec.dataTransform ?? []) {
        tabularData = await transform(t, tabularData, undefined, options.spec.assembly);
    }
    const xArr: number[] = [];
    const yArr: number[] = [];
    const zArr: number[] = [];
    const chrArr: string[] = [];
    const coordArr: number[] = [];

    const parseAsNumber = (e: string | number): number => {
        if (typeof e === 'string') {
            return parseFloat(e);
        }
        return e;
    };
    console.warn(options);

    assert(options.spec.spatial, 'Spatial field is required for spatial track');
    const fieldForSpatialX = options.spec.spatial.x;
    const fieldForSpatialY = options.spec.spatial.y;
    const fieldForSpatialZ = options.spec.spatial.z;
    const fieldForSpatialChr = options.spec.spatial.chr;
    const fieldForSpatialCoord = options.spec.spatial.coord;
    console.warn(
        `fieldForSpatialX: ${fieldForSpatialX},\nfieldForSpatialY: ${fieldForSpatialY},\nfieldForSpatialZ: ${fieldForSpatialZ}`
    );
    console.warn(`fieldForSpatialChr : ${fieldForSpatialChr},\nfieldForSpatialCoord: ${fieldForSpatialCoord}`);

    for (const [i] of tabularData.entries()) {
        // same as `xArr.push(parseAsNumber(tabularData[i].x));` but here I can use the string from the `"x": { "field": "whatever-value" }` instead of hard-coded ".x"
        xArr.push(parseAsNumber(tabularData[i][fieldForSpatialX]));
        yArr.push(parseAsNumber(tabularData[i][fieldForSpatialY]));
        zArr.push(parseAsNumber(tabularData[i][fieldForSpatialZ]));
        chrArr.push(tabularData[i][fieldForSpatialChr] as string);
        coordArr.push(parseAsNumber(tabularData[i][fieldForSpatialCoord]));
    }
    let arrays = {
        x: xArr,
        y: yArr,
        z: zArr,
        chr: chrArr,
        coord: coordArr
    };

    // Add additional fields joined by the join operation
    const allFields = Object.keys(tabularData[0] ?? {});
    const alreadyAddedFields: string[] = [
        fieldForSpatialX,
        fieldForSpatialY,
        fieldForSpatialZ,
        fieldForSpatialChr,
        fieldForSpatialCoord
    ];
    const additionalFields = [];
    for (const c of allFields) {
        if (alreadyAddedFields.indexOf(c) === -1) {
            additionalFields.push(c);
        }
    }
    const suppArray: Record<string, (string | number)[]> = {};
    for (const d of tabularData) {
        for (const f of additionalFields) {
            if (!suppArray[f]) {
                suppArray[f] = [];
            }
            suppArray[f].push(Number.isNaN(+d[f]) ? d[f] : parseAsNumber(d[f]));
        }
    }
    arrays = { ...suppArray, ...arrays };

    const table = tableFromArrays(arrays);
    const buffer = tableToIPC(table, { format: 'file' });
    return buffer;
}

function fetchValuesFromColumn(columnName: string, arrowIpc: Uint8Array): number[] | string[] | undefined {
    const table = tableFromIPC(arrowIpc);
    const column = table.getChild(columnName);
    const t = column.type;
    //~ got the hint for checking types of columns from:
    // https://github.com/manzt/quak/blob/d89ccecfc7bb18563cea8c3e62c005c059918406/lib/utils/formatting.ts#L27
    if ((t.typeId === Type.Int) || (t.typeId === Type.Float)) {
        return column.toArray() as number[];
    } else if ((t.typeId === Type.Dictionary) || (t.typeId === Type.Utf8)) {
        return column.toArray() as string[];
    }

    return undefined;
}

function findMinAndMaxOfColumn(column: Int16Array | number[]): [number, number] {
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const v of column) {
        minVal = Math.min(minVal, v);
        maxVal = Math.max(maxVal, v);
    }
    return [minVal, maxVal];
}

//~ TODO: make more generic
function getRange(size: Size): [number, number] {
    if (size.range) {
        //~ TODO: yeah...this is ugly
        return [size.range[0] as number, size.range[1] as number];
    } else {
        return [0.01, 0.001];
    }
}

/**
 * Just a utility function...should be removed
 */
const randomColors = (n: number) => {
    const colors = [];
    for (let j = 0; j < n; j++) {
        let colorStr = '#';
        for (let i = 0; i < 6; i++) {
            const maxNum = 16; //~ maximum numerical value: 0 - 16 (F)
            const randNum = Math.floor(Math.random() * maxNum);
            colorStr += randNum.toString(16); //~ 16 is base
        }
        colors.push(colorStr);
    }
    return colors;
};

//~ TODO: lifted from chromospace/uchimata, should probably export instead
export type AssociatedValues = {
    values: number[] | string[];
    min: number;
    max: number;
};
export type AssociatedValuesColor = AssociatedValues & {
    /** Either a colorscale name (e.g., "viridis") or an array of categorical colors (e.g., ["#123456", "#abcdef", ...]) */
    colorScale: string | string[];
};
export type AssociatedValuesScale = AssociatedValues & {
    scaleMin: number;
    scaleMax: number;
};
//export type ViewConfig = {
//    scale?: number | AssociatedValuesScale;
//    color?: string | AssociatedValuesColor;
//    mark?: MarkTypes;
//    links?: boolean;
//};

/**
 * Returns something we can feed to chromospace view config
 */
function handleColorField(arrowIpc: Uint8Array, color?: ChannelValue | Color | string): string | AssociatedValuesColor {
    if (color === undefined) {
        return 'red';
    } else if (typeof color === 'string') {
        return color;
    } else if ('value' in color) {
        return color.value as string;
    } else if ('field' in color) {
        if (!color.type) {
            color.type = 'nominal'; // assume 'nominal' by default?
        }
        if (color.type === 'nominal') {
            assert(color.field, "color.field is required for nominal color");
            const values = fetchValuesFromColumn(color.field, arrowIpc) as string[]; //~TODO: forcing to string[] not good
            const colScale = color.range ?? randomColors(50); //~ just some big number

            assert(
                typeof colScale === "string" ||
                (Array.isArray(colScale) && colScale.every(it => typeof it === 'string'))
                , "color.range must be a string or an array of strings");

            const colorConfig = {
                values: [...values],
                min: 0,
                max: values.length - 1,
                colorScale: colScale
            };
            return colorConfig;
        } else if (color.type === 'quantitative') {
            assert(color.field, "color.field is required for quantitative color");
            const values = fetchValuesFromColumn(color.field, arrowIpc);
            assert(values, "color.field must be a valid field in the data table");
            assert(values.every(it => typeof it === 'number'), "color.field must be a numeric field");
            const [minVal, maxVal] = color.domain ? [color.domain[0], color.domain[1]] : findMinAndMaxOfColumn(values);
            const colScale = color.range ?? 'viridis';
            assert(
                typeof colScale === "string" ||
                (Array.isArray(colScale) && colScale.every(it => typeof it === 'string'))
                , "color.range must be a string or an array of strings");
            const colorConfig = {
                values: [...values],
                min: Number(minVal),
                max: Number(maxVal),
                colorScale: colScale
            };
            return colorConfig;
        } else {
            return ERROR_COLOR;
        }
    } else {
        return ERROR_COLOR; // error color
    }
}

//~ I see a case for a generic impl for color and size...
function handleSizeField(arrowIpc: Uint8Array, size?: ChannelValue | Size | number): number | AssociatedValuesScale {
    if (size === undefined) {
        return 0.01;
    } else if (typeof size === 'number') {
        return size;
    } else if ('value' in size) {
        return size.value as number;
    } else if ('field' in size) {
        if (!size.type) {
            size.type = 'quantitative'; // assume 'nominal' by default?
        }
        if (size.type === 'nominal') {
            console.warn('not implemented!');
        } else if (size.type === 'quantitative') {
            assert(size.field, "size.field is required for quantitative size");
            const values = fetchValuesFromColumn(size.field, arrowIpc);
            const [rangeMax, rangeMin] = getRange(size);
            console.warn(`size.field = ${size.field}`);
            console.warn(values);
            assert(values, "size.field must be a valid field in the data table");
            assert(values.every(it => typeof it === 'number'), "size.field must be a numeric field");
            const [minVal, maxVal] = findMinAndMaxOfColumn(values);
            const sizeConfig = {
                values: [...values],
                min: minVal,
                max: maxVal,
                scaleMin: rangeMin,
                scaleMax: rangeMax
            };
            return sizeConfig;
        } else {
            return 0.01;
        }
    }

    return 0.01;
}

export function createSpatialTrack(
    options: SpatialTrackOptions,
    dataFetcher: CsvDataFetcherClass,
    container: HTMLDivElement
) {
    console.warn('SPEC OPTIONS', options);
    dataFetcher.tilesetInfo(info => {
        console.warn('info', info);
        dataFetcher.fetchTilesDebounced(
            async t => {
                console.warn('CSV tiles: ~~~~~~~~');
                console.warn(t);
                if (!t['0.0'].tileWidth) {
                    // This information is needed to create tabular data (i.e., running getTabularData())
                    t['0.0'].tileWidth = info.max_width;
                }

                const ipcBuffer = await transformObjectToArrow(t, options);
                if (!ipcBuffer) {
                    console.error('could not tranform into Apache Arrow');
                    return;
                }
                console.warn('spec', options.spec);
                let chromatinScene = uchi.initScene();
                let tracks: SpatialTrack[] = [];
                if ('_overlay' in options.spec) {
                    tracks = options.spec._overlay as SpatialTrack[]; //TODO: okay?
                } else {
                    tracks = [options.spec];
                }
                // const tracks = options.spec._overlay ?? [options.spec];
                for (const ov of tracks) {
                    console.warn('ov', ov);

                    const color = handleColorField(ipcBuffer, ov.color);
                    const scale = handleSizeField(ipcBuffer, ov.size);
                    assert(ov.mark === "sphere" || ov.mark === "octahedron" || ov.mark === "box", "Unsupported mark type for spatial view");
                    const viewConfig = {
                        scale: scale,
                        color: color,
                        mark: ov.mark
                    };

                    let s = uchi.load(ipcBuffer.slice().buffer, { center: true, normalize: true });

                    const filterTransform = (ov.dataTransform ?? []).find(t => t.type === 'filter');
                    if (filterTransform) {
                        const field: string = filterTransform.field;

                        assert(field === 'chr', "Field for transform should be 'chr'");
                        assert('oneOf' in filterTransform, 'oneOf is required for this filter transform');

                        const oneOf = filterTransform.oneOf;
                        const first = oneOf[0];

                        assert(typeof first === 'string', 'only string is supported for chromosome filtering');

                        const res = await uchi.selectChromosome(s.data, first);
                        console.warn(`selectChromosome result: res.numRows = ${res.numRows}`);
                        if (res) {
                            s = { data: res, name: `Filtered structure (${oneOf})` };
                        }
                    }
                    chromatinScene = uchi.addStructureToScene(chromatinScene, s, viewConfig);
                }
                const [, createdCanvas] = uchi.display(chromatinScene, { alwaysRedraw: false, withHUD: false });
                container.appendChild(createdCanvas);
            },
            ['0.0']
        );
    });
}
