import { GeminiSpec } from "../../gemini.schema";

export const GENE_ANNOTATION_PLOT_SIMPLE: GeminiSpec = {
    tracks: [
        {
            data: { url: "https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/Homo_sapiens.GRCh38.92.glyph.csv", type: 'csv' },
            mark: { server: "gemini.v1", type: "glyph-gene-annotation-v2" },
            x: { field: "start", type: "quantitative" },
            xe: { field: "end", type: "quantitative" },
            y: { field: "strand", type: "nominal" },
            text: { field: "gene_name", type: "nominal" },
            geneOrExon: { field: "feature", type: "nominal" },
            color: { value: "#D1D28D" },
            opacity: { value: 0.7 },
            stroke: { value: "white" }
        }
    ]
};

export const GENE_ANNOTATION_PLOT: GeminiSpec = {
    tracks: [
        {
            data: { url: "https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/Homo_sapiens.GRCh38.92.glyph.csv", type: 'csv' },
            mark: { server: "gemini.v1", type: "glyph-gene-annotation-v1" },
            x: { field: "start", type: "quantitative" },
            xe: { field: "end", type: "quantitative" },
            y: { field: "strand", type: "nominal" },
            text: { field: "gene_name", type: "nominal" },
            color: { field: "strand", type: "nominal" },
            exonVersion: { field: "exon_version", type: "nominal" },
            geneOrExon: { field: "feature", type: "nominal" },
            exonId: { field: "exon_id", type: "nominal" },
            opacity: { value: 0.9 }
        }
    ]
};