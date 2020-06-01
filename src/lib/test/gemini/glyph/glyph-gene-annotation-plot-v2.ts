import { MarkGlyph } from "../../../gemini.schema";

export const GLYPH_GENE_ANNOTATAION_V2: MarkGlyph = {
    "type": "glyph",
    "name": "gene-annotation",
    "requiredChannels": [
        // TODO: What about optional channels?
        "x", "x1",
        "y", 'color', // + or - strand?
        "geneOrExon" // genes or exons?
    ],
    "elements": [
        {
            // Should render once
            "description": "gene",
            "select": [
                { "channel": "geneOrExon", "equal": "gene" },
            ],
            "mark": "rect",
            "size": { "value": 25 }
        },
        {
            "description": "gene head",
            "select": [
                { "channel": "geneOrExon", "equal": "gene" },
                { "channel": "y", "equal": "-" }
            ],
            "mark": "triangle-l",
            "size": { "value": 25 },
            "x1": null
        },
        {
            "description": "gene right",
            "select": [
                { "channel": "geneOrExon", "equal": "gene" },
                { "channel": "y", "equal": "+" },
            ],
            "mark": "triangle-r",
            "size": { "value": 25 },
            "x": { "bind": "x1" }
        },
        {
            "description": "horizontal line",
            "select": [
                { "channel": "geneOrExon", "equal": "gene" },
            ],
            "mark": "line",
            "color": { "value": "gray" },
            "size": { "value": 2 },
            'styles': {
                dashed: "3, 3"
            }
        },
        {
            "mark": "text",
            "select": [
                { "channel": "geneOrExon", 'equal': "gene" }
            ],
            "color": { "value": "black" },
            "opacity": { "value": 1 },
            size: { value: 18 },
            styles: {
                dy: -20
            }
        }
    ]
}