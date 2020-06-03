import { GeminiSpec } from "../gemini.schema";
import * as d3 from 'd3';
import { renderBackground } from "./guidelines";
import { renderLayout } from "./layout";

export function renderLayoutPreview(
    svg: SVGSVGElement,
    gm: GeminiSpec,
    width: number,
    height: number
) {
    if (!svg || !gm) return;
    d3.select(svg).selectAll('*').remove();

    // Styles
    const PADDING_X = 60, PADDING_Y = 60;
    const WIDTH = width + PADDING_X * 2, HEIGHT = height + PADDING_Y * 2;

    // BG and Guidelines
    renderBackground(svg, WIDTH, HEIGHT, PADDING_X, PADDING_Y, false);

    const innerG = d3.select(svg).append("g")
        .attr("width", WIDTH - PADDING_X * 2)
        .attr("height", HEIGHT - PADDING_Y * 2)
        .attr("transform", `translate(${PADDING_X},${PADDING_Y})`);

    renderLayout(
        innerG,
        gm
    );

}