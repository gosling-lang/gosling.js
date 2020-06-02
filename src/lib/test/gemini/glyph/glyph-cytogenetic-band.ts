import { MarkGlyph } from "../../../gemini.schema";

export const GLYPH_CYTOGENETIC_BAND: MarkGlyph = {
    "type": "glyph",
    "name": "cytogenetic-band",
    "requiredChannels": [
        // TODO: What about optional channels?
        "x", "x1", // start, end
        "y", // chr
        'color', // strain
        'text', // band
        'stain' // gneg, gpos, gvar, or acen
    ],
    "elements": [
        {
            "description": "acen bg",
            "select": [{ channel: 'text', oneOf: ['11', '11.1'] }],
            "mark": { bind: 'text', domain: ['11', '11.1'], range: ['triangle-l', 'triangle-r'] },
            'color': { value: '#6E7F8F' },
            "size": { "value": 29 },
            styles: {
                stroke: 'black',
                strokeWidth: 2
            }
        },
        {
            "description": "symbols background",
            "select": [{ channel: 'stain', oneOf: ['gneg', 'gpos', 'gvar'] }],
            "mark": "rect",
            "size": { "value": 26 },
            styles: {
                stroke: 'black',
                strokeWidth: 3
            }
        },
        {
            "description": "symbols",
            "select": [{ channel: 'stain', oneOf: ['gneg', 'gpos', 'gvar'] }],
            "mark": "rect",
            "size": { "value": 25 }
        },
        {
            "description": "acen",
            "select": [{ channel: 'text', oneOf: ['11', '11.1'] }],
            "mark": { bind: 'text', domain: ['11', '11.1'], range: ['triangle-l', 'triangle-r'] },
            'color': { value: '#6E7F8F' },
            "size": { "value": 30 }
        },
        {
            mark: 'text',
            select: [{ channel: 'color', oneOf: ['100', '75', '50'] }],
            color: { value: 'black' },
            size: { value: 10 },
            styles: {
                dy: -20
            }
        }
    ]
}