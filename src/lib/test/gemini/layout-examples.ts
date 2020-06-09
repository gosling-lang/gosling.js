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
            mark: 'rect',
            x: { type: 'genomic' },
            width: 600, height: 60
        },
        {
            data: { url: 'https://resgen.io/api/v1/tileset_info/?d=a-iBpdh3Q_uO2FLCWKpOOw', type: 'tileset' },
            mark: 'line',
            x: { type: 'genomic' },
            width: 600, height: 60
        },
        {
            data: { url: 'http://higlass.io/api/v1/tileset_info/?d=OHJakQICQD6gTD7skx4EWA', type: 'tileset' },
            mark: {
                type: 'gene-annotation-higlass',
                server: 'gemini-v1'
            },
            x: { type: 'genomic', axis: true, domain: [1519086324.7628496, 1519471836.3240566] },
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
        },
        {
            data: { url: 'https://resgen.io/api/v1/tileset_info/?d=a-iBpdh3Q_uO2FLCWKpOOw', type: 'tileset' },
            mark: 'bar',
            x: { type: 'genomic' },
            width: 600, height: 60
        },
        {
            data: { url: 'https://resgen.io/api/v1/tileset_info/?d=a-iBpdh3Q_uO2FLCWKpOOw', type: 'tileset' },
            mark: 'point',
            x: { type: 'genomic' },
            width: 600, height: 60
        },
    ]
}

export const LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS: GeminiSpec = {
    layout: { type: 'linear', direction: 'vertical' },
    tracks: [
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30, style: { background: '#FAF9F7' } },
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30 },
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30, style: { background: '#FAF9F7' } },
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30 },
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30, style: { background: '#FAF9F7' } },
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30 },
    ]
}

export const LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS_CIRCULAR: GeminiSpec = {
    layout: { type: 'circular', direction: 'vertical' },
    tracks: [
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30, style: { background: '#FAF9F7' } },
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30 },
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30, style: { background: '#FAF9F7' } },
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30 },
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30, style: { background: '#FAF9F7' } },
        { data: { url: 'dummy', type: 'csv' }, mark: 'dummy', width: 500, height: 30 },
    ]
}