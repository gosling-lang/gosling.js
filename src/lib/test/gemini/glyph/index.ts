import { Mark } from '../../../gemini.schema';

import { GLYPH_GENE_ANNOTATAION } from './glyph-gene-annotation-plot';
import { GLYPH_LOGO } from './glyph-logo';
import { GLYPH_GENE_ANNOTATAION_V2 } from './glyph-gene-annotation-plot-v2';
import { GLYPH_CYTOGENETIC_BAND } from './glyph-cytogenetic-band';

export const GLYPH_PRESETS: {
    name: GLYPH_LOCAL_PRESET_TYPE,
    mark: Mark
}[] = [
        {
            name: 'glyph-gene-annotation-v1',
            mark: GLYPH_GENE_ANNOTATAION
        },
        {
            name: 'glyph-gene-annotation-v2',
            mark: GLYPH_GENE_ANNOTATAION_V2
        },
        {
            name: 'cytogenetic-band-v1',
            mark: GLYPH_CYTOGENETIC_BAND
        },
        {
            name: 'glyph-logo-plot-v1',
            mark: GLYPH_LOGO
        }
    ];

export type GLYPH_LOCAL_PRESET_TYPE =
    | 'glyph-gene-annotation-v1'
    | 'glyph-gene-annotation-v2'
    | 'cytogenetic-band-v1'
    | 'glyph-logo-plot-v1'

export type GLYPH_HIGLASS_PRESET_TYPE =
    | 'gene-annotation-higlass'

export const GLYPH_HIGLASS_PRESET_TYPES: GLYPH_HIGLASS_PRESET_TYPE[] = [
    'gene-annotation-higlass'
]

export const GLYPH_LOCAL_PRESET_TYPES: (GLYPH_LOCAL_PRESET_TYPE | GLYPH_HIGLASS_PRESET_TYPE)[] = [
    'glyph-gene-annotation-v1',
    'glyph-gene-annotation-v2',
    'cytogenetic-band-v1',
    'glyph-logo-plot-v1'
];