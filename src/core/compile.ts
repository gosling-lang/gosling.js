import { GoslingSpec, TemplateTrackDef } from './gosling.schema';
import { compileLayout } from './layout/layout';
import { HiGlassSpec } from './higlass.schema';
import { traverseToFixSpecDownstream, overrideDataTemplates } from './utils/spec-preprocess';
import { replaceTrackTemplates } from './utils/template';
import { Size } from './utils/bounding-box';
import { CompleteThemeDeep } from './utils/theme';

export function compile(
    spec: GoslingSpec,
    setHg: (hg: HiGlassSpec, size: Size) => void,
    templates: TemplateTrackDef[],
    theme: Required<CompleteThemeDeep>
) {
    // Override default visual encoding (i.e., `DataTrack` => `BasicSingleTrack`)
    overrideDataTemplates(spec);

    // Replace track templates with raw gosling specs (i.e., `TemplateTrack` => `SingleTrack | OverlaidTrack`)
    replaceTrackTemplates(spec, templates);

    // Fix track specs by looking into the root-level spec
    traverseToFixSpecDownstream(spec);

    // Make HiGlass models for individual tracks
    compileLayout(spec, setHg, theme);
}
