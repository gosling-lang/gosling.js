import { GoslingSpec } from '../../core/gosling.schema';

import { EX_SPEC_CIRCULAR_OVERVIEW_LINEAR_DETAIL } from './circular-overview-linear-detail-views';
import { EX_SPEC_GIVE } from './give';
import { EX_SPEC_CORCES_ET_AL } from './corces';

// Real-world examples
// import { CORCES_2020_NATURE_GENETICS } from './corces-2020-nature-genetics';

// // Basic examples
// import { EXMAPLE_BASIC_MARKS } from './basic/basic-marks';
// import { EXAMPLE_SUPERPOSE } from './basic/superpose';
// import { EXAMPLE_IDEOGRAM } from './basic/ideogram';
// import { EXAMPLE_GENE_ANNOTATION } from './basic/gene-annotation';
// import { EXAMPLE_LINKS } from './basic/links';
// import { EXAMPLE_OVERVIEW_DEATIL } from './basic/overview-plus-detail-views';
// import { EXAMPLE_PERIPHERAL_PLOT } from './basic/peripheral-plot';
// import { EXAMPLE_SEMANTIC_ZOOMING } from './basic/semantic-zoom';
// import { EXMAPLE_BASIC_LINKING } from './basic/basic-linking';
// import { EXAMPLE_UPSET } from './basic/upset';
// import { EXAMPLE_LOGO_LIKE } from './basic/text-stretch';
// import { EXAMPLE_CIRCOS } from './basic/circos';
// import { EXAMPLE_CIRCOS_MANY } from './basic/circos-many-rows';
// import { EXAMPLE_CIRCOS_STACKING } from './basic/circos-stacking';
// import { EXAMPLE_SUPERPOSED_CIRCULAR_TRACKS } from './basic/superposed-circular';
// import { EXAMPLE_OF_EXPERIMENT } from './experimental';
// import { EXAMPLE_CYTOAND_HG38 } from './cytoband-hg38';
// import { EXAMPLE_2019_WENGER } from './wenger-2019';
// import { GENOCAT_CIRCOS } from './genocat-circos';
// import { GENOCAT_CNVKIT } from './genocat-cnvkit';
// import { GENOCAT_SWAV } from './genocat-swav';
// import { GENOCAT_GIVE } from './genocat-give';
// import { GENOCAT_GREMLIN } from './genocat-gremlin';
// import { GENOCAT_MIZBEE } from './genocat-mizbee';
// import { EXAMPLE_SIMPLEST } from './basic/simplest-spec';
// import { EXAMPLE_DATA } from './basic/data';
// import { EXMAPLE_BASIC_LINKING_CIRCULAR } from './basic/basic-linking-circular';
// import { EXAMPLE_DATASETS } from '../example/basic/datasets';

export const examples: ReadonlyArray<{
    name: string;
    spec: GoslingSpec;
    description?: string;
    underDevelopment?: boolean;
    hidden?: boolean;
    forceShow?: boolean;
}> = [
    {
        name: 'Circular Overview + Linear Detail Views',
        spec: EX_SPEC_CIRCULAR_OVERVIEW_LINEAR_DETAIL,
        hidden: false
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
