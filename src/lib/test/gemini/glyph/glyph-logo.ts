import { Mark } from "../../../gemini.schema";

export const GLYPH_LOGO: Mark = {
    "type": 'groupMark',
    "name": "logo",
    "requiredChannels": [
        "x", "xe", "y"
    ],
    "elements": [
        {
            "mark": "bar"
        },
        {
            "mark": "text",
            "color": { "value": "black" }
        }
    ]
}