import { getBoundingBox, type TrackInfo } from './utils/bounding-box';
import { goslingToHiGlass } from './gosling-to-higlass';
import { HiGlassModel } from './higlass-model';
import { getLinkingInfo } from './utils/linking';
import type { GoslingSpec, OverlaidTrack, SingleTrack, TrackMouseEventData } from './gosling.schema';
import type { CompleteThemeDeep } from './utils/theme';
import type { CompileCallback } from './compile';
import { IdMapper } from '@gosling-lang/gosling-higlass';

/**
 * Create a HiGlass model from the Gosling spec and call the callback function.
 * @param spec
 * @param trackInfos
 * @param callback
 * @param theme
 * @returns
 */
export function renderHiGlass(
    spec: GoslingSpec,
    trackInfos: TrackInfo[],
    callback: CompileCallback,
    theme: CompleteThemeDeep
) {
    if (trackInfos.length === 0) {
        // no tracks to render
        return;
    }

    // HiGlass model
    const hgModel = new HiGlassModel();

    // A mapping table between Gosling track IDs to HiGlass view IDs
    const idMapper = new IdMapper();

    /* Update the HiGlass model by iterating tracks */
    trackInfos.forEach(tb => {
        const { track, boundingBox: bb, layout } = tb;
        goslingToHiGlass(hgModel, track, bb, layout, theme, idMapper);
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

    const trackInfosWithShapes: TrackMouseEventData[] = trackInfos.flatMap(d => {
        const trackId = d.track.id!;
        const siblingIds = idMapper.getSiblingGoslingIds(trackId);
        const eventData = {
            spec: d.track as SingleTrack | OverlaidTrack,
            shape:
                d.track.layout === 'linear'
                    ? d.boundingBox
                    : {
                          cx: d.boundingBox.x + d.boundingBox.width / 2.0,
                          cy: d.boundingBox.y + d.boundingBox.height / 2.0,
                          innerRadius: d.track.innerRadius!,
                          outerRadius: d.track.outerRadius!,
                          startAngle: d.track.startAngle!,
                          endAngle: d.track.endAngle!
                      }
        };
        // All siblings of tracks should get the same event data through the JS API.
        return siblingIds.map(id => {
            return { ...eventData, id };
        });
    });

    callback(hgModel.spec(), getBoundingBox(trackInfos), spec, trackInfosWithShapes, idMapper.getMappingTable());
}
