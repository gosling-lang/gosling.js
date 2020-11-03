import * as d3 from 'd3';
import { GeminiSpec, Track, BasicSingleTrack } from '../gemini.schema';
import { BoundingBox } from '../utils/bounding-box';
import { DEFAULT_TRACK_GAP } from './defaults';

export const TRACK_BG_STYLE = {
    background: (track: BasicSingleTrack) => track.style?.background ?? 'white',
    stroke: (track: BasicSingleTrack) => track.style?.stroke ?? '#e0e0e0',
    strokeWidth: (track: BasicSingleTrack) => track.style?.strokeWidth ?? 0.5
};

interface ArcInfo {
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
}

export function renderCircularLayout(
    g: d3.Selection<SVGGElement, any, any, any>,
    gm: GeminiSpec,
    boundingBox: BoundingBox
) {
    const wrap: number = gm.layout?.wrap ?? 999;
    const totalRadius = boundingBox.height / 2.0;
    const totalLength = d3.sum(
        // Look into the first row
        gm.layout?.direction === 'horizontal'
            ? gm.tracks.filter((t, i) => i < wrap).map(d => d.width as number)
            : gm.tracks.filter((t, i) => i % wrap == 0).map(d => d.width as number)
    );
    const angleGap = (Math.PI * 2) / 160.0;

    // Generate layout data
    const trackInfo: { arc: ArcInfo; track: Track }[] = [];
    let cumDonutBandWidth = 0;
    let cumLength = 0;
    if (gm.layout?.direction === 'horizontal') {
        // adjacently place first
        gm.tracks.forEach((track, i) => {
            const donutBandWidth = track.height as number; // Height is used for the width of donut band.
            const length = track.width as number; // Width is used for calculating the proportion of the circumference.
            const startAngle = (Math.PI * 2 * cumLength) / totalLength + angleGap;
            const endAngle = startAngle + (Math.PI * 2 * length) / totalLength - angleGap;
            trackInfo.push({
                track,
                arc: {
                    innerRadius: totalRadius - cumDonutBandWidth - donutBandWidth,
                    outerRadius: totalRadius - cumDonutBandWidth,
                    startAngle,
                    endAngle
                }
            });
            cumLength += length;
            if (i % wrap === wrap - 1) {
                cumLength = 0;
                cumDonutBandWidth += donutBandWidth + DEFAULT_TRACK_GAP;
            }
        });
    } else {
        // stack first
        gm.tracks.forEach((track, i) => {
            const donutBandWidth = track.height as number; // Height is used for the width of donut band.
            const length = track.width as number; // Width is used for calculating the proportion of the circumference.
            const startAngle = (Math.PI * 2 * cumLength) / totalLength + angleGap;
            const endAngle = startAngle + (Math.PI * 2 * length) / totalLength - angleGap;
            trackInfo.push({
                track,
                arc: {
                    innerRadius: totalRadius - cumDonutBandWidth - donutBandWidth,
                    outerRadius: totalRadius - cumDonutBandWidth,
                    startAngle,
                    endAngle
                }
            });
            cumDonutBandWidth += donutBandWidth + DEFAULT_TRACK_GAP;
            if (i % wrap === wrap - 1) {
                cumDonutBandWidth = 0;
                cumLength += length;
            }
        });
    }

    // console.log('arcs', trackInfo);
    g.append('g')
        .attr('transform', `translate(${boundingBox.x + totalRadius}, ${boundingBox.y + totalRadius})`)
        .selectAll('path')
        .data(trackInfo)
        .enter()
        .append('path')
        .attr('fill', d => TRACK_BG_STYLE.background(d.track as BasicSingleTrack))
        .attr('stroke', d => TRACK_BG_STYLE.stroke(d.track as BasicSingleTrack))
        .attr('stroke-width', d => TRACK_BG_STYLE.strokeWidth(d.track as BasicSingleTrack))
        .attr('d', d => d3.arc().innerRadius(d.arc.innerRadius).outerRadius(d.arc.outerRadius)(d.arc));
}
