import { GoslingSpec, TemplateTrackDef } from './gosling.schema';
import { HiGlassSpec } from './higlass.schema';
import { traverseToFixSpecDownstream, overrideDataTemplates } from './utils/spec-preprocess';
import { replaceTrackTemplates } from './utils/template';
import { getRelativeTrackInfo, Size } from './utils/bounding-box';
import { CompleteThemeDeep } from './utils/theme';
import { renderHiGlass as createHiGlassModels } from './create-higlass-models';
import { manageResponsiveSpecs } from './responsive';

export function compile(
    spec: GoslingSpec,
    setHg: (hg: HiGlassSpec, size: Size, gs: GoslingSpec) => void,
    templates: TemplateTrackDef[],
    theme: Required<CompleteThemeDeep>,
    curSize?: { width: number; height: number }
) {
    // Make sure to keep the original spec as-is
    const specCopy = JSON.parse(JSON.stringify(spec));

    // Override default visual encoding (i.e., `DataTrack` => `BasicSingleTrack`)
    overrideDataTemplates(specCopy);

    // Replace track templates with raw gosling specs (i.e., `TemplateTrack` => `SingleTrack | OverlaidTrack`)
    replaceTrackTemplates(specCopy, templates);

    // Fix track specs by looking into the root-level spec
    traverseToFixSpecDownstream(specCopy);

    // Generate arrangement data
    const trackInfosAndSize = getRelativeTrackInfo(specCopy, theme);
    let { trackInfos } = trackInfosAndSize;
    const { size } = trackInfosAndSize;

    // Handle responsive specs, either remove them or replace original specs w/ them
    const wFactor = curSize ? curSize?.width / size.width : 1;
    const hFactor = curSize ? curSize?.height / size.height : 1;
    const replaced = manageResponsiveSpecs(specCopy, wFactor, hFactor);

    // Do the downstream-fix and track arrangement again using the updated spec
    if (replaced) {
        traverseToFixSpecDownstream(specCopy);
        trackInfos = getRelativeTrackInfo(specCopy, theme).trackInfos;
    }

    // Make HiGlass models for individual tracks
    createHiGlassModels(JSON.parse(JSON.stringify(specCopy)), trackInfos, setHg, theme);
}
