import { GeminiSpec, Track, Layout } from '../gemini.schema';
import { renderHiGlass } from './higlass';
import { getTrackArrangementInfo, TrackInfo } from '../utils/bounding-box';
import { HiGlassSpec } from '../higlass.schema';

export function renderLayout(spec: GeminiSpec, setHg: (hg: HiGlassSpec) => void) {
    // generate layout data
    const trackInfo = getTrackArrangementInfo(spec, true) as TrackInfo[];

    // render HiGlass tracks
    renderHiGlass(trackInfo, setHg);
}

/**
 * Convert the vertical-direction layout of tracks to the identical, horizontal-version, tracks.
 * This is deprecated since this cannot support some specifications (e.g., six tracks with `wrap` === 3).
 * @param gm A Gemini specification.
 */
export function convertLayout(gm: GeminiSpec) {
    if (gm.layout?.direction !== 'vertical') {
        return gm;
    }
    const wrap = (gm.layout.wrap ?? 0) > gm.tracks.length ? gm.tracks.length : gm.layout.wrap ?? gm.tracks.length;
    const newWrap = Math.ceil(gm.tracks.length / wrap);

    const newLayout: Layout = {
        ...gm.layout,
        direction: 'horizontal',
        wrap: newWrap
    };

    const tracks = gm.tracks;
    const newTracks: Track[] = [];
    for (let remainder = 0; remainder < wrap; remainder++) {
        newTracks.push(...tracks.filter((t, i) => i % wrap === remainder));
    }

    return {
        ...gm,
        layout: newLayout,
        tracks: newTracks
    };
}
