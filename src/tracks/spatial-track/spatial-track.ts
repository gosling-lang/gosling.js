import * as chs from "chromospace";

export type SpatialTrackOptions = {
    color: string | undefined;
    test: string | undefined;
    data3D: string | undefined;
    spatial: { //~ spatial encoding
        x: string;
        y: string;
        z: string;
    };
};

export function createSpatialTrack(options: SpatialTrackOptions, container: HTMLDivElement) {
    hiFromSpatialTrack();
    const viewConfig = {
        scale: 0.01,
        color: options.color,
    };
    let chromatinScene = chs.initScene();
    console.warn(`options.test: ${options.test}`);

    //~ WIP: it's probably dumb to fetch a sample dataset when none is specified...
    const dataToLoad = decideDataToLoad(options);

    const s = chs.loadFromURL(dataToLoad, { center: true, normalize: true });
    s.then(result => {

        if (!result) {
            console.warn("error loading remote file");
            return undefined;
        }

        const isModel = "parts" in result; //~ ChromatinModel has .parts
        if (isModel) {
            chromatinScene = chs.addModelToScene(chromatinScene, result, viewConfig);
        } else {
            chromatinScene = chs.addChunkToScene(chromatinScene, result, viewConfig);
        }
        const [_, canvas] = chs.display(chromatinScene, { alwaysRedraw: false });

        container.appendChild(canvas);
    }).catch(error => {
        console.log(error);
    });
}

/* 
 * TODO: I imagine when people specify the 3D data via 
 * something else than a .arrow file, I'll want to create 
 * an arrow file from the values I pulled from that other file 
 * */
function preprocessData() {
}

/* This is just for debugging. It should be replaced by using the data fetchers interface */
function decideDataToLoad(options: SpatialTrackOptions) {
    const sampleModel = "https://pub-5c3f8ce35c924114a178c6e929fc3ac7.r2.dev/Tan-2018_GSM3271353_gm12878_07.arrow";
    const sampleChunk = "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/refs/heads/main/dros.3.arrow";
    let dataToLoad = options.data3D;
    if (!dataToLoad) {
        const randNum = Math.random() * 2;
        dataToLoad = (randNum > 1.0) ? sampleModel : sampleChunk;
    }
    return dataToLoad;
}

export function hiFromSpatialTrack() {
    console.log("hi from spatial track");
}
