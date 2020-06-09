import { BoundingBox } from '../utils/bounding-box';
import { Track, GenericType, Channel } from '../gemini.schema';
import { compiler } from '../higlass/gemini-to-higlass';
import testViewConfig from '../test/higlass/hg-only-heatmap.json';

export interface HiGlassTrack {
    viewConfig: Object
    boundingBox: BoundingBox,
}

export function renderHiGlass(
    g: d3.Selection<SVGGElement, any, any, any>,
    tracksWithBB: { boundingBox: BoundingBox, track: Track | GenericType<Channel> }[],
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void
) {
    const hiGlassInfo: HiGlassTrack[] = [];
    tracksWithBB.forEach(tb => {
        const { track, boundingBox: bb } = tb;

        // add a HiGlass view config
        hiGlassInfo.push({ boundingBox: bb, viewConfig: compiler(track, bb) });
    })
    setHiGlassInfo(hiGlassInfo);

    /////// DEBUG
    // const testHGInfo = tracksWithBB.map(tb => ({ boundingBox: tb.bb, viewConfig: testViewConfig }));
    // console.log(testHGInfo);
    // setHiGlassInfo(tracksWithBB.map(tb => ({
    //     boundingBox: tb.bb,
    //     viewConfig: testViewConfig
    // })));
    ///////
}