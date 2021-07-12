import { GoslingSpec } from '../gosling.schema';
import { renderHiGlass } from './higlass';
import { getRelativeTrackInfo, Size } from '../utils/bounding-box';
import { HiGlassSpec } from '../higlass.schema';
import { CompleteThemeDeep } from '../utils/theme';

export function compileLayout(
    spec: GoslingSpec,
    setHg: (hg: HiGlassSpec, size: Size) => void,
    theme: CompleteThemeDeep
) {
    // Generate arrangement data
    const trackInfo = getRelativeTrackInfo(spec);

    // Render HiGlass tracks
    renderHiGlass(spec, trackInfo, setHg, theme);
}
