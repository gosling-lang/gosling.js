import { MarkGlyph } from "../../../gemini.schema";

export const GLYPH_GENE_ANNOTATAION_V2: MarkGlyph = {
    "type": 'groupMark',
    "name": "gene-annotation",
    "requiredChannels": [
        // TODO: What about optional channels?
        "x", "xe",
        "y", 'color', // + or - strand?
        "geneOrExon" // genes or exons?
    ],
    "elements": [
        {
            // Should render once
            "description": "gene",
            "select": [
                { "channel": "geneOrExon", "oneOf": ["gene"] },
            ],
            "mark": "rect",
            "size": { "value": 25 }
        },
        {
            "description": "gene head",
            "select": [
                { "channel": "geneOrExon", "oneOf": ["gene"] },
                { "channel": "y", "oneOf": ["-"] }
            ],
            "mark": "triangle-l",
            "size": { "value": 25 },
            "xe": 'none'
        },
        {
            "description": "gene right",
            "select": [
                { "channel": "geneOrExon", "oneOf": ["gene"] },
                { "channel": "y", "oneOf": ["+"] },
            ],
            "mark": "triangle-r",
            "size": { "value": 25 },
            "x": { "bind": "xe" },
            "xe": 'none'
        },
        {
            "description": "horizontal line",
            "select": [
                { "channel": "geneOrExon", "oneOf": ["gene"] },
            ],
            "mark": "line",
            "color": { "value": "gray" },
            "size": { "value": 2 },
            'style': {
                dashed: "3, 3"
            }
        },
        {
            "mark": "text",
            "select": [
                { "channel": "geneOrExon", 'oneOf': ["gene"] }
            ],
            "color": { "value": "black" },
            "opacity": { "value": 1 },
            size: { value: 18 },
            style: {
                dy: -20
            }
        }
    ]
}