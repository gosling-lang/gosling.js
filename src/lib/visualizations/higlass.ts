import { BoundingBox } from '../utils/bounding-box';
import { Track, GenericType, Channel } from '../gemini.schema';

export interface HiGlassTrack {
    viewConfig: Object
    boundingBox: BoundingBox,
}

export function renderHiGlass(
    g: d3.Selection<SVGGElement, any, any, any>,
    tracksWithBB: { bb: BoundingBox, track: Track | GenericType<Channel> }[],
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void
) {

}