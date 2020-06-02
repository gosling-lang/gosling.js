import { Track, GenericType, Channel } from "../gemini.schema";
import * as d3 from "d3";
import { renderGlyph } from "./glyph";

export function renderGlyphPreview(
    svg: SVGSVGElement,
    track: Track | GenericType<Channel>,
    width: number,
    height: number
) {
    if (!svg || !track) return;
    d3.select(svg).selectAll("*").remove();

    // Styles
    const WIDTH = width, HEIGHT = height, PADDING_X = 60, PADDING_Y = 100;

    // BG and Guidelines
    renderBackground(svg, WIDTH, HEIGHT, PADDING_X, PADDING_Y);

    const innerG = d3.select(svg).append("g")
        .attr("width", WIDTH - PADDING_X * 2)
        .attr("height", HEIGHT - PADDING_Y * 2)
        .attr("transform", `translate(${PADDING_X},${PADDING_Y})`);

    // TODO: Select a subset of data tuples for a single glyph.
    // ...

    // TODO: Should data be aggregated when specified? (e.g., x: {..., aggregate: "mean"})
    // ...

    renderGlyph(
        innerG,
        track,
        { x: 0, x1: WIDTH - PADDING_X * 2, y: 0, y1: HEIGHT - PADDING_Y * 2 }
    );
}

function renderBackground(
    svg: SVGGElement,
    w: number,
    h: number,
    px: number,
    py: number
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