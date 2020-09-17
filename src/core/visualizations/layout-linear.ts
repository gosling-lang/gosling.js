import * as d3 from 'd3';
import { GeminiSpec, Track, IsHiGlassTrack, BasicSingleTrack } from '../gemini.schema';
import { HiGlassTrack, renderHiGlass } from './higlass';
import { BoundingBox } from '../utils/bounding-box';
import { TRACK_GAP } from './defaults';
import { renderBetweenLink } from './link';
import { TRACK_BG_STYLE } from './layout';
import { resolveSuperposedTracks } from '../../higlass-gemini-track/utils/superpose';

export function renderLinearLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    gm: GeminiSpec,
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void,
    boundingBox: BoundingBox
) {
    const wrap: number = gm.layout?.wrap ?? 999;

    // Generate layout data
    const trackInfo: {
        boundingBox: BoundingBox;
        track: Track;
    }[] = [];
    let cumX = boundingBox.x;
    let cumY = boundingBox.y;
    if (gm.layout?.direction === 'horizontal') {
        gm.tracks.forEach((track, i) => {
            trackInfo.push({
                track,
                boundingBox: {
                    x: cumX,
                    width: resolveSuperposedTracks(track)[0].width as number,
                    y: cumY,
                    height: resolveSuperposedTracks(track)[0].height as number
                }
            });
            cumX += (resolveSuperposedTracks(track)[0].width as number) + TRACK_GAP;
            if (i % wrap === wrap - 1) {
                cumX = boundingBox.x;
                cumY = cumY += (resolveSuperposedTracks(track)[0].height as number) + TRACK_GAP;
            }
        });
    } else {
        gm.tracks.forEach((track, i) => {
            trackInfo.push({
                track,
                boundingBox: {
                    x: cumX,
                    width: resolveSuperposedTracks(track)[0].width as number,
                    y: cumY,
                    height: resolveSuperposedTracks(track)[0].height as number
                }
            });
            cumY += (resolveSuperposedTracks(track)[0].height as number) + TRACK_GAP;
            if (i % wrap === wrap - 1) {
                cumX = cumX += (resolveSuperposedTracks(track)[0].width as number) + TRACK_GAP;
                cumY = boundingBox.y;
            }
        });
    }
    ///

    // Render track backgrounds
    g.selectAll('rect')
        .data(trackInfo)
        .enter()
        .append('rect')
        .attr('x', d => d.boundingBox.x - 1)
        .attr('width', d => d.boundingBox.width + 2)
        .attr('y', d => d.boundingBox.y - 1)
        .attr('height', d => d.boundingBox.height + 2)
        .attr('fill', d => TRACK_BG_STYLE.background(d.track as BasicSingleTrack))
        .attr('stroke', d => TRACK_BG_STYLE.stroke(d.track as BasicSingleTrack))
        .attr('stroke-width', d => TRACK_BG_STYLE.strokeWidth(d.track as BasicSingleTrack));

    // Render links and bands
    renderBetweenLink(g, trackInfo.filter(d => (d.track as any).mark === 'link-between') as any);

    // Render HiGlass tracks
    renderHiGlass(
        g,
        trackInfo.filter(d => IsHiGlassTrack(d.track as any)),
        setHiGlassInfo
    );
}
