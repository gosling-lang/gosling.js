import { GeminiSpec } from "../../gemini.schema";

export const LAYOUT_EXAMPLE_LINK: GeminiSpec = {
    tracks: [
        {
            data: { url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv', type: 'csv' },
            mark: 'link-between',
            x: { field: 'from', type: "nominal" },
            y: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: { url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv', type: 'csv' },
            mark: 'link-between',
            x1: { field: 'from', type: "nominal" },
            y: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: { url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv', type: 'csv' },
            mark: 'link-between',
            x1: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: { url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv', type: 'csv' },
            mark: 'link-between',
            x: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: { url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv', type: 'csv' },
            mark: 'link-between',
            x: { field: 'from', type: "nominal" },
            x1: { field: 'to', type: "nominal" },
            width: 50, height: 50
        },
        {
            data: { url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv', type: 'csv' },
            mark: 'link-between',
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
            data: { url: 'dummy', type: 'csv' }, mark: 'dummy',
            width: 600, height: 50
        },
        {
            data: { url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv', type: 'csv' },
            mark: 'link-between',
            x1: { field: 'from', type: "nominal" },
            x: { field: 'to', type: "nominal" },
            width: 600, height: 50
        },
        {
            data: { url: 'dummy', type: 'csv' }, mark: 'dummy',
            width: 600, height: 50
        }
    ]
}

export const LAYOUT_EXAMPLE_COMBO_HORIZONTAL: GeminiSpec = {
    layout: { type: 'linear', direction: 'horizontal', wrap: -1 },
    tracks: [
        {
            data: { url: 'dummy', type: 'csv' }, mark: 'dummy',
            width: 60, height: 500
        },
        {
            data: { url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/potint-to-point-relation.csv', type: 'csv' },
            mark: 'link-between',
            y: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 60, height: 500
        },
        {
            data: { url: 'dummy', type: 'csv' }, mark: 'dummy',
            width: 60, height: 500
        }
    ]
}

export const LAYOUT_EXAMPLE_COMBO_BAND: GeminiSpec = {
    references: [
        "http://genocat.tools/tools/combo.html",
        "http://genocat.tools/tools/gbrowse_syn.html",
        "http://genocat.tools/tools/ggbio.html",
        "http://genocat.tools/tools/give.html",
        "http://genocat.tools/tools/variant_view.html"
    ],
    tracks: [
        {
            data: { url: 'https://resgen.io/api/v1/tileset_info/?d=a-iBpdh3Q_uO2FLCWKpOOw', type: 'tileset' },
            mark: 'point',
            x: { type: 'genomic' },
            width: 600, height: 120
        },
        {
            data: { url: 'http://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA', type: 'tileset' },
            mark: {
                type: 'gene-annotation-higlass',
                server: 'gemini-v1'
            },
            x: { type: 'genomic', axis: true },
            width: 600, height: 120
        },
        {
            data: { url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/range-to-range-relation.csv', type: 'csv' },
            mark: 'link-between',
            x1: { field: 'from' },
            x1e: { field: 'from1' },
            x: { field: 'to' },
            xe: { field: 'to1' },
            width: 600, height: 150,
            stroke: { value: 'none' }
        },
        {
            data: { url: 'http://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA', type: 'tileset' },
            mark: {
                type: 'gene-annotation-higlass',
                server: 'gemini-v1'
            },
            x: { type: 'genomic' },
            x1: { axis: true },
            width: 600, height: 120
        }
    ]
}

export const LAYOUT_EXAMPLE_DOMINO: GeminiSpec = {
    layout: { type: 'linear', direction: 'horizontal', wrap: 3 },
    tracks: [
        {
            data: { url: 'dummy', type: 'csv' }, mark: 'empty',
            width: 50, height: 50
        },
        {
            data: { url: 'dummy', type: 'csv' }, mark: 'dummy',
            width: 500, height: 50
        },
        {
            data: { url: 'dummy', type: 'csv' }, mark: 'empty',
            width: 50, height: 50
        },
        {
            data: { url: 'dummy', type: 'csv' }, mark: 'dummy',
            width: 50, height: 500
        },
        {
            data: { url: 'dummy-link', type: 'csv' }, mark: 'link-between',
            y: { field: 'from', type: "nominal" },
            y1: { field: 'to', type: "nominal" },
            width: 500, height: 500
        },
        {
            data: { url: 'dummy', type: 'csv' }, mark: 'dummy',
            width: 50, height: 500
        },
        {
            data: { url: 'dummy', type: 'csv' }, mark: 'empty',
            width: 50, height: 50
        },
        {
            data: { url: 'dummy', type: 'csv' }, mark: 'dummy',
            width: 500, height: 50
        },
        {
            data: { url: 'dummy', type: 'csv' }, mark: 'empty',
            width: 50, height: 50
        },
    ]
}