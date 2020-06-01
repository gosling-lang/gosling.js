import { GENE_ANNOTATION_PLOT, GENE_ANNOTATION_PLOT_SIMPLE } from "../lib/test/gemini/gene-annotation-plot";
import { replaceGlyphs } from "../lib/utils";

export const demos = [
    {
        name: "Gene Annotation Plot (Simple)",
        spec: replaceGlyphs(GENE_ANNOTATION_PLOT_SIMPLE)
    },
    {
        name: "Gene Annotation Plot",
        spec: replaceGlyphs(GENE_ANNOTATION_PLOT)
    }
];