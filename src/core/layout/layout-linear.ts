import { GeminiSpec } from '../gemini.schema';
import { renderHiGlass } from './higlass';
import { getTrackArrangementInfo, TrackInfo } from '../utils/bounding-box';
import { HiGlassSpec } from '../higlass.schema';

export function renderLinearLayout(spec: GeminiSpec, setHg: (hg: HiGlassSpec) => void) {
    // generate layout data
    const trackInfo = getTrackArrangementInfo(spec, true) as TrackInfo[];

    // render HiGlass tracks
    renderHiGlass(trackInfo, setHg);
}
