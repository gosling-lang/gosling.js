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
            width: 600, height: 50
        },
        {
            data: 'dummy-link', mark: 'link-between',
            x1: { field: 'from', type: "nominal" },
            x: { field: 'to', type: "nominal" },
            width: 600, height: 50
        },
        {
            data: 'dummy', mark: 'dummy',
            width: 600, height: 50
        }
    ]
}

export const LAYOUT_EXAMPLE_COMBO_HORIZONTAL: GeminiSpec = {
    layout: { type: 'linear', direction: 'horizontal', wrap: -1 },
    tracks: [
        {
            data: 'dummy', mark: 'dummy',
            width: 60, height: 500
        },
        {
            data: 'dummy-link', mark: 'link-between',
            y: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 60, height: 500
        },
        {
            data: 'dummy', mark: 'dummy',
            width: 60, height: 500
        }
    ]
}

export const LAYOUT_EXAMPLE_DOMINO: GeminiSpec = {
    layout: { type: 'linear', direction: 'horizontal', wrap: 3 },
    tracks: [
        {
            data: 'dummy', mark: 'empty',
            width: 50, height: 50
        },
        {
            data: 'dummy', mark: 'dummy',
            width: 500, height: 50
        },
        {
            data: 'dummy', mark: 'empty',
            width: 50, height: 50
        },
        {
            data: 'dummy', mark: 'dummy',
            width: 50, height: 500
        },
        {
            data: 'dummy-link', mark: 'link-between',
            y: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 500, height: 500
        },
        {
            data: 'dummy', mark: 'dummy',
            width: 50, height: 500
        },
        {
            data: 'dummy', mark: 'empty',
            width: 50, height: 50
        },
        {
            data: 'dummy', mark: 'dummy',
            width: 500, height: 50
        },
        {
            data: 'dummy', mark: 'empty',
            width: 50, height: 50
        },
    ]
}