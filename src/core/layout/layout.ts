import { PrGoslingSpec } from '../gosling.schema';
import { renderHiGlass } from './higlass';
import { getRelativeTrackInfo, Size } from '../utils/bounding-box';
import { HiGlassSpec } from '../higlass.schema';

export function compileLayout(spec: PrGoslingSpec, setHg: (hg: HiGlassSpec, size: Size) => void) {
    // Generate arrangement data
    const trackInfo = getRelativeTrackInfo(spec);

    // Render HiGlass tracks
    renderHiGlass(spec, trackInfo, setHg);
}
