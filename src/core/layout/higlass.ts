import { BoundingBox } from '../utils/bounding-box';
import { Track } from '../gemini.schema';
import { compiler } from '../gemini-to-higlass';

export interface HiGlassTrack {
    viewConfig: any;
    boundingBox: BoundingBox;
}

export function renderHiGlass(
    tracksWithBB: {
        boundingBox: BoundingBox;
        track: Track;
    }[],
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void
) {
    const higlassInfo: HiGlassTrack[] = [];
    tracksWithBB.forEach(tb => {
        const { track, boundingBox: bb } = tb;

        // add a HiGlass view config
        higlassInfo.push({ boundingBox: bb, viewConfig: compiler(track, bb) });
    });
    setHiGlassInfo(higlassInfo);

    /////// DEBUG
    // const testHGInfo = tracksWithBB.map(tb => ({ boundingBox: tb.bb, viewConfig: testViewConfig }));
    // console.log(testHGInfo);
    // setHiGlassInfo(tracksWithBB.map(tb => ({
    //     boundingBox: tb.bb,
    //     viewConfig: testViewConfig
    // })));
    ///////
}
