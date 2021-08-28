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
    // Make sure to keep the original spec as is
    const _spec = JSON.parse(JSON.stringify(spec));

    // Override default visual encoding (i.e., `DataTrack` => `BasicSingleTrack`)
    overrideDataTemplates(_spec);

    // Replace track templates with raw gosling specs (i.e., `TemplateTrack` => `SingleTrack | OverlaidTrack`)
    replaceTrackTemplates(_spec, templates);

    // Fix track specs by looking into the root-level spec
    traverseToFixSpecDownstream(_spec);

    // Make HiGlass models for individual tracks
    compileLayout(_spec, setHg, theme);
}
