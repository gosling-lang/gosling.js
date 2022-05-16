import { getBoundingBox, Size, TrackInfo } from './utils/bounding-box';
import { goslingToHiGlass } from './gosling-to-higlass';
import { HiGlassModel } from './higlass-model';
import { getLinkingInfo } from './utils/linking';

import type { GoslingSpec } from '@gosling/schema';
import type { HiGlassSpec } from '@gosling/schema/higlass.schema';
import type { CompleteThemeDeep } from './utils/theme';

export function renderHiGlass(
    spec: GoslingSpec,
    trackInfos: TrackInfo[],
    setHg: (hg: HiGlassSpec, size: Size, gs: GoslingSpec) => void,
    theme: CompleteThemeDeep
) {
    if (trackInfos.length === 0) {
        // no tracks to render
        return;
    }

    // HiGlass model
    const hgModel = new HiGlassModel();

    /* Update the HiGlass model by iterating tracks */
    trackInfos.forEach(tb => {
        const { track, boundingBox: bb, layout } = tb;
        goslingToHiGlass(hgModel, track, bb, layout, theme);
    });

    /* Add linking information to the HiGlass model */
    const linkingInfos = getLinkingInfo(hgModel);

    // Brushing
    // (between a view with `brush` and a view having the same linking name)
    linkingInfos
        .filter(d => d.isBrush)
        .forEach(info => {
            hgModel.addBrush(
                info.layout,
                info.viewId,
                theme,
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
                hgModel.spec().zoomLocks.locksDict[linkId][d.viewId] = [124625310.5, 124625310.5, 249250.621];
                hgModel.spec().locationLocks.locksDict[linkId][d.viewId] = [124625310.5, 124625310.5, 249250.621];
            });
    });

    setHg(hgModel.spec(), getBoundingBox(trackInfos), spec);
}
