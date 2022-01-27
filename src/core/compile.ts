import { GoslingSpec, TemplateTrackDef } from './gosling.schema';
import { HiGlassSpec } from './higlass.schema';
import { traverseToFixSpecDownstream, overrideDataTemplates } from './utils/spec-preprocess';
import { replaceTrackTemplates } from './utils/template';
import { getRelativeTrackInfo, Size } from './utils/bounding-box';
import { CompleteThemeDeep } from './utils/theme';
import { renderHiGlass } from './create-higlass-models';

export function compile(
    spec: GoslingSpec,
    setHg: (hg: HiGlassSpec, size: Size) => void,
    templates: TemplateTrackDef[],
    theme: Required<CompleteThemeDeep>
) {
    // Make sure to keep the original spec as is
    const specCopy = JSON.parse(JSON.stringify(spec));

    // Override default visual encoding (i.e., `DataTrack` => `BasicSingleTrack`)
    overrideDataTemplates(specCopy);

    // Replace track templates with raw gosling specs (i.e., `TemplateTrack` => `SingleTrack | OverlaidTrack`)
    replaceTrackTemplates(specCopy, templates);

    // Fix track specs by looking into the root-level spec
    traverseToFixSpecDownstream(specCopy);

    // Generate arrangement data
    const trackInfo = getRelativeTrackInfo(specCopy, theme);

    // Make HiGlass models for individual tracks
    renderHiGlass(specCopy, trackInfo, setHg, theme);
}
