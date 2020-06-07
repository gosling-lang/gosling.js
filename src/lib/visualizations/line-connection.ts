import { BoundingBox } from "../utils/bounding-box";
import { Track, GenericType, Channel, IsChannelDeep, Datum } from "../gemini.schema";
import * as d3 from 'd3'
import { getLinkPosition, LinkStyleModel } from "./link";

export function renderBetweenLineLink(
    g: d3.Selection<SVGGElement, any, any, any>,
    track: Track | GenericType<Channel>,
    bb: BoundingBox
) {
    const styles = new LinkStyleModel(track);

    const xField = IsChannelDeep(track.x) ? track.x.field : undefined;
    const x1Field = IsChannelDeep(track.x1) ? track.x1.field : undefined;
    const yField = IsChannelDeep(track.y) ? track.y.field : undefined;
    const y1Field = IsChannelDeep(track.y1) ? track.y1.field : undefined;

    const [f1, f2] = [xField, x1Field, yField, y1Field].filter(d => d);

    const xScale = d3.scaleLinear<number, number>()
        .domain([0, 99]) // TODO: Support data-driven domain.
        .range([bb.x, bb.x + bb.width])
    const yScale = d3.scaleLinear<number, number>()
        .domain([0, 99])
        .range([bb.y, bb.y + bb.height])

    // calculate position of points
    const point: {
        x: (d: Datum) => number,
        y: (d: Datum) => number,
    }[] = [];

    const position = getLinkPosition(track);
    if (position.includes('left')) {
        point.push({
            x: () => bb.x,
            y: (d: Datum) => yScale(d[yField as string] as number)
        });
    }
    if (position.includes('bottom')) {
        point.push({
            x: (d: Datum) => xScale(d[xField as string] as number),
            y: () => bb.y + bb.height
        });
    }
    if (position.includes('top')) {
        point.push({
            x: (d: Datum) => xScale(d[x1Field as string] as number),
            y: () => bb.y
        });
    }
    if (position.includes('right')) {
        point.push({
            x: () => bb.x + bb.width,
            y: (d: Datum) => yScale((d[y1Field as string] as number))
        });
    }

    // render
    g.selectAll('.line')
        .data(track.data as Datum[])
        .enter()
        .filter(
            // TODO: only for demo
            d => Math.abs((d[f1 as string] as number) - (d[f2 as string] as number)) < 30
        )
        .append('line')
        .attr('x1', d => point[0].x(d))
        .attr('y1', d => point[0].y(d))
        .attr('x2', d => point[1].x(d))
        .attr('y2', d => point[1].y(d))
        .attr('fill', styles.getStyle().fill)
        .attr('stroke', styles.getStyle().stroke)
        .attr('stroke-width', styles.getStyle().strokeWidth)
        .attr('opacity', styles.getStyle().opacity)
}