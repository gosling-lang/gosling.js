import * as d3 from 'd3';
import { Track, Datum, GenericType, Channel, IsGlyphMark } from '../gemini.schema';
import { transformData, FilterSpec } from '../utils/data-process';
import { TrackModel } from '../models/track';
import { BoundingBox } from '../utils/bounding-box';

export function renderGlyph(
    g: d3.Selection<SVGGElement, any, any, any>,
    track: Track | GenericType<Channel>,
    bb: BoundingBox
) {
    const tm = new TrackModel(track);
    tm.setScales({
        ...bb,
        // TODO: Cheating here!
        y: bb.y + bb.height / 2.0
    });

    // checks
    const data = track.data as Datum[];
    if (!data) {
        console.warn('No array of a JSON object suggested.');
        return;
    }

    if (!IsGlyphMark(track.mark)) {
        console.warn('Glyph is not defined.');
        return;
    }
    /////////////

    // TODO: Add title using `name`
    // ...

    // Render each element
    tm.getElements().forEach(element => {
        const { select, mark: markE } = element;

        // Select
        const filters: FilterSpec[] = [];
        select?.forEach(d => {
            const { channel, oneOf } = d;
            if (tm.getFieldByChannel(channel)) {
                filters.push({ field: tm.getFieldByChannel(channel), oneOf });
            }
        });

        // Render glyph
        const transformed_data = transformData(data, filters);
        // TODO: Aggregation
        if (markE === 'line') {
            g.selectAll()
                .data(transformed_data)
                .enter()
                .append('line')
                .attr('x1', d => tm.getEncoding(element, 'x', d))
                .attr('x2', d => tm.getEncoding(element, 'xe', d))
                .attr('y1', d => tm.getEncoding(element, 'y', d))
                .attr('y2', d => tm.getEncoding(element, 'y', d))
                .attr('stroke', d => tm.getEncoding(element, 'color', d))
                .attr('stroke-width', d => tm.getEncoding(element, 'size', d))
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d))
                .style('stroke-dasharray', element.style?.dashed ?? '');
        } else if (markE === 'point') {
            g.selectAll('point')
                .data(transformed_data)
                .enter()
                .append('circle')
                .attr('fill', d => tm.getEncoding(element, 'color', d))
                .attr('cx', d => tm.getEncoding(element, 'x', d))
                .attr('cy', d => tm.getEncoding(element, 'x', d))
                .attr('r', 15)
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d));
        } else if (markE === 'rect') {
            g.selectAll()
                .data(transformed_data)
                .enter()
                .append('rect')
                .attr('x', d => tm.getEncoding(element, 'x', d))
                .attr('y', d => tm.getEncoding(element, 'y', d) - tm.getEncoding(element, 'size', d) / 2.0)
                .attr('width', d => tm.getEncoding(element, 'xe', d) - tm.getEncoding(element, 'x', d))
                .attr('height', d => tm.getEncoding(element, 'size', d))
                .attr('fill', d => tm.getEncoding(element, 'color', d))
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d))
                .attr('stroke', element.style?.stroke ?? '')
                .attr('stroke-width', element.style?.strokeWidth ?? '');
        } else if (markE === 'text') {
            g.selectAll()
                .data(transformed_data)
                .enter()
                .append('text')
                .text(d => tm.getEncoding(element, 'text', d))
                .attr('x', d => (tm.getEncoding(element, 'x', d) + tm.getEncoding(element, 'xe', d)) / 2.0)
                .attr('y', d => tm.getEncoding(element, 'y', d) + element.style?.dy)
                .attr('fill', d => tm.getEncoding(element, 'color', d))
                .attr('font-size', d => tm.getEncoding(element, 'size', d))
                .attr('alignment-baseline', 'top')
                .attr('text-anchor', 'middle')
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d));
        } else if (markE === 'rule') {
            g.selectAll('rule')
                .data(transformed_data)
                .enter()
                .append('line')
                .attr('x1', d => tm.getEncoding(element, 'x', d))
                .attr('x2', d => tm.getEncoding(element, 'x', d))
                .attr('y1', d => tm.getEncoding(element, 'x', d) - tm.getEncoding(element, 'size', d) / 2.0)
                .attr('y2', d => tm.getEncoding(element, 'x', d) - tm.getEncoding(element, 'size', d) / 2.0)
                .attr('stroke', d => tm.getEncoding(element, 'color', d))
                .attr('stroke-width', 3)
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d));
        } else if (markE === 'triangle-r') {
            g.selectAll('trangle-r')
                .data(transformed_data)
                .enter()
                .append('path')
                .attr('d', d => {
                    const h = tm.getEncoding(element, 'size', d);
                    const w = tm.getEncoding(element, 'w', d);
                    const x = tm.getEncoding(element, 'x', d);
                    const y = tm.getEncoding(element, 'y', d);
                    return `M${x + w} ${y} L${x} ${y + h / 2.0} L${x} ${y - h / 2.0} Z`;
                })
                .attr('fill', d => tm.getEncoding(element, 'color', d))
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d))
                .attr('stroke', element.style?.stroke ?? '')
                .attr('stroke-width', element.style?.strokeWidth ?? '');
        } else if (markE === 'triangle-l') {
            g.selectAll('trangle-l')
                .data(transformed_data)
                .enter()
                .append('path')
                .attr('d', d => {
                    const h = tm.getEncoding(element, 'size', d);
                    const w = tm.getEncoding(element, 'w', d);
                    const x = tm.getEncoding(element, 'x', d);
                    const y = tm.getEncoding(element, 'y', d);
                    return `M${x} ${y} L${x + w} ${y + h / 2.0} L${x + w} ${y - h / 2.0} Z`;
                })
                .attr('fill', d => tm.getEncoding(element, 'color', d))
                .attr('opacity', d => tm.getEncoding(element, 'opacity', d))
                .attr('stroke', element.style?.stroke ?? '')
                .attr('stroke-width', element.style?.strokeWidth ?? '');
        }
    });
}
