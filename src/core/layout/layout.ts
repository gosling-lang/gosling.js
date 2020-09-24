import * as d3 from 'd3';
import { GeminiSpec, Track, Layout, BasicSingleTrack } from '../gemini.schema';
import { HiGlassTrack } from './higlass';
import { BoundingBox } from '../utils/bounding-box';
import { renderCircularLayout } from './layout-circular';
import { renderLinearLayout } from './layout-linear';

export const TRACK_BG_STYLE = {
    background: (track: BasicSingleTrack) => track.style?.background ?? 'white',
    stroke: (track: BasicSingleTrack) => track.style?.stroke ?? '#e0e0e0',
    strokeWidth: (track: BasicSingleTrack) => track.style?.strokeWidth ?? 0.5
};

export function renderLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    gm: GeminiSpec,
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void,
    boundingBox: BoundingBox
) {
    g.selectAll('*').remove();

    if (gm.layout?.type === 'circular') {
        renderCircularLayout(g, gm, setHiGlassInfo, boundingBox);
    } else {
        renderLinearLayout(g, gm, setHiGlassInfo, boundingBox);
    }
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
