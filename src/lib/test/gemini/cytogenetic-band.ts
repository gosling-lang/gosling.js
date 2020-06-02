import { GeminiSpec } from "../../gemini.schema";

export const CYTOGENETIC_BAND: GeminiSpec = {
    tracks: [
        {
            data: "https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/chr1_cytogenetic_band.glyph.csv",
            mark: { server: "gemini.v1", type: "cytogenetic-band-v1" },
            x: { field: "Basepair_start", type: "quantitative" },
            x1: { field: "Basepair_stop", type: "quantitative" },
            y: { field: "Chr.", type: "nominal" },
            text: { field: "Band", type: "nominal" },
            stain: { field: 'Stain', type: 'nominal' },
            color: { field: "Density", type: "nominal", domain: ['', '25', '50', '75', '100'], range: ['white', '#D9D9D9', '#979797', '#636363', 'black'] }
        }
    ]
};