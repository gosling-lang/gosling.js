import { GENE_ANNOTATION_PLOT, GENE_ANNOTATION_PLOT_SIMPLE } from "../lib/test/gemini/gene-annotation-plot";
import { replaceGlyphs } from "../lib/utils";
import { CYTOGENETIC_BAND } from "../lib/test/gemini/cytogenetic-band";

export const demos = [
    {
        name: "Gene Annotation Plot (Simple)",
        spec: GENE_ANNOTATION_PLOT_SIMPLE,
        previewWidth: 300,
        previewHeight: 300
    },
    {
        name: "Gene Annotation Plot",
        spec: GENE_ANNOTATION_PLOT,
        previewWidth: 600,
        previewHeight: 300
    },
    {
        name: "Cytogenetic Band",
        spec: CYTOGENETIC_BAND,
        previewWidth: 900,
        previewHeight: 300
    }
] as const;