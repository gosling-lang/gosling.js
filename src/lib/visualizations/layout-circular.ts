import * as d3 from "d3";
import { GeminiSpec, Track, GenericType, Channel, IsNotEmptyTrack } from "../gemini.schema";
import { BoundingBox } from "../utils/bounding-box";
import { HiGlassTrack } from "./higlass";
import { TRACK_GAP, INNER_CIRCLE_RADIUS } from "./defaults";
import { DefaultArcObject } from "d3";

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
    const totalRadius = boundingBox.height / 2.0
    const totalLength = d3.sum(gm.tracks.map(d => IsNotEmptyTrack(d) ? d.width as number : 0))
    const angleGap = Math.PI * 2 / 160.0;

    // Generate layout data
    // TODO: support `wrap`
    const trackInfo: { arc: ArcInfo, track: Track | GenericType<Channel> }[] = []
    if (gm.layout?.direction === "horizontal") {
        // adjacently place first
        let cumLength = 0
        gm.tracks.forEach(track => {
            if (IsNotEmptyTrack(track)) {
                const donutBandWidth = track.height as number // Height is used for the width of donut band.
                const length = track.width as number // Width is used for calculating the proportion of the circumference.
                const startAngle = (Math.PI * 2) * cumLength / totalLength + angleGap
                const endAngle = startAngle + (Math.PI * 2) * length / totalLength - angleGap
                trackInfo.push({
                    track, arc: {
                        innerRadius: totalRadius - donutBandWidth,
                        outerRadius: totalRadius,
                        startAngle, endAngle
                    }
                })
                cumLength += length
            }
        })
    }
    else {
        // stack first
        let cumDonutBandWidth = 0
        gm.tracks.forEach(track => {
            if (IsNotEmptyTrack(track)) {
                const donutBandWidth = track.height as number // Height is used for the width of donut band.
                trackInfo.push({
                    track, arc: {
                        innerRadius: totalRadius - cumDonutBandWidth - donutBandWidth,
                        outerRadius: totalRadius - cumDonutBandWidth,
                        startAngle: Math.PI + angleGap,
                        endAngle: Math.PI * 3 - angleGap
                    }
                })
                cumDonutBandWidth += donutBandWidth + TRACK_GAP
            }
        })
    }

    const trackStyle = {
        background: (track: Track) => track.style?.background ?? 'white',
        stroke: () => 'lightgray',
        strokeWidth: () => 1
    }

    console.log('arcs', trackInfo);
    g.append('g')
        .attr('transform', `translate(${boundingBox.x + totalRadius}, ${boundingBox.y + totalRadius})`)
        .selectAll('path')
        .data(trackInfo)
        .enter()
        .append('path')
        .attr('fill', d => trackStyle.background(d.track as Track))
        .attr('stroke', trackStyle.stroke())
        .attr('stroke-width', trackStyle.strokeWidth())
        .attr('d', d => d3.arc()
            .innerRadius(d.arc.innerRadius)
            .outerRadius(d.arc.outerRadius)({
                ...d.arc,
                // Add PI to rotate in 180 deg.
                startAngle: d.arc.startAngle,
                endAngle: d.arc.endAngle,
            } as DefaultArcObject)
        )

}