import * as d3 from 'd3'

export function renderBackground(
    svg: SVGGElement,
    w: number,
    h: number,
    px: number,
    py: number,
    isGuideline: boolean = true
) {
    d3.select(svg)
        .attr("width", w)
        .attr("height", h);
    const g = d3.select(svg).append("g");
    g.append("rect")
        .attr("width", w)
        .attr("height", h)
        .attr("stroke", "lightgray")
        .attr("fill", "white");
    if (!isGuideline) return;
    g.append("line")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("y1", py)
        .attr("y2", py)
        .attr("class", "preview-guideline");
    g.append("line")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("y1", h - py)
        .attr("y2", h - py)
        .attr("class", "preview-guideline");
    g.append("line")
        .attr("x1", px)
        .attr("x2", px)
        .attr("y1", 0)
        .attr("y2", h)
        .attr("class", "preview-guideline");
    g.append("line")
        .attr("x1", w - px)
        .attr("x2", w - px)
        .attr("y1", 0)
        .attr("y2", h)
        .attr("class", "preview-guideline");
    g.append("line")
        .attr("x1", 0)
        .attr("x2", w)
        .attr("y1", h / 2)
        .attr("y2", h / 2)
        .attr("class", "preview-guideline");
    g.append("line")
        .attr("x1", w / 2)
        .attr("x2", w / 2)
        .attr("y1", 0)
        .attr("y2", h)
        .attr("class", "preview-guideline");
}