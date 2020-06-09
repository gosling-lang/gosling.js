import * as d3 from 'd3'
import { GeminiSpec, Track } from '../gemini.schema';
import { HiGlassTrack } from './higlass';
import { renderCircularLayout } from './layout-circular';
import { renderLinearLayout } from './layout-linear';
import { BoundingBox } from '../utils/bounding-box';

export function renderLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    gm: GeminiSpec,
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void,
    boundingBox: BoundingBox
) {
    g.selectAll('*').remove();

    if (gm.layout?.type === 'circular') {
        renderCircularLayout(g, gm, setHiGlassInfo, boundingBox)
    } else {
        renderLinearLayout(g, gm, setHiGlassInfo, boundingBox)
    }
}

export const trackStyle = {
    background: (track: Track) => track.style?.background ?? 'white',
    stroke: () => 'lightgray',
    strokeWidth: () => 1
}