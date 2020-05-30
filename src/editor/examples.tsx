import { GENE_ANNOTATION_PLOT } from "../lib/test/gemini/gene-annotation-plot";
import { replaceGlyphs } from "../lib/utils";

export const demos = [
    {
        name: "Gene Annotation Plot",
        spec: replaceGlyphs(GENE_ANNOTATION_PLOT)
    }
];