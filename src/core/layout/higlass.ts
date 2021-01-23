import { getGridInfo, Size, TrackInfo } from '../utils/bounding-box';
import { goslingToHiGlass } from '../gosling-to-higlass';
import { HiGlassModel } from '../higlass-model';
import { HiGlassSpec } from '../higlass.schema';
import { getLinkingInfo } from '../utils/linking';
import { GoslingSpec } from '../gosling.schema';

export function renderHiGlass(
    spec: GoslingSpec,
    trackInfos: TrackInfo[],
    setHg: (hg: HiGlassSpec, size: Size) => void
) {
    if (trackInfos.length === 0) {
        // no tracks to render
        return;
    }

    const hgModel = new HiGlassModel();
    trackInfos.forEach(tb => {
        const { track, boundingBox: bb, layout } = tb;
        goslingToHiGlass(hgModel, track, bb, layout);
    });

    /* Linking views */
    const linkingInfos = getLinkingInfo(hgModel);

    // brushing (between a view with `brush` and a view having the same linking name)
    linkingInfos
        .filter(d => d.isBrush)
        .forEach(info => {
            hgModel.addBrush(
                info.layout,
                info.viewId,
                linkingInfos.find(d => !d.isBrush && d.linkId === info.linkId)?.viewId,
                info.style
            );
        });

    // location/zoom lock information
    // fill `locksByViewUid`
    linkingInfos
        .filter(d => !d.isBrush)
        .forEach(d => {
            hgModel.spec().zoomLocks.locksByViewUid[d.viewId] = d.linkId;
            hgModel.spec().locationLocks.locksByViewUid[d.viewId] = d.linkId;
        });

    // fill `locksDict`
    const uniqueLinkIds = Array.from(new Set(linkingInfos.map(d => d.linkId)));

    uniqueLinkIds.forEach(linkId => {
        hgModel.spec().zoomLocks.locksDict[linkId] = { uid: linkId };
        hgModel.spec().locationLocks.locksDict[linkId] = { uid: linkId };

        linkingInfos
            .filter(d => !d.isBrush)
            .filter(d => d.linkId === linkId)
            .forEach(d => {
                hgModel.spec().zoomLocks.locksDict[linkId][d.viewId] = [124625310.5, 1547846991.5, 249250.621];
                hgModel.spec().locationLocks.locksDict[linkId][d.viewId] = [124625310.5, 1547846991.5, 249250.621];
            });
    });

    setHg(hgModel.spec(), getGridInfo(spec));
}
