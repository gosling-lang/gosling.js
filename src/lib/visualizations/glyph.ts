import * as d3 from "d3";
import { BoundingBox } from "./bounding-box";
import { TrackExtended, MarkDeep, Datum, Channel, AnyChannels, GlyphMarkDeep, GlyphElement, GlyphChannel } from "../gemini.schema";
import { transformData, FilterSpec } from "../utils/data-process";
import { deepToLongElements } from "../utils/spec-preprocess";
import { DEFAULT_VISUAL_PROPERTIES } from "./defaults";

export function renderGlyph(
    g: d3.Selection<SVGGElement, any, any, any>,
    track: TrackExtended,
    bb: BoundingBox
) {
    const {
        data,
        mark,
        x,
        x1,
        y,
        y1,
        color,
        opacity
    } = track;

    const info = data as Datum[];
    if (!info) {
        console.warn("No array of a JSON object suggested.");
        return;
    }

    console.log("renderGlyph.track", track);
    console.log("renderGlyph.data", data);
    console.log("renderGlyph.mark", mark);

    // TODO: Check if required channels specified.
    // ...

    const markDeep = mark as MarkDeep;
    if (!markDeep || markDeep.type !== "glyph") {
        console.warn("Tried to render glyph but it is not defined.");
        return;
    }

    const {
        name,
        requiredChannels,
        elements
    } = markDeep;

    // TODO: Add title using `name`
    // ...

    const longElements = deepToLongElements(elements);

    // Fields
    const xField = typeof x === "object" ? x?.field : undefined;
    const x1Field = typeof x1 === "object" ? x1?.field : undefined;
    const yField = typeof y === "object" ? y?.field : undefined;
    const y1Field = typeof y1 === "object" ? y1?.field : undefined;

    // Channels
    const channelsToFields: { [k: string]: any } = {};
    requiredChannels.forEach(c => {
        channelsToFields[c] = ((track as AnyChannels)[c] as Channel)?.field;
    });

    // Scales
    let xValues: any[] = [], yValues: any[] = [];
    if (xField) {
        xValues = xValues.concat(info.map(d => d[xField]));
    }
    if (x1Field) {
        xValues = xValues.concat(info.map(d => d[x1Field]));
    }
    if (yField) {
        yValues = yValues.concat(info.map(d => d[yField]));
    }
    if (y1Field) {
        yValues = yValues.concat(info.map(d => d[y1Field]));
    }
    const xDomain = d3.extent(xValues) as number[];
    const yDomain = d3.set(yValues).values();
    const xRange = [bb.x, bb.x1];
    const yRange = [bb.y, bb.y1];
    const xScale = d3.scaleLinear().domain(xDomain).range(xRange);
    const yScale = d3.scaleOrdinal().domain(yDomain).range(xRange);

    console.log(longElements);

    // Render each element
    longElements.forEach(element => {
        const {
            description: descriptionE,
            select: selectE,
            mark: markE,
            x: xE,
            x1: x1E,
            y: yE,
            y1: y1E,
            color: colorE,
            size: sizeE
        } = element;

        // Select
        const filters: FilterSpec[] = [];
        selectE?.forEach(d => {
            const { channel, equal } = d;
            if (channelsToFields[channel]) {
                filters.push({ field: channelsToFields[channel], equal });
            }
        });

        // Channels
        const glyphChannelsToFields: { [k: string]: any } = {};
        requiredChannels.forEach(_c => {
            const c = _c as keyof GlyphElement;
            const boundChannel = (element[c] as GlyphChannel)?.bind;
            glyphChannelsToFields[c] = boundChannel ? channelsToFields[boundChannel] : channelsToFields[c];
        });

        // console.log(glyphChannelsToFields);

        // Render glyph
        const transformed_data = transformData(info, filters);
        if (markE === "line") {
            const isAggregate = true;
            if (isAggregate) {
                // TODO:
                g.selectAll()
                    .data(transformed_data)
                    .enter()
                    .append('line')
                    .attr('stroke', colorE as string)
                    .attr('x1', d => {
                        return xScale(d[glyphChannelsToFields['x']] as number) as number;
                    })
                    .attr('x2', d => xScale(d[glyphChannelsToFields['x1']] as number) as number)
                    .attr('y1', d => yScale(d[glyphChannelsToFields['y']] as string) as number)
                    .attr('y2', d => yScale(d[glyphChannelsToFields['y']] as string) as number)
                    .attr('stroke-width', sizeE as number)
                    .attr('opacity', typeof opacity !== "object" ? opacity as number : DEFAULT_VISUAL_PROPERTIES.opacity);
            }
        } else if (markE === "rect") {
            g.selectAll()
                .data(transformed_data)
                .enter()
                .append('rect')
                .attr('fill', "blue")
                .attr('x', d => xScale(d[glyphChannelsToFields['x']] as number) as number)
                .attr('width', d => xScale(d[glyphChannelsToFields['x1']] as number) - xScale(d[glyphChannelsToFields['x']] as number))
                .attr('y', d => yScale(d[glyphChannelsToFields['y']] as string) as number - (sizeE as number) / 2.0)
                .attr('height', sizeE as number)
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr('opacity', typeof opacity !== "object" ? opacity as number : DEFAULT_VISUAL_PROPERTIES.opacity);
        } else if (markE === 'text') {
            g.selectAll()
                .data(transformed_data)
                .enter()
                .append('text')
                .text(d => d["gene_name"])
                .attr('fill', colorE as string)
                .attr('x', d => xScale(d[glyphChannelsToFields['x']] as number) as number + (xScale(d[glyphChannelsToFields['x1']] as number) - xScale(d[glyphChannelsToFields['x']] as number)) / 2.0)
                .attr('y', d => yScale(d[glyphChannelsToFields['y']] as string) as number - 20)
                .attr('alignment-baseline', "top")
                .attr('text-anchor', "middle")
                .attr('opacity', typeof opacity !== "object" ? opacity as number : DEFAULT_VISUAL_PROPERTIES.opacity);
        } else if (markE === 'rule') {
            g.selectAll('line')
                .data(transformed_data)
                .enter()
                .append('line')
                .attr('stroke', colorE as string)
                .attr('x1', d => xScale(d[glyphChannelsToFields['x']] as number) as number)
                .attr('x2', d => xScale(d[glyphChannelsToFields['x']] as number) as number)
                .attr('y1', d => yScale(d[glyphChannelsToFields['y']] as string) as number - (sizeE as number) / 2.0)
                .attr('y2', d => yScale(d[glyphChannelsToFields['y']] as string) as number + (sizeE as number) / 2.0)
                .attr('stroke-width', 3)
                .attr('opacity', typeof opacity !== "object" ? opacity as number : DEFAULT_VISUAL_PROPERTIES.opacity);
        } else if (markE === 'point') {
            g.selectAll('circle')
                .data(transformed_data)
                .enter()
                .append('circle')
                .attr('fill', colorE as string)
                .attr('cx', d => xScale(d[glyphChannelsToFields['x']] as number) as number)
                .attr('cy', d => xScale(d[glyphChannelsToFields['y']] as number) as number)
                .attr('r', 15)
                .attr('opacity', typeof opacity !== "object" ? opacity as number : DEFAULT_VISUAL_PROPERTIES.opacity);
        }
    });
}