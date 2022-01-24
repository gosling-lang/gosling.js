import type { GoslingSpec } from 'gosling.js';
import {
    EX_SPEC_VISUAL_ENCODING,
    EX_SPEC_VISUAL_ENCODING_CIRCULAR,
    EX_SPEC_RESPONSIVE,
    EX_SPEC_RULE
} from './visual-encoding';
import { EX_SPEC_LAYOUT_AND_ARRANGEMENT_1, EX_SPEC_LAYOUT_AND_ARRANGEMENT_2 } from './layout-and-arrangement';
import { EX_SPEC_MATRIX } from './matrix';
import { EX_SPEC_CANCER_VARIANT_PROTOTYPE } from './cancer-variant';
import { EX_SPEC_MATRIX_HFFC6 } from './matrix-hffc6';
import { EX_SPEC_LINKING } from './visual-linking';
import { EX_SPEC_BASIC_SEMANTIC_ZOOM } from './basic-semantic-zoom';
import { EX_SPEC_MARK_DISPLACEMENT } from './mark-displacement';
import { EX_SPEC_CIRCULAR_OVERVIEW_LINEAR_DETAIL } from './circular-overview-linear-detail-views';
import { EX_SPEC_SARS_COV_2 } from './sars-cov-2';
import { EX_SPEC_CIRCOS, EX_SPEC_CIRCOS_BETWEEN_LINK, EX_SPEC_CIRCULR_RANGE } from './circos';
import { EX_SPEC_GREMLIN } from './gremlin';
import { EX_SPEC_GENE_ANNOTATION } from './gene-annotation';
import { EX_SPEC_CLINVAR_LOLLIPOP, EX_SPEC_SEQUENCE_TRACK } from './semantic-zoom';
import { EX_SPEC_GIVE } from './give';
import { EX_SPEC_CORCES_ET_AL } from './corces';
import { EX_SPEC_SASHIMI } from './sashimi';
import { EX_SPEC_CYTOBANDS } from './ideograms';
import { EX_SPEC_PILEUP } from './pileup';
import { EX_SPEC_BAND } from './vertical-band';
import { EX_SPEC_TEMPLATE } from './track-template';
import { EX_SPEC_DEBUG } from './debug';
import * as docExamples from './doc-examples';

