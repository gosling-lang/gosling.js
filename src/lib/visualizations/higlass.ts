import { BoundingBox } from '../utils/bounding-box';
import { Track, GenericType, Channel } from '../gemini.schema';
import testViewConfig from '../test/higlass/hg-only-heatmap.json';

export interface HiGlassTrack {
    viewConfig: Object
    boundingBox: BoundingBox,
}

export function renderHiGlass(
    g: d3.Selection<SVGGElement, any, any, any>,
    tracksWithBB: { bb: BoundingBox, track: Track | GenericType<Channel> }[],
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void
) {
    tracksWithBB.forEach(tb => {
        const { track, bb } = tb;
        // ...
    })
    const testHGInfo = tracksWithBB.map(tb => ({ boundingBox: tb.bb, viewConfig: testViewConfig }));
    console.log(testHGInfo);
    setHiGlassInfo(tracksWithBB.map(tb => ({
        boundingBox: tb.bb,
        viewConfig: testViewConfig
    })));
}