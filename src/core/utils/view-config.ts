import type { HiGlassSpec, View } from '@gosling-lang/higlass-schema';

/**
 * Traverse all views in a HiGlass viewConfig.
 */
export function traverseViewsInViewConfig(viewConf: HiGlassSpec, callback: (view: View) => void) {
    if (viewConf && viewConf.views && Array.isArray(viewConf.views)) {
        viewConf.views.forEach(view => {
            if (view && view.uid) {
                callback(view);
            }
        });
    }
}
