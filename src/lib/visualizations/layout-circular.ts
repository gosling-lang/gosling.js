import * as d3 from "d3";
import { GeminiSpec, Track, GenericType, Channel, IsNotEmptyTrack } from "../gemini.schema";
import { BoundingBox } from "../utils/bounding-box";
import { HiGlassTrack } from "./higlass";
import { TRACK_GAP } from "./defaults";
import { DefaultArcObject } from "d3";
import { trackStyle } from "./layout";

interface ArcInfo {
    innerRadius: number
    outerRadius: number
    startAngle: number
    endAngle: number
}

export function renderCircularLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    gm: GeminiSpec,
    setHiGlassInfo: (higlassInfo: HiGlassTrack[]) => void,
    boundingBox: BoundingBox
) {
    const wrap: number = gm.layout?.wrap ?? 999;
    const totalRadius = boundingBox.height / 2.0
    const totalLength = d3.sum(
        // Look into the first row
        gm.layout?.direction === 'horizontal' ?
            gm.tracks.filter((t, i) => i < wrap)
                .map(d => IsNotEmptyTrack(d) ? d.width as number : 0) :
            gm.tracks.filter((t, i) => i % wrap == 0)
                .map(d => IsNotEmptyTrack(d) ? d.width as number : 0)

    )
    const angleGap = Math.PI * 2 / 160.0;

    // Generate layout data
    const trackInfo: { arc: ArcInfo, track: Track | GenericType<Channel> }[] = []
    let cumDonutBandWidth = 0
    let cumLength = 0
    if (gm.layout?.direction === "horizontal") {
        // adjacently place first
        gm.tracks.forEach((track, i) => {
            if (IsNotEmptyTrack(track)) {
                const donutBandWidth = track.height as number // Height is used for the width of donut band.
                const length = track.width as number // Width is used for calculating the proportion of the circumference.
                const startAngle = (Math.PI * 2) * cumLength / totalLength + angleGap
                const endAngle = startAngle + (Math.PI * 2) * length / totalLength - angleGap
                trackInfo.push({
                    track, arc: {
                        innerRadius: totalRadius - cumDonutBandWidth - donutBandWidth,
                        outerRadius: totalRadius - cumDonutBandWidth,
                        startAngle,
                        endAngle
                    }
                })
                cumLength += length
                if (i % wrap === wrap - 1) {
                    cumLength = 0
                    cumDonutBandWidth += donutBandWidth + TRACK_GAP
                }
            }
        })
    }
    else {
        // stack first
        gm.tracks.forEach((track, i) => {
            if (IsNotEmptyTrack(track)) {
                const donutBandWidth = track.height as number // Height is used for the width of donut band.
                const length = track.width as number // Width is used for calculating the proportion of the circumference.
                const startAngle = (Math.PI * 2) * cumLength / totalLength + angleGap
                const endAngle = startAngle + (Math.PI * 2) * length / totalLength - angleGap
                trackInfo.push({
                    track, arc: {
                        innerRadius: totalRadius - cumDonutBandWidth - donutBandWidth,
                        outerRadius: totalRadius - cumDonutBandWidth,
                        startAngle,
                        endAngle
                    }
                })
                cumDonutBandWidth += donutBandWidth + TRACK_GAP
                if (i % wrap === wrap - 1) {
                    cumDonutBandWidth = 0
                    cumLength += length;
                }
            }
        })
    }

    console.log('arcs', trackInfo);
    g.append('g')
        .attr('transform', `translate(${boundingBox.x + totalRadius}, ${boundingBox.y + totalRadius})`)
        .selectAll('path')
        .data(trackInfo)
        .enter()
        .append('path')
        .attr('fill', d => trackStyle.background(d.track as Track))
        .attr('stroke', d => trackStyle.stroke(d.track as Track))
        .attr('stroke-width', d => trackStyle.strokeWidth(d.track as Track))
        .attr('d', d => d3.arc()
            .innerRadius(d.arc.innerRadius)
            .outerRadius(d.arc.outerRadius)(d.arc)
        )

}