import { BoundingBox, TrackInfo } from '../utils/bounding-box';
import { geminiToHiGlass } from '../gemini-to-higlass';
import { HiGlassModel } from '../higlass-model';
import { HiGlassSpec } from '../higlass.schema';

export interface HiGlassInfo {
    viewConfig: any;
    boundingBox: BoundingBox;
}

export function renderHiGlass(trackInfos: TrackInfo[], setHg: (hg: HiGlassSpec) => void) {
    if (trackInfos.length === 0) {
        // no tracks to render
        return;
    }

    const hgModel = new HiGlassModel();
    trackInfos.forEach(tb => {
        const { track, boundingBox: bb, layout } = tb;
        geminiToHiGlass(hgModel, track, bb, layout);
    });

    setHg(hgModel.spec());
}
