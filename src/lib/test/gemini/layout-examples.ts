import { GeminiSpec } from "../../gemini.schema";

export const LAYOUT_EXAMPLE_LINK: GeminiSpec = {
    tracks: [
        {
            data: 'dummy-link', mark: 'link-between',
            x: { field: 'from', type: "nominal" },
            y: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: 'dummy-link', mark: 'link-between',
            x1: { field: 'from', type: "nominal" },
            y: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: 'dummy-link', mark: 'link-between',
            x1: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: 'dummy-link', mark: 'link-between',
            x: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: 'dummy-link', mark: 'link-between',
            x: { field: 'from', type: "nominal" },
            x1: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: 'dummy-link', mark: 'link-between',
            y: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
    ]
}

export const LAYOUT_EXAMPLE_COMBO: GeminiSpec = {
    references: [
        "http://genocat.tools/tools/combo.html",
        "http://genocat.tools/tools/gbrowse_syn.html",
        "http://genocat.tools/tools/ggbio.html",
        "http://genocat.tools/tools/give.html",
        "http://genocat.tools/tools/variant_view.html"
    ],
    tracks: [
        {
            data: 'dummy', mark: 'dummy',
            width: 500, height: 100
        },
        {
            data: 'dummy-link', mark: 'link-between',
            x1: { field: 'from', type: "nominal" },
            x: { field: 'to', type: "nominal" },
            width: 500, height: 100
        },
        {
            data: 'dummy', mark: 'dummy',
            width: 500, height: 100
        },
    ]
}