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
    const wrap: number = gm.layout?.wrap ?? 999;

    // Generate layout data
    const trackInfo: { boundingBox: BoundingBox, track: Track | GenericType<Channel> }[] = [];
    let cumX = boundingBox.x
    let cumY = boundingBox.y
    if (gm.layout?.direction === 'horizontal') {
        gm.tracks.forEach((track, i) => {
            if (IsNotEmptyTrack(track)) {
                trackInfo.push({
                    track, boundingBox: {
                        x: cumX, width: track.width as number,
                        y: cumY, height: track.height as number
                    }
                })
                cumX += track.width as number + TRACK_GAP
                if (i % wrap === wrap - 1) {
                    cumX = boundingBox.x
                    cumY = cumY += track.height as number + TRACK_GAP
                }
            }
        })
    } else {
        gm.tracks.forEach((track, i) => {
            if (IsNotEmptyTrack(track)) {
                trackInfo.push({
                    track, boundingBox: {
                        x: cumX, width: track.width as number,
                        y: cumY, height: track.height as number
                    }
                })
                cumY += track.height as number + TRACK_GAP;
                if (i % wrap === wrap - 1) {
                    cumX = cumX += track.width as number + TRACK_GAP
                    cumY = boundingBox.y
                }
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
        .attr('stroke', d => trackStyle.stroke(d.track as Track))
        .attr('stroke-width', d => trackStyle.strokeWidth(d.track as Track))

    // Render links and bands
    renderBetweenLink(g, trackInfo.filter(d => d.track.mark === 'link-between'));

    // Render HiGlass tracks
    renderHiGlass(g, trackInfo.filter(d => IsHiGlassTrack(d.track)), setHiGlassInfo);
}