import { GoslingSpec } from '../../core/gosling.schema';
import { EX_SPEC_LAYOUT_AND_ARRANGEMENT_1, EX_SPEC_LAYOUT_AND_ARRANGEMENT_2 } from './layout-and-arrangement';
import { EX_SPEC_DARK_THEME, EX_SPEC_VISUAL_ENCODING, EX_SPEC_VISUAL_ENCODING_CIRCULAR } from './visual-encoding';
import { EX_SPEC_CANCER_VARIANT } from './cancer-variant';
import { EX_SPEC_MATRIX_HFFC6 } from './matrix-hffc6';
import { EX_SPEC_LINKING } from './visual-linking';
import { EX_SPEC_BASIC_SEMANTIC_ZOOM } from './basic-semantic-zoom';
import { EX_SPEC_MARK_DISPLACEMENT } from './mark-displacement';
import { EX_SPEC_CIRCULAR_OVERVIEW_LINEAR_DETAIL } from './circular-overview-linear-detail-views';
import { EX_SPEC_SARS_COV_2 } from './sars-cov-2';
import { EX_SPEC_CIRCOS } from './circos';
import { EX_SPEC_GREMLIN } from './gremlin';
import { EX_SPEC_GENE_ANNOTATION } from './gene-annotation';
import { EX_SPEC_SEMANTIC_ZOOM } from './semantic-zoom';
import { EX_SPEC_GIVE } from './give';
import { EX_SPEC_CORCES_ET_AL } from './corces';
import { EX_SPEC_PATHOGENIC } from './pathogenic';
import { EX_SPEC_CYTOBANDS } from './ideograms';
import { EX_SPEC_PILEUP } from './pileup';
import { EX_SPEC_CUSTOM_THEME } from './theme';
import { EX_SPEC_FUJI_PLOT } from './fuji';

export const examples: ReadonlyArray<{
    name: string;
    spec: GoslingSpec;
    id: string;
    description?: string;
    underDevelopment?: boolean;
    hidden?: boolean;
    forceShow?: boolean;
}> = [
    {
        name: 'DEBUG',
        spec: EX_SPEC_FUJI_PLOT,
        id: 'FUJI_PLOT',
        hidden: true
    },
    {
        name: 'Basic Example: Visual Encoding',
        id: 'VISUAL_ENCODING',
        spec: EX_SPEC_VISUAL_ENCODING
    },
    {
        name: 'Basic Example: Circular Visual Encoding',
        id: 'VISUAL_ENCODING_CIRCULAR',
        spec: EX_SPEC_VISUAL_ENCODING_CIRCULAR
    },
    {
        name: 'Basic Example: Visual Linking',
        id: 'LINKING',
        spec: EX_SPEC_LINKING
    },
    {
        name: 'Basic Example: Layouts and Arrangements',
        id: 'LAYOUT_AND_ARRANGEMENT_1',
        spec: EX_SPEC_LAYOUT_AND_ARRANGEMENT_1
    },
    {
        name: 'Layouts and Arrangements 2',
        id: 'LAYOUT_AND_ARRANGEMENT_2',
        spec: EX_SPEC_LAYOUT_AND_ARRANGEMENT_2,
        hidden: true
    },
    {
        name: 'Basic Example: Basic Idea of Semantic Zoom',
        id: 'BASIC_SEMANTIC_ZOOM',
        spec: EX_SPEC_BASIC_SEMANTIC_ZOOM
    },
    {
        name: 'Basic Example: Mark Displacement',
        id: 'MARK_DISPLACEMENT',
        spec: EX_SPEC_MARK_DISPLACEMENT
    },
    {
        name: 'Basic Example: Circular Overview + Linear Detail Views',
        id: 'CIRCULAR_OVERVIEW_LINEAR_DETAIL',
        spec: EX_SPEC_CIRCULAR_OVERVIEW_LINEAR_DETAIL
    },
    {
        name: 'Pileup Tracks (BAM File)',
        spec: EX_SPEC_PILEUP,
        id: 'BAM_PILEUP',
        forceShow: true
    },
    {
        name: 'Semantic Zoom Examples',
        id: 'SEMANTIC_ZOOM',
        spec: EX_SPEC_SEMANTIC_ZOOM
    },
    {
        name: 'Ideograms',
        id: 'CYTOBANDS',
        spec: EX_SPEC_CYTOBANDS
    },
    {
        name: 'Custom Gene Annotation',
        id: 'GENE_ANNOTATION',
        spec: EX_SPEC_GENE_ANNOTATION
    },
    {
        name: 'Comparative Matrices (Micro-C vs. Hi-C)',
        id: 'MATRIX_HFFC6',
        spec: EX_SPEC_MATRIX_HFFC6
    },
    {
        name: 'Circos',
        id: 'CIRCOS',
        spec: EX_SPEC_CIRCOS
    },
    {
        name: 'SARS-CoV-2',
        id: 'SARS_COV_2',
        spec: EX_SPEC_SARS_COV_2
    },
    {
        name: 'Corces et al. 2020',
        id: 'CORCES_ET_AL',
        spec: EX_SPEC_CORCES_ET_AL
    },
    {
        name: 'Pathogenic Lollipop Plot',
        id: 'PATHOGENIC',
        spec: EX_SPEC_PATHOGENIC,
        hidden: true
    },
    {
        name: "Gremlin (O'Brien et al. 2010)",
        id: 'GREMLIN',
        spec: EX_SPEC_GREMLIN
    },
    {
        name: 'GIVE (Cao et al. 2018)',
        id: 'GIVE',
        spec: EX_SPEC_GIVE
    },
    {
        name: 'Breast Cancer Variant (Staaf et al. 2019)',
        id: 'CANCER_VARIANT',
        spec: EX_SPEC_CANCER_VARIANT
    },
    {
        name: 'Dark Theme (Beta)',
        id: 'DARK_THEME',
        spec: EX_SPEC_DARK_THEME,
        underDevelopment: true
    },
    {
        name: 'Custom Theme (Beta)',
        id: 'CUSTOM_THEME',
        spec: EX_SPEC_CUSTOM_THEME,
        underDevelopment: true
    }
].filter(d => !d.hidden);