export const examples: {
    readonly [id: string]: {
        name: string;
        spec: GoslingSpec | string;
        description?: string;
        underDevelopment?: boolean;
        hidden?: boolean;
        forceShow?: boolean;
    };
} = {
    DEBUG: {
        name: 'DEBUG',
        spec: EX_SPEC_DEBUG,
        hidden: true
    },
    VISUAL_ENCODING: {
        name: 'Basic Example: Visual Encoding',
        spec: EX_SPEC_VISUAL_ENCODING
    },
    VISUAL_ENCODING_CIRCULAR: {
        name: 'Basic Example: Circular Visual Encoding',
        spec: EX_SPEC_VISUAL_ENCODING_CIRCULAR
    },
    BAND: {
        name: 'Basic Example: Band Connection',
        spec: EX_SPEC_BAND
    },
    RULE: {
        name: 'Basic Example: Rule Mark',
        spec: EX_SPEC_RULE
    },
    MATRIX: {
        name: 'Basic Example: Hi-C Matrix',
        spec: EX_SPEC_MATRIX
    },
    LINKING: {
        name: 'Basic Example: Visual Linking',
        spec: EX_SPEC_LINKING
    },
    LAYOUT_AND_ARRANGEMENT_1: {
        name: 'Basic Example: Layouts and Arrangements',
        spec: EX_SPEC_LAYOUT_AND_ARRANGEMENT_1,
        hidden: true
    },
    LAYOUT_AND_ARRANGEMENT_2: {
        name: 'Layouts and Arrangements 2',
        spec: EX_SPEC_LAYOUT_AND_ARRANGEMENT_2,
        hidden: true
    },
    BASIC_SEMANTIC_ZOOM: {
        name: 'Basic Example: Basic Idea of Semantic Zoom',
        spec: EX_SPEC_BASIC_SEMANTIC_ZOOM,
        hidden: true
    },
    MARK_DISPLACEMENT: {
        name: 'Basic Example: Mark Displacement',
        spec: EX_SPEC_MARK_DISPLACEMENT
    },
    CIRCULAR_OVERVIEW_LINEAR_DETAIL: {
        name: 'Basic Example: Circular Overview + Linear Detail Views',
        spec: EX_SPEC_CIRCULAR_OVERVIEW_LINEAR_DETAIL
    },
    SEQUENCE: {
        name: 'Multi-Scale Sequence Track',
        spec: EX_SPEC_SEQUENCE_TRACK
    },
    SEMANTIC_ZOOM: {
        name: 'Multi-Scale Clinvar Lollipop Plot',
        spec: EX_SPEC_CLINVAR_LOLLIPOP
    },
    RESPONSIVE_ENCODING: {
        name: 'Responsive Encoding',
        spec: EX_SPEC_RESPONSIVE
    },
    CYTOBANDS: {
        name: 'Ideograms',
        spec: EX_SPEC_CYTOBANDS
    },
    GENE_ANNOTATION: {
        name: 'Custom Gene Annotation',
        spec: EX_SPEC_GENE_ANNOTATION
    },
    MATRIX_HFFC6: {
        name: 'Comparative Matrices (Micro-C vs. Hi-C)',
        spec: EX_SPEC_MATRIX_HFFC6
    },
    CIRCOS: {
        name: 'Circos',
        spec: EX_SPEC_CIRCOS
    },
    'Circular Range': {
        name: 'Circular Range (Inspired By Weather Radials)',
        spec: EX_SPEC_CIRCULR_RANGE,
        hidden: true
    },
    SARS_COV_2: {
        name: 'SARS-CoV-2',
        spec: EX_SPEC_SARS_COV_2
    },
    CORCES_ET_AL: {
        name: 'Corces et al. 2020',
        spec: EX_SPEC_CORCES_ET_AL
    },
    GREMLIN: {
        name: "Gremlin (O'Brien et al. 2010)",
        spec: EX_SPEC_GREMLIN
    },
    SASHIMI_PLOT: {
        name: 'Sashimi Plot',
        spec: EX_SPEC_SASHIMI,
        underDevelopment: true
    },
    CIRCULAR_BETWEEN_BANDS: {
        name: 'Circular Between Bands',
        spec: EX_SPEC_CIRCOS_BETWEEN_LINK,
        underDevelopment: true
    },
    GIVE: {
        name: 'GIVE (Cao et al. 2018)',
        spec: EX_SPEC_GIVE,
        underDevelopment: true
    },
    CANCER_VARIANT: {
        name: 'Breast Cancer Variant (Staaf et al. 2019)',
        spec: EX_SPEC_CANCER_VARIANT_PROTOTYPE
    },
    BAM_PILEUP: {
        name: 'BAM file pileup tracks',
        spec: EX_SPEC_PILEUP
    },
    TEMPLATE: {
        name: 'Track Template',
        spec: EX_SPEC_TEMPLATE,
        underDevelopment: true
    },
    // Followings are doc examples that are only accessible via URLs using the key, such as
    // https://gosling.js.org/?example=doc_area
    doc_area: {
        name: 'Basic Example: Area Mark',
        spec: docExamples.AREA,
        hidden: true
    },
    doc_bar: {
        name: 'Basic Example: Bar Mark',
        spec: docExamples.BAR,
        hidden: true
    },
    doc_brush: {
        name: 'Basic Example: Brush Mark',
        spec: docExamples.BRUSH,
        hidden: true
    },
    doc_line: {
        name: 'Basic Example: Line Mark',
        spec: docExamples.LINE,
        hidden: true
    },
    doc_link: {
        name: 'Basic Example: Link Mark',
        spec: docExamples.LINK,
        hidden: true
    },
    doc_linking_tracks: {
        name: 'Basic Example: Linking Tracks',
        spec: docExamples.LINKING_TRACKS,
        hidden: true
    },
    doc_point: {
        name: 'Basic Example: Point Mark',
        spec: docExamples.POINT,
        hidden: true
    },
    doc_rect: {
        name: 'Basic Example: React Mark',
        spec: docExamples.RECT,
        hidden: true
    },
    doc_text: {
        name: 'Basic Example: Text Mark',
        spec: docExamples.TEXT,
        hidden: true
    },
    doc_triangle: {
        name: 'Basic Example: Triangle Mark',
        spec: docExamples.TRIANGLE,
        hidden: true
    },
    doc_overlay_bar_point: {
        name: 'Overlay Tracks: Bar + Point',
        spec: docExamples.OVERLAY_TRACKS_BAR_POINT,
        hidden: true
    },
    doc_overlay_rect_text: {
        name: 'Overlay Tracks: Rect + Text',
        spec: docExamples.OVERLAY_TRACKS_RECT_TEXT,
        hidden: true
    },
    doc_overlay_line_point: {
        name: 'Overlay Tracks: Line + Point',
        spec: docExamples.OVERLAY_TRACKS_LINE_POINT,
        hidden: true
    },
    doc_semantic_zoom_sequence: {
        name: 'Semantic Zoom: A Sequence Example',
        spec: docExamples.SEMANTIC_ZOOM_SEQUENCE,
        hidden: true
    },
    doc_semantic_zoom_cyto: {
        name: 'Semantic Zoom: Cyto',
        spec: docExamples.SEMANTIC_ZOOM_CYTO,
        hidden: true
    }
};
