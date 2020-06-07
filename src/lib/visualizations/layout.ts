import * as d3 from 'd3'
import { GeminiSpec, Track, GenericType, Channel, IsHiGlassTrack } from '../gemini.schema';
import { BoundingBox } from '../utils/bounding-box';
import { renderBetweenLink } from './link';
import { VIEW_PADDING } from './defaults';
import { renderHiGlass, HiGlassTrack } from './higlass';

export function renderLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    gm: GeminiSpec,
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void,
    left: number,
    top: number
) {
    g.selectAll('*').remove();

    // Generate layout data
    const tracksWithBB: { bb: BoundingBox, track: Track | GenericType<Channel> }[] = [];
    let cumY = top, cumX = left;
    gm.tracks.forEach(track => {
        if (gm.layout?.direction !== "horizontal") {
            tracksWithBB.push({
                bb: {
                    x: left, width: track.width as number,
                    y: cumY, height: track.height as number
                },
                track
            });
            cumY += track.height as number + VIEW_PADDING;
        }
        else {
            tracksWithBB.push({
                bb: {
                    x: cumX, width: track.width as number,
                    y: top, height: track.height as number
                },
                track
            });
            cumX += track.width as number + VIEW_PADDING;
        }
    });

    g.selectAll('rect')
        .data(tracksWithBB.filter(
            d => d.track.mark !== "link-between" && d.track.mark !== 'link-within' && d.track.mark !== 'empty'
        ))
        .enter()
        .append('rect')
        .attr('x', d => d.bb.x)
        .attr('width', d => d.bb.width)
        .attr('y', d => d.bb.y)
        .attr('height', d => d.bb.height)
        .attr('fill', '#F6F6F6')
        .attr('stroke', 'lightgray')
        .attr('stroke-width', 1)

    // Render links and bands
    renderBetweenLink(g, tracksWithBB.filter(d => d.track.mark === 'link-between'));

    // Render HiGlass tracks
    renderHiGlass(g, tracksWithBB.filter(d => IsHiGlassTrack(d.track.mark)), setHiGlassInfo);
}