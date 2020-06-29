import { BoundingBox } from "../utils/bounding-box"
import { Track, GenericType, Channel, IsChannelDeep, Datum } from "../gemini.schema"
import * as d3 from 'd3'
import { getLinkPosition, LinkStyleModel } from "./link"

export function renderBetweenBandLink(
    g: d3.Selection<SVGGElement, any, any, any>,
    track: Track | GenericType<Channel>,
    bb: BoundingBox
) {
    const styles = new LinkStyleModel(track)

    const xField = IsChannelDeep(track.x) ? track.x.field : undefined
    const xeField = IsChannelDeep(track.xe) ? track.xe.field : undefined
    const x1Field = IsChannelDeep(track.x1) ? track.x1.field : undefined
    const x1eField = IsChannelDeep(track.x1e) ? track.x1e.field : undefined
    const yField = IsChannelDeep(track.y) ? track.y.field : undefined
    const yeField = IsChannelDeep(track.ye) ? track.ye.field : undefined
    const y1Field = IsChannelDeep(track.y1) ? track.y1.field : undefined
    const y1eField = IsChannelDeep(track.y1e) ? track.y1e.field : undefined

    const xScale = d3.scaleLinear<number, number>()
        .domain([0, 99]) // TODO: Support based on the real data
        .range([bb.x, bb.x + bb.width])
    const yScale = d3.scaleLinear<number, number>()
        .domain([0, 99])
        .range([bb.y, bb.y + bb.height])

    // calculate position of points
    const point: {
        x: (d: Datum) => number,
        xe: (d: Datum) => number,
        y: (d: Datum) => number,
        ye: (d: Datum) => number
    }[] = []

    const position = getLinkPosition(track)
    if (position.includes('left')) {
        point.push({
            x: () => bb.x,
            xe: () => bb.x,
            y: (d: Datum) => yScale(d[yField as string] as number),
            ye: (d: Datum) => yScale(d[yeField as string] as number)
        })
    }
    if (position.includes('bottom')) {
        point.push({
            x: (d: Datum) => xScale(d[xField as string] as number),
            xe: (d: Datum) => xScale(d[xeField as string] as number),
            y: () => bb.y + bb.height,
            ye: () => bb.y + bb.height
        })
    }
    if (position.includes('top')) {
        point.push({
            x: (d: Datum) => xScale(d[x1Field as string] as number),
            xe: (d: Datum) => xScale(d[x1eField as string] as number),
            y: () => bb.y,
            ye: () => bb.y
        })
    }
    if (position.includes('right')) {
        point.push({
            x: () => bb.x + bb.width,
            xe: () => bb.x + bb.width,
            y: (d: Datum) => yScale((d[y1Field as string] as number)),
            ye: (d: Datum) => yScale((d[y1eField as string] as number))
        })
    }

    // render
    g.selectAll('.polygon')
        .data(track.data as Datum[])
        .enter()
        .append('polygon')
        .attr('points', d => {
            const primaryPointStart = `${point[0].x(d)},${point[0].y(d)}`
            const primaryPointEnd = `${point[0].xe(d)},${point[0].ye(d)}`
            const secondaryPointStart = `${point[1].xe(d)},${point[1].ye(d)}`
            const secondaryPointEnd = `${point[1].x(d)},${point[1].y(d)}`
            return `${primaryPointStart} ${primaryPointEnd} ${secondaryPointStart} ${secondaryPointEnd}`
        })
        .attr('fill', styles.getStyle().fill)
        .attr('stroke', styles.getStyle().stroke)
        .attr('stroke-width', styles.getStyle().strokeWidth)
        .attr('opacity', styles.getStyle().opacity)
}