import { Mark } from "../../../gemini.schema";

export const GLYPH_LOGO: Mark = {
    "type": "glyph",
    "name": "logo",
    "requiredChannels": [
        "x", "x1", "y"
    ],
    "elements": [
        {
            "mark": "bar"
        },
        {
            "mark": "text",
            "color": "black"
        }
    ]
}