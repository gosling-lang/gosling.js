import { GeminidSpec } from '../geminid.schema';
import { renderHiGlass } from './higlass';
import { getArrangement, Size } from '../utils/bounding-box';
import { HiGlassSpec } from '../higlass.schema';

export function compileLayout(spec: GeminidSpec, setHg: (hg: HiGlassSpec, size: Size) => void) {
    // generate layout data
    const trackInfo = getArrangement(spec);

    // render HiGlass tracks
    renderHiGlass(spec, trackInfo, setHg);
}
