import { Mark } from "../../../gemini.schema";

import { GLYPH_GENE_ANNOTATAION } from "./glyph-gene-annotation-plot";
import { GLYPH_LOGO } from "./glyph-logo";

export const PREDEFINED_GLYPHS = [
    {
        name: "glyph-gene-annotation-v1",
        mark: GLYPH_GENE_ANNOTATAION
    },
    {
        name: "glyph-logo-plot-v1",
        mark: GLYPH_LOGO
    }
] as {
    name: PREDEFINED_GLYPHS_TYPE,
    mark: Mark
}[];

export type PREDEFINED_GLYPHS_TYPE =
    "glyph-gene-annotation-v1" |
    "glyph-logo-plot-v1";

export const PREDEFINED_GLYPHS_TYPES: PREDEFINED_GLYPHS_TYPE[] = [
    "glyph-gene-annotation-v1",
    "glyph-logo-plot-v1"
];