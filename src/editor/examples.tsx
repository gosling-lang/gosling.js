import { GeminiSpec } from '../lib/gemini.schema';
import { GENE_ANNOTATION_PLOT, GENE_ANNOTATION_PLOT_SIMPLE, CYTOGENETIC_BAND } from '../lib/test/gemini/glyph-examples';
import {
    LAYOUT_EXAMPLE_COMBO_HORIZONTAL,
    LAYOUT_EXAMPLE_LINK,
    LAYOUT_EXAMPLE_COMBO,
    LAYOUT_EXAMPLE_COMBO_BAND,
    LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS,
    LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS_CIRCULAR,
    GEMINI_TRACK_EXAMPLE,
    GEMINI_TRACK_EXAMPLE2,
    GEMINI_TRACK_EXAMPLE3
} from '../lib/test/gemini/layout-examples';

interface Demo {
    name: string;
    spec: GeminiSpec;
    glyphWidth: number;
    glyphHeight: number;
}

export const demos: ReadonlyArray<Demo> = [
    {
        name: 'Gene Annotation Plot (Simple)',
        spec: GENE_ANNOTATION_PLOT_SIMPLE,
        glyphWidth: 300,
        glyphHeight: 150
    },
    {
        name: 'Gene Annotation Plot',
        spec: GENE_ANNOTATION_PLOT,
        glyphWidth: 600,
        glyphHeight: 150
    },
    {
        name: 'Cytogenetic Band',
        spec: CYTOGENETIC_BAND,
        glyphWidth: 900,
        glyphHeight: 150
    },
    {
        name: 'Six Different Between-Links',
        spec: LAYOUT_EXAMPLE_LINK,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Between-Links (Combo)',
        spec: LAYOUT_EXAMPLE_COMBO,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Between-Links (Combo, Horizontal)',
        spec: LAYOUT_EXAMPLE_COMBO_HORIZONTAL,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Stacked Multiple Tracks',
        spec: LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Stacked Multiple Tracks (Circular)',
        spec: LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS_CIRCULAR,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Between-Bands (HiGlass Tracks)',
        spec: LAYOUT_EXAMPLE_COMBO_BAND,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'HiGlass Gemini Track (zoom action example 1)',
        spec: GEMINI_TRACK_EXAMPLE,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'HiGlass Gemini Track (zoom action example 2)',
        spec: GEMINI_TRACK_EXAMPLE2,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'HiGlass Gemini Track (zoom action example 3)',
        spec: GEMINI_TRACK_EXAMPLE3,
        glyphWidth: 0,
        glyphHeight: 0
    }
] as const;
