import { Track, GenericType, Channel } from "../gemini.schema";
import * as d3 from "d3";
import { renderGlyph } from "./glyph";
import { renderBackground } from "./guidelines";

export function renderGlyphPreview(
    svg: SVGSVGElement,
    track: Track | GenericType<Channel>,
    width: number,
    height: number
) {
    if (!svg || !track) return;
    d3.select(svg).selectAll("*").remove();

    // Styles
    const WIDTH = width, HEIGHT = height, PADDING_X = 60, PADDING_Y = 30;

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
        { x: 0, width: WIDTH - PADDING_X * 2, y: 0, height: HEIGHT - PADDING_Y * 2 }
    );
}