import type { OverlaidTrack, SingleTrack } from "@gosling-lang/gosling-schema";
import * as chs from "chromospace";
import type { CsvDataFetcherClass, LoadedTiles } from "src/data-fetchers/csv/csv-data-fetcher";
import { tableFromArrays, tableToIPC } from "@uwdata/flechette";

export type SpatialTrackOptions = {
    spec: SingleTrack | OverlaidTrack;
    color: string | undefined;
    test: string | undefined;
    data3D: string | undefined;
    spatial: { //~ spatial encoding
        x: string;
        y: string;
        z: string;
    };
};

function transformObjectToArrow(t: LoadedTiles, options: SpatialTrackOptions): Uint8Array | null {
    const tabularData = t['0.0'].tabularData; //~ TODO: tile id
    const xArr: number[] = [];
    const yArr: number[] = [];
    const zArr: number[] = [];

    const parseAsNumber = (e: string | number): number => {
        if (typeof e === 'string') {
            return parseFloat(e);
        }
        return e;
    }
    console.log(options);

    const fieldForSpatialX = options.spec.spatial.x;
    const fieldForSpatialY = options.spec.spatial.y;
    const fieldForSpatialZ = options.spec.spatial.z;
    console.log(`fieldForSpatialX: ${fieldForSpatialX},\nfieldForSpatialY: ${fieldForSpatialY},\nfieldForSpatialZ: ${fieldForSpatialZ}`);

    for (let i = 0; i < tabularData.length; i++) {
        // same as `xArr.push(parseAsNumber(tabularData[i].x));` but here I can use the string from the `"x": { "field": "whatever-value" }` instead of hard-coded ".x"
        xArr.push(parseAsNumber(tabularData[i][fieldForSpatialX]));
        yArr.push(parseAsNumber(tabularData[i][fieldForSpatialY]));
        zArr.push(parseAsNumber(tabularData[i][fieldForSpatialZ]));
    }
    const arrays = {
        x: xArr,
        y: yArr,
        z: zArr,
    };
    const table = tableFromArrays(arrays);
    const buffer = tableToIPC(table, { format: "file" });
    return buffer;
}

export function createSpatialTrack(options: SpatialTrackOptions, dataFetcher: CsvDataFetcherClass, container: HTMLDivElement) {
    const viewConfig = {
        scale: 0.01,
        color: options.color,
    };
    let chromatinScene = chs.initScene();
    console.warn(`options.test: ${options.test}`);
    dataFetcher.tilesetInfo((info) => {
        console.log("info");
        console.log(info);
        console.log("dataConfig");
        console.log(dataFetcher.dataConfig);
    });
    dataFetcher.fetchTilesDebounced((t) => {
        console.log('CSV tiles: ~~~~~~~~');
        console.log(t);
        const ipcBuffer = transformObjectToArrow(t, options);
        if (ipcBuffer) {
            const s = chs.load(ipcBuffer.buffer, { center: true, normalize: true });

            const result = s;

            const isModel = "parts" in result; //~ ChromatinModel has .parts
            if (isModel) {
                chromatinScene = chs.addModelToScene(chromatinScene, result, viewConfig);
            } else {
                chromatinScene = chs.addChunkToScene(chromatinScene, result, viewConfig);
            }
            const [_, canvas] = chs.display(chromatinScene, { alwaysRedraw: false });

            container.appendChild(canvas);
        } else {
        }

    }, ["0.0", "1.0"]);

    ////~ WIP: it's probably dumb to fetch a sample dataset when none is specified...
    //const dataToLoad = decideDataToLoad(options);
    //
    ////chs.load
    //const s = chs.loadFromURL(dataToLoad, { center: true, normalize: true });
    //s.then(result => {
    //
    //    if (!result) {
    //        console.warn("error loading remote file");
    //        return undefined;
    //    }
    //
    //    const isModel = "parts" in result; //~ ChromatinModel has .parts
    //    if (isModel) {
    //        chromatinScene = chs.addModelToScene(chromatinScene, result, viewConfig);
    //    } else {
    //        chromatinScene = chs.addChunkToScene(chromatinScene, result, viewConfig);
    //    }
    //    const [_, canvas] = chs.display(chromatinScene, { alwaysRedraw: false });
    //
    //    container.appendChild(canvas);
    //}).catch(error => {
    //    console.log(error);
    //});
}
