import type { GoslingSpec, TemplateTrackDef, VisUnitApiData } from '@gosling-lang/gosling-schema';
import type { HiGlassSpec } from '@gosling-lang/higlass-schema';
import { processGoslingSpec } from './spec-preprocess';
import { replaceTrackTemplates } from '../core/utils/template';
import { getRelativeTrackInfo, type Size, type TrackInfo } from './bounding-box';
import type { CompleteThemeDeep } from '../core/utils/theme';
import type { UrlToFetchOptions } from 'src/core/gosling-component';
import { renderHiGlass as createHiGlassModels } from './create-higlass-models';
import { manageResponsiveSpecs } from './responsive';
import type { IdTable } from '../api/track-and-view-ids';

interface CompileResult {
    hg: HiGlassSpec;
    size: Size;
    gs: GoslingSpec;
    tracksAndViews: VisUnitApiData[];
    idTable: IdTable;
    trackInfos: TrackInfo[];
    theme: Required<CompleteThemeDeep>;
}

export function compile(
    originalSpec: GoslingSpec,
    templates: TemplateTrackDef[],
    theme: Required<CompleteThemeDeep>,
    containerStatus: {
        containerSize?: { width: number; height: number };
        containerParentSize?: { width: number; height: number };
    },
    urlToFetchOptions?: UrlToFetchOptions
): CompileResult {
    // Make sure not to edit the original spec
    const specCopy = JSON.parse(JSON.stringify(originalSpec));

    // Replace track templates with gosling specs (i.e., `TemplateTrack` => `SingleTrack | OverlaidTrack`)
    replaceTrackTemplates(specCopy, templates);

    // Fill in missing values and inherit parents' properties.
    processGoslingSpec(specCopy);

    // Generate arrangement data
    const trackInfosAndSize = getRelativeTrackInfo(specCopy, theme);
    let { trackInfos } = trackInfosAndSize;
    const { size } = trackInfosAndSize;

    // Handle responsive specs, either remove them or replace original specs w/ them
    const isResponsiveWidth =
        (typeof originalSpec.responsiveSize === 'object' && originalSpec.responsiveSize?.width) ||
        originalSpec.responsiveSize;
    const isResponsiveHeight =
        (typeof originalSpec.responsiveSize === 'object' && originalSpec.responsiveSize?.height) ||
        originalSpec.responsiveSize;
    const wFactor =
        isResponsiveWidth && containerStatus.containerSize ? containerStatus.containerSize.width / size.width : 1;
    const hFactor =
        isResponsiveHeight && containerStatus.containerSize ? containerStatus.containerSize.height / size.height : 1;
    const pWidth = containerStatus.containerParentSize
        ? containerStatus.containerParentSize.width
        : Number.MAX_SAFE_INTEGER;
    const pHeight = containerStatus.containerParentSize
        ? containerStatus.containerParentSize.height
        : Number.MAX_SAFE_INTEGER;
    const replaced = manageResponsiveSpecs(specCopy, wFactor, hFactor, pWidth, pHeight);

    // Do the downstream-fix and track arrangement again using the updated spec
    if (replaced) {
        processGoslingSpec(specCopy);
        trackInfos = getRelativeTrackInfo(specCopy, theme).trackInfos;
    }

    // Make HiGlass models for individual tracks
    const compileResult = createHiGlassModels(specCopy, trackInfos, theme, urlToFetchOptions);
    return compileResult;
}
