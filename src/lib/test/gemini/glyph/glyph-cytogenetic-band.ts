import { MarkGlyph } from "../../../gemini.schema";

export const GLYPH_CYTOGENETIC_BAND: MarkGlyph = {
    "type": 'groupMark',
    "name": "cytogenetic-band",
    "requiredChannels": [
        // TODO: What about optional channels?
        "x", "xe", // start, end
        "y", // chr
        'color', // strain
        'text', // band
        'stain' // gneg, gpos, gvar, or acen
    ],
    "elements": [
        {
            "description": "symbols",
            "select": [{ channel: 'stain', oneOf: ['gneg', 'gpos', 'gvar'] }],
            "mark": "rect",
            "size": { "value": 25 },
            style: {
                stroke: 'black',
                strokeWidth: 1
            }
        },
        {
            "description": "acen",
            "select": [{ channel: 'text', oneOf: ['11', '11.1'] }],
            "mark": { bind: 'text', domain: ['11', '11.1'], range: ['triangle-l', 'triangle-r'] },
            'color': { value: '#B40101' },
            "size": { "value": 25 },
            style: {
                stroke: 'black',
                strokeWidth: 1
            }
        },
        {
            mark: 'text',
            select: [{ channel: 'color', oneOf: ['100', '75', '50'] }],
            color: { value: 'black' },
            size: { value: 10 },
            style: {
                dy: -20
            }
        }
    ]
}