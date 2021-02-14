import { GoslingSpec, Track } from '../../core/gosling.schema';

import { ScalableSequenceTrack, ScalableCytoBand } from '../example-new/semantic-zoom';

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
import { EXAMPLE_DATASETS } from './basic/datasets';

export const basic: Track = {
    data: {
        url: EXAMPLE_DATASETS.multivec,
        type: 'multivec',
        row: 'sample',
        column: 'position',
        value: 'peak',
        categories: ['sample 1'],
        bin: 12
    },
    mark: 'bar',
    x: {
        field: 'start',
        type: 'genomic',
        domain: { chromosome: '1', interval: [1, 3000500] }
    },
    xe: {
        field: 'end',
        type: 'genomic'
    },
    y: { field: 'peak', type: 'quantitative' },
    color: { value: 'steelblue' },
    // row: { field: 'sample', type: 'nominal' },
    width: 400,
    height: 65
};

const ex1 = {
    title: 'Example',
    subtitle: 'Relative Arrangement',
    layout: 'circular',
    static: false,
    parallelViews: [
        {
            serialViews: [
                // {
                //     parallelViews: [
                //         {
                //             tracks: [
                //                 { ...basic, width: 400, height: 60},
                //                 { ...basic, width: 400, height: 60},
                //             ]
                //         },
                //         {
                //             serialViews: [
                //                 {
                //                     tracks: [
                //                         { ...basic, width: 200, height: 60},
                //                     ]
                //                 },
                //                 {
                //                     tracks: [
                //                         { ...basic, width: 200, height: 60},
                //                     ]
                //                 }
                //             ]
                //         }
                //     ]
                // },
                {
                    parallelViews: [
                        {
                            tracks: [ScalableSequenceTrack, ScalableCytoBand]
                        },
                        {
                            tracks: [basic, basic]
                        }
                    ]
                },
                {
                    tracks: [basic]
                }
            ]
        },
        {
            tracks: [basic]
        }
    ]
} as GoslingSpec;

export const ex2 = {
    layout: 'circular',
    parallelViews: [
        {
            parallelViews: [{ tracks: [{ ...basic, width: 400, height: 60 }] }]
        },
        {
            tracks: [{ ...basic, width: 400, height: 60 }]
        }
    ]
} as GoslingSpec;

export const examples: ReadonlyArray<{
    name: string;
    spec: GoslingSpec;
    description?: string;
    underDevelopment?: boolean;
    hidden?: boolean;
    forceShow?: boolean;
}> = [
    {
        name: 'Experimental',
        spec: ex1,
        hidden: false
    }
].filter(d => !d.hidden);
