import { BoundingBox } from "../utils/bounding-box";
import { Track, GenericType, Channel, IsChannelDeep, Datum } from "../gemini.schema";
import * as d3 from 'd3'

export function renderLink(
    g: d3.Selection<SVGGElement, any, any, any>,
    tracksWithBB: { bb: BoundingBox, track: Track | GenericType<Channel> }[]
) {
    tracksWithBB.forEach(tb => {
        const { bb } = tb;
        const xScale = d3.scaleLinear<number, number>()
            .domain([0, 100]) // TODO:
            .range([bb.x, bb.x + bb.width])
        const yScale = d3.scaleLinear<number, number>()
            .domain([0, 100])
            .range([bb.y, bb.y + bb.height])

        // Only two of fields will be used below:
        const xField = IsChannelDeep(tb.track.x) ? tb.track.x.field : undefined;
        const x1Field = IsChannelDeep(tb.track.x1) ? tb.track.x1.field : undefined;
        const yField = IsChannelDeep(tb.track.y) ? tb.track.y.field : undefined;
        const y1Field = IsChannelDeep(tb.track.y1) ? tb.track.y1.field : undefined;

        const [f1, f2] = [xField, x1Field, yField, y1Field].filter(d => d);

        const lines = g.selectAll('.line')
            .data(tb.track.data as Datum[])
            .enter()
            // TODO: for demo
            .filter(
                d => Math.abs((d[f1 as string] as number) - (d[f2 as string] as number)) < 30
            )
            /////
            .append('line')

        // TODO: better way to merge the codes below?
        if (xField && yField) {
            /* |__ */
            lines
                .attr('x1', bb.x)
                .attr('y1', d => yScale(d[yField as string] as number))
                .attr('x2', d => xScale(d[xField as string] as number))
                .attr('y2', bb.y + bb.height)
        }
        else if (x1Field && yField) {
            /* |‾‾ */
            lines
                .attr('x1', bb.x)
                .attr('y1', d => yScale(d[yField as string] as number))
                .attr('x2', d => xScale(d[x1Field as string] as number))
                .attr('y2', bb.y)
        }
        else if (x1Field && y1Field) {
            /* ‾‾| */
            lines
                .attr('x1', bb.x + bb.width)
                .attr('y1', d => yScale(d[y1Field as string] as number))
                .attr('x2', d => xScale(d[x1Field as string] as number))
                .attr('y2', bb.y)
        }
        else if (xField && y1Field) {
            /* __| */
            lines
                .attr('x1', bb.x + bb.width)
                .attr('y1', d => yScale(d[y1Field as string] as number))
                .attr('x2', d => xScale(d[xField as string] as number))
                .attr('y2', bb.y + bb.height)
        }
        else if (xField && x1Field) {
            /* __
               __ */
            lines
                .attr('x1', d => xScale(d[xField as string] as number))
                .attr('y1', bb.y + bb.height)
                .attr('x2', d => xScale(d[x1Field as string] as number))
                .attr('y2', bb.y)
        }
        else if (yField && y1Field) {
            /* | | */
            lines
                .attr('x1', bb.x)
                .attr('y1', d => yScale((d[yField as string] as number)))
                .attr('x2', bb.x + bb.width)
                .attr('y2', d => yScale((d[y1Field as string] as number)))
        }

        // styles
        g.selectAll('line')
            .attr('fill', 'black')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('opacity', 0.3)
    });
}