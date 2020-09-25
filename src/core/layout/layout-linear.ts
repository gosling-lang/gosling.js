import * as d3 from 'd3';
import { GeminiSpec, IsEmptyTrack, BasicSingleTrack } from '../gemini.schema';
import { HiGlassTrack, renderHiGlass } from './higlass';
import { BoundingBox, getTrackPositionInfo } from '../utils/bounding-box';
import { renderBetweenLink } from './link';
import { TRACK_BG_STYLE } from './layout';

export function renderLinearLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    spec: GeminiSpec,
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void,
    boundingBox: BoundingBox
) {
    // generate layout data
    const trackInfo = getTrackPositionInfo(spec, boundingBox);

    // render the backgrounds of non-empty tracks
    g.selectAll('rect')
        .data(trackInfo.filter(d => !IsEmptyTrack(d.track)))
        .enter()
        .append('rect')
        .attr('x', d => d.boundingBox.x - 1)
        .attr('width', d => d.boundingBox.width + 2)
        .attr('y', d => d.boundingBox.y - 1)
        .attr('height', d => d.boundingBox.height + 2)
        .attr('fill', d => TRACK_BG_STYLE.background(d.track as BasicSingleTrack))
        .attr('stroke', d => TRACK_BG_STYLE.stroke(d.track as BasicSingleTrack))
        .attr('stroke-width', d => TRACK_BG_STYLE.strokeWidth(d.track as BasicSingleTrack));

    // render links and bands
    renderBetweenLink(g, trackInfo.filter(d => (d.track as any).mark === 'link-between') as any);

    // render HiGlass tracks
    renderHiGlass(
        trackInfo.filter(d => !IsEmptyTrack(d.track as any)),
        setHiGlassInfo
    );
}
