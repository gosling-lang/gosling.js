import { GeminiSpec } from '../gemini.schema';
import { renderHiGlass } from './higlass';
import { getArrangement } from '../utils/bounding-box';
import { HiGlassSpec } from '../higlass.schema';

export function compileLayout(spec: GeminiSpec, setHg: (hg: HiGlassSpec) => void) {
    // generate layout data
    const trackInfo = getArrangement(spec);

    // render HiGlass tracks
    renderHiGlass(trackInfo, setHg);
}
