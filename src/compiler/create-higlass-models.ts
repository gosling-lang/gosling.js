import { getBoundingBox, type TrackInfo } from './bounding-box';
import { goslingToHiGlass } from './gosling-to-higlass';
import { HiGlassModel } from './higlass-model';
import { getLinkingInfo } from '../core/utils/linking';
import type {
    GoslingSpec,
    OverlaidTrack,
    SingleTrack,
    TrackApiData,
    VisUnitApiData,
    ViewApiData
} from '@gosling-lang/gosling-schema';
import type { CompleteThemeDeep } from '../core/utils/theme';
import type { CompileCallback } from './compile';
import type { UrlToFetchOptions } from 'src/core/gosling-component';
import { getViewApiData } from '../api/api-data';
import { GoslingToHiGlassIdMapper } from '../api/track-and-view-ids';
import { IsDummyTrack } from '@gosling-lang/gosling-schema';

export function renderHiGlass(
    spec: GoslingSpec,
    trackInfos: TrackInfo[],
    callback: CompileCallback,
    theme: CompleteThemeDeep,
    urlToFetchOptions?: UrlToFetchOptions
) {
    if (trackInfos.length === 0) {
        // no tracks to render
        return;
    }

    // HiGlass model
    const hgModel = new HiGlassModel();

    // A mapping table between Gosling track IDs and HiGlass view IDs
    const idMapper = new GoslingToHiGlassIdMapper();

    /* Update the HiGlass model by iterating tracks */
    trackInfos.forEach(tb => {
        const { track, boundingBox: bb, layout } = tb;
        goslingToHiGlass(hgModel, track, bb, layout, theme, idMapper, urlToFetchOptions);
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
                info.hgViewId,
                theme,
                linkingInfos.find(d => !d.isBrush && d.linkId === info.linkId)?.hgViewId,
                info.style
            );
        });

    // location/zoom lock information
    // fill `locksByViewUid`
    linkingInfos
        .filter(d => !d.isBrush)
        .forEach(d => {
            hgModel.spec().zoomLocks.locksByViewUid[d.hgViewId] = d.linkId;
            hgModel.spec().locationLocks.locksByViewUid[d.hgViewId] = d.linkId;
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
                hgModel.spec().zoomLocks.locksDict[linkId][d.hgViewId] = [124625310.5, 124625310.5, 249250.621];
                hgModel.spec().locationLocks.locksDict[linkId][d.hgViewId] = [124625310.5, 124625310.5, 249250.621];
            });
    });

    const tracks: TrackApiData[] = trackInfos.map(d => {
        return {
            id: d.track.id!,
            spec: d.track as SingleTrack | OverlaidTrack,
            shape:
                d.track.layout === 'linear' || IsDummyTrack(d.track) // Dummy track is always linear
                    ? d.boundingBox
                    : {
                          ...d.boundingBox,
                          cx: d.boundingBox.x + d.boundingBox.width / 2.0,
                          cy: d.boundingBox.y + d.boundingBox.height / 2.0,
                          innerRadius: d.track.innerRadius!,
                          outerRadius: d.track.outerRadius!,
                          startAngle: d.track.startAngle!,
                          endAngle: d.track.endAngle!
                      }
        };
    });

    // Get the view information needed to support JS APIs (e.g., providing view bounding boxes)
    const views: ViewApiData[] = getViewApiData(spec, tracks);

    // Merge the tracks and views
    const tracksAndViews = [
        ...tracks.map(d => ({ ...d, type: 'track' } as VisUnitApiData)),
        ...views.map(d => ({ ...d, type: 'view' } as VisUnitApiData))
    ];

    callback(hgModel.spec(), getBoundingBox(trackInfos), spec, tracksAndViews, idMapper.getTable());
}
