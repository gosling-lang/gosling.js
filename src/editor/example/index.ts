import { GoslingSpec } from '../../core/gosling.schema';
import { EX_SPEC_CIRCULAR_OVERVIEW_LINEAR_DETAIL } from './circular-overview-linear-detail-views';
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
        name: 'Circular Overview + Linear Detail Views',
        spec: EX_SPEC_CIRCULAR_OVERVIEW_LINEAR_DETAIL
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
        forceShow: true
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
