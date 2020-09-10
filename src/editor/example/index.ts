import { GeminiSpec } from '../../core/gemini.schema';
import { EXMAPLE_BASIC_MARKS } from './basic-marks';
import { EXAMPLE_SUPERPOSE } from './superpose';
import { EXAMPLE_GENE_ANNOTATION } from './gene-annotation';
import { EXAMPLE_LINKS } from './links';
import { EXAMPLE_OVERVIEW_DEATIL } from './overview-plus-detail-views';
import { EXAMPLE_PERIPHERAL_PLOT } from './peripheral-plot';
import { EXAMPLE_SEMANTIC_ZOOMING_SEQ } from './semantic-zoom-seq';

export const examples: ReadonlyArray<{
    name: string;
    spec: GeminiSpec;
}> = [
    {
        name: 'Basic Marks',
        spec: EXMAPLE_BASIC_MARKS
    },
    {
        name: 'Superposed Tracks',
        spec: EXAMPLE_SUPERPOSE
    },
    {
        name: 'Custom Gene Annotation Tracks',
        spec: EXAMPLE_GENE_ANNOTATION
    },
    {
        name: 'Between and Within Links',
        spec: EXAMPLE_LINKS
    },
    {
        name: 'Overview + Detail views (under development)',
        spec: EXAMPLE_OVERVIEW_DEATIL
    },
    {
        name: 'Peripheral Plot (under development)',
        spec: EXAMPLE_PERIPHERAL_PLOT
    },
    {
        name: 'Semantic Zooming for Sequence Data',
        spec: EXAMPLE_SEMANTIC_ZOOMING_SEQ
    }
    /*
    // old demos that we may need to support again in the future
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
    }
    */
] as const;
