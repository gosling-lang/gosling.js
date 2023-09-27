import type { HiGlassSpec } from '@gosling-lang/higlass-schema';

/**
 * This makes sure that all the current zooming status is preserved when new tracks are added
 */
export const preverseZoomStatus = (newSpec: HiGlassSpec, prevSpec: HiGlassSpec) => {
    newSpec.views.forEach(view => {
        const viewUid = view.uid!;
        const isNewView = !prevSpec.views.find(v => v.uid === viewUid);
        if (isNewView) {
            // if this view is linked with another view, we need to preverse the current zooming status of this view from the linked view
            // Otherwise, all the views that is linked with this view will be reset to the original zooming position
            const { locksByViewUid } = newSpec.zoomLocks;
            const lockUid = locksByViewUid[viewUid];
            const linkedViewUid = Object.entries(locksByViewUid).find(([_, uid]) => _ && uid === lockUid)?.[0];
            // Only if the linked view existed in the previous spec, we copy the zooming status
            const linkedViewExistedPrev = !!prevSpec.views.find(v => v.uid === linkedViewUid);
            if (linkedViewUid && linkedViewExistedPrev) {
                // We found a linked view, so copy the current zooming status
                view.initialXDomain = prevSpec.views.find(v => v.uid === linkedViewUid)?.initialXDomain;
                view.initialYDomain = prevSpec.views.find(v => v.uid === linkedViewUid)?.initialYDomain;
            }
        }
    });
};
