import * as d3 from "d3";
import { BoundingBox } from "./bounding-box";
import { Track, Datum, ChannelDeep, GenericType, GlyphElement, ChannelBind, IsChannelDeep, Channel, MarkGlyph, IsGlyphMark, MarkDeep, ChannelValue, IsChannelValue } from "../gemini.schema";
import { transformData, FilterSpec } from "../utils/data-process";
import { DEFAULT_VISUAL_PROPERTIES } from "./defaults";
import { TrackModel } from "../models/track";

export function renderGlyph(
    g: d3.Selection<SVGGElement, any, any, any>,
    track: Track | GenericType<Channel>,
    bb: BoundingBox
) {
    const tm = new TrackModel(track);
    tm.setScales(bb);

    // checks
    const data = track.data as Datum[];
    if (!data) {
        console.warn("No array of a JSON object suggested.");
        return;
    }

    if (!IsGlyphMark(track.mark)) {
        console.warn("Glyph is not defined.");
        return;
    }
    /////////////

    // TODO: Add title using `name`
    // ...

    // Render each element
    tm.getElements().forEach(element => {
        const { select, mark: markE, } = element;

        // Select
        const filters: FilterSpec[] = [];
        select?.forEach(d => {
            const { channel, equal } = d;
            if (tm.getFieldByChannel(channel)) {
                filters.push({ field: tm.getFieldByChannel(channel), equal });
            }
        });

        // Render glyph
        const transformed_data = transformData(data, filters);
        // TODO: Aggregation
        if (markE === "line") {
            g.selectAll()
                .data(transformed_data)
                .enter()
                .append('line')
                .attr('x1', d => tm.getEncoding(element, 'x', d))
                .attr('x2', d => tm.getEncoding(element, 'x1', d))
                .attr('y1', d => tm.getEncoding(element, 'y', d))
                .attr('y2', d => tm.getEncoding(element, 'y', d))
                .attr('stroke', d => tm.getEncoding(element, 'color', d))
                .attr('stroke-width', d => tm.getEncoding(element, 'size', d))
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d))
                .style('stroke-dasharray', (element.styles?.dashed as any))
        } else if (markE === 'point') {
            g.selectAll('circle')
                .data(transformed_data)
                .enter()
                .append('circle')
                .attr('fill', d => tm.getEncoding(element, 'color', d))
                .attr('cx', d => tm.getEncoding(element, 'x', d))
                .attr('cy', d => tm.getEncoding(element, 'x', d))
                .attr('r', 15)
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d))
        } else if (markE === "rect") {
            g.selectAll()
                .data(transformed_data)
                .enter()
                .append('rect')
                .attr('x', d => tm.getEncoding(element, 'x', d))
                .attr('y', d => tm.getEncoding(element, 'y', d) - tm.getEncoding(element, 'size', d) / 2.0)
                .attr('width', d => tm.getEncoding(element, 'x1', d) - tm.getEncoding(element, 'x', d))
                .attr('height', d => tm.getEncoding(element, 'size', d))
                .attr('fill', d => tm.getEncoding(element, 'color', d))
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d));
        } else if (markE === 'text') {
            g.selectAll()
                .data(transformed_data)
                .enter()
                .append('text')
                .text(d => tm.getEncoding(element, 'text', d))
                .attr('x', d => (tm.getEncoding(element, 'x', d) + tm.getEncoding(element, 'x1', d)) / 2.0)
                .attr('y', d => tm.getEncoding(element, 'y', d) + element.styles?.dy)
                .attr('fill', d => tm.getEncoding(element, 'color', d))
                .attr('font-size', d => tm.getEncoding(element, 'size', d))
                .attr('alignment-baseline', "top")
                .attr('text-anchor', "middle")
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d))
        } else if (markE === 'rule') {
            g.selectAll('line')
                .data(transformed_data)
                .enter()
                .append('line')
                .attr('x1', d => tm.getEncoding(element, 'x', d))
                .attr('x2', d => tm.getEncoding(element, 'x', d))
                .attr('y1', d => tm.getEncoding(element, 'x', d) - tm.getEncoding(element, 'size', d) / 2.0)
                .attr('y2', d => tm.getEncoding(element, 'x', d) - tm.getEncoding(element, 'size', d) / 2.0)
                .attr('stroke', d => tm.getEncoding(element, 'color', d))
                .attr('stroke-width', 3)
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d))
        } else if (markE === 'triangle-l') {
            g.selectAll('path')
                .data(transformed_data)
                .enter()
                .append('path')
                .attr('d', d => {
                    const size = tm.getEncoding(element, 'size', d);
                    const x = tm.getEncoding(element, 'x', d);
                    const y = tm.getEncoding(element, 'y', d);
                    console.log(y);
                    return `M${x - size} ${y}`
                        + `L${x} ${y + size / 2.0}`
                        + `L${x} ${y - size / 2.0} Z`;
                })
                .attr('fill', d => tm.getEncoding(element, 'color', d))
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d))
        } else if (markE === 'triangle-r') {
            g.selectAll('path')
                .data(transformed_data)
                .enter()
                .append('path')
                .attr('d', d => {
                    const size = tm.getEncoding(element, 'size', d);
                    const x = tm.getEncoding(element, 'x', d);
                    const y = tm.getEncoding(element, 'y', d);
                    console.log(y);
                    return `M${x + size} ${y}`
                        + `L${x} ${y + size / 2.0}`
                        + `L${x} ${y - size / 2.0} Z`;
                })
                .attr('fill', d => tm.getEncoding(element, 'color', d))
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d))
        }
    });
}