import { GoslingSpec } from '../../core/gosling.schema';
import { EX_SPEC_LAYOUT_AND_ARRANGEMENT_1, EX_SPEC_LAYOUT_AND_ARRANGEMENT_2 } from './layout-and-arrangement';
import { EX_SPEC_VISUAL_ENCODING } from './visual-encoding';
import { EX_SPEC_LINKING } from './visual-linking';
import { EX_SPEC_BASIC_SEMANTIC_ZOOM } from './basic-semantic-zoom';
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
import { EX_SPEC_FUJI_PLOT } from './fuji';

export const examples: ReadonlyArray<{
    name: string;
    spec: GoslingSpec;
    description?: string;
    underDevelopment?: boolean;
    hidden?: boolean;
    forceShow?: boolean;
}> = [
    {
        name: 'DEBUG',
        spec: EX_SPEC_FUJI_PLOT,
        hidden: true
    },
    {
        name: 'Basic Example: Visual Encoding',
        spec: EX_SPEC_VISUAL_ENCODING,
        forceShow: true
    },
    {
        name: 'Basic Example: Visual Linking',
        spec: EX_SPEC_LINKING
    },
    {
        name: 'Basic Example: Layouts and Arrangements',
        spec: EX_SPEC_LAYOUT_AND_ARRANGEMENT_1
    },
    {
        name: 'Layouts and Arrangements 2',
        spec: EX_SPEC_LAYOUT_AND_ARRANGEMENT_2,
        hidden: true
    },
    {
        name: 'Basic Example: Semantic Zoom',
        spec: EX_SPEC_BASIC_SEMANTIC_ZOOM
    },
    {
        name: 'Circular Overview + Linear Detail Views',
        spec: EX_SPEC_CIRCULAR_OVERVIEW_LINEAR_DETAIL
    },
    {
        name: 'Circos',
        spec: EX_SPEC_CIRCOS
    },
    {
        name: "Gremlin (O'Brien et al. 2010)",
        spec: EX_SPEC_GREMLIN
    },
    {
        name: 'SARS-CoV-2',
        spec: EX_SPEC_SARS_COV_2
    },
    {
        name: 'Cyto Bands',
        spec: EX_SPEC_CYTOBANDS
    },
    {
        name: 'Custom Gene Annotation',
        spec: EX_SPEC_GENE_ANNOTATION
    },
    {
        name: 'Advanced Zoom Technique',
        spec: EX_SPEC_SEMANTIC_ZOOM
    },
    {
        name: 'Pathogenic Lollipop Plot',
        spec: EX_SPEC_PATHOGENIC,
        hidden: true
    },
    {
        name: 'GIVE (Cao et al. 2018)',
        spec: EX_SPEC_GIVE
    },
    {
        name: 'Corces et al. 2020',
        spec: EX_SPEC_CORCES_ET_AL
    }
].filter(d => !d.hidden);
