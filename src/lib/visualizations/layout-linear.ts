import * as d3 from "d3";
import { GeminiSpec, Track, GenericType, Channel, IsNotEmptyTrack, IsHiGlassTrack } from "../gemini.schema";
import { HiGlassTrack, renderHiGlass } from "./higlass";
import { BoundingBox } from "../utils/bounding-box";
import { TRACK_GAP } from "./defaults";
import { renderBetweenLink } from "./link";
import { trackStyle } from "./layout";

export function renderLinearLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    gm: GeminiSpec,
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void,
    boundingBox: BoundingBox
) {
    // Generate layout data
    // TODO: support `wrap`
    const trackInfo: { boundingBox: BoundingBox, track: Track | GenericType<Channel> }[] = [];
    if (gm.layout?.direction === 'horizontal') {
        let cumX = boundingBox.x
        gm.tracks.forEach(track => {
            if (IsNotEmptyTrack(track)) {
                trackInfo.push({
                    track, boundingBox: {
                        x: cumX, width: track.width as number,
                        y: boundingBox.y, height: track.height as number
                    }
                })
                cumX += track.width as number + TRACK_GAP;
            }
        })
    } else {
        let cumY = boundingBox.y
        gm.tracks.forEach(track => {
            if (IsNotEmptyTrack(track)) {
                trackInfo.push({
                    track, boundingBox: {
                        x: boundingBox.x, width: track.width as number,
                        y: cumY, height: track.height as number
                    }
                })
                cumY += track.height as number + TRACK_GAP;
            }
        })
    }
    ///

    // Render track backgrounds
    g.selectAll('rect')
        .data(trackInfo)
        .enter()
        .append('rect')
        .attr('x', d => d.boundingBox.x)
        .attr('width', d => d.boundingBox.width)
        .attr('y', d => d.boundingBox.y)
        .attr('height', d => d.boundingBox.height)
        .attr('fill', d => trackStyle.background(d.track as Track))
        .attr('stroke', trackStyle.stroke())
        .attr('stroke-width', trackStyle.strokeWidth())

    // Render links and bands
    renderBetweenLink(g, trackInfo.filter(d => d.track.mark === 'link-between'));

    // Render HiGlass tracks
    renderHiGlass(g, trackInfo.filter(d => IsHiGlassTrack(d.track)), setHiGlassInfo);
}