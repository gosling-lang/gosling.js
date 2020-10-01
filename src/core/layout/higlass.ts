import { TrackInfo } from '../utils/bounding-box';
import { geminiToHiGlass } from '../gemini-to-higlass';
import { HiGlassModel } from '../higlass-model';
import { HiGlassSpec } from '../higlass.schema';
import { getLinkingInfo } from '../utils/linking';

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

    // Linking views
    const linkingInfos = getLinkingInfo(hgModel);

    // console.log(linkingInfos);

    // fill `locksByViewUid`
    linkingInfos.forEach(d => {
        hgModel.spec().zoomLocks.locksByViewUid[d.viewId] = d.linkId;
        hgModel.spec().locationLocks.locksByViewUid[d.viewId] = d.linkId;
    });

    // fill `locksDict`
    const uniqueLinkIds = Array.from(new Set(linkingInfos.map(d => d.linkId)));

    uniqueLinkIds.forEach(linkId => {
        hgModel.spec().zoomLocks.locksDict[linkId] = { uid: linkId };
        hgModel.spec().locationLocks.locksDict[linkId] = { uid: linkId };

        linkingInfos
            .filter(d => d.linkId === linkId)
            .forEach(d => {
                hgModel.spec().zoomLocks.locksDict[linkId][d.viewId] = [124625310.5, 1547846991.5, 249250.621];
                hgModel.spec().locationLocks.locksDict[linkId][d.viewId] = [124625310.5, 1547846991.5, 249250.621];
            });
    });

    setHg(hgModel.spec());
}
