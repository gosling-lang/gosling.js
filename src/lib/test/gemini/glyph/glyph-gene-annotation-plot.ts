import { Mark } from "../../../gemini.schema";

export const GLYPH_GENE_ANNOTATAION: Mark = {
    "type": "glyph",
    "name": "gene-annotation",
    "requiredChannels": [
        "x", "x1",
        "y", // + or - strand?
        "geneOrExon", // genes or exons?
    ],
    "elements": [
        {
            // Should render once
            "description": "horizontal line",
            "mark": "line",
            "color": "black",
            "x": { "bind": "x", "aggregate": "min" },
            "x1": { "bind": "x1", "aggregate": "max" },
            "size": 2
        },
        {
            "description": "exon",
            "select": [
                { "channel": "geneOrExon", "equal": "exon" },
            ],
            "mark": "rect",
            "size": 20
        },
        {
            "description": "gene left",
            "select": [
                { "channel": "geneOrExon", "equal": "gene" },
            ],
            "mark": {
                "bind": "y",
                "domain": ["+", "-"],
                "range": ['point', "rule"]
            },
            "size": 30,
            "x1": null,
            "color": "red"
        },
        {
            "description": "gene right",
            "select": [
                { "channel": "geneOrExon", "equal": "gene" },
            ],
            "mark": {
                "bind": "y",
                "domain": ["+", "-"],
                "range": ["rule", 'point']
            },
            "size": 30,
            "x": { "bind": "x1" },
            "color": "red"
        },
        {
            "mark": "text",
            "select": [
                { "channel": "geneOrExon", 'equal': "gene" }
            ],
            "color": "black"
            // Offset
        }
    ]
}