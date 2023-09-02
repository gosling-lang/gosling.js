import { IsChannelDeep } from '@gosling-lang/gosling-schema';
import type { HiGlassModel } from '../../compiler/higlass-model';
import { SUPPORTED_CHANNELS } from '../mark';
import { resolveSuperposedTracks } from './overlay';

/**
 *
 */
export function getLinkingInfo(hgModel: HiGlassModel) {
    const linkingInfo: {
        layout: 'circular' | 'linear';
        hgViewId: string;
        linkId: string;
        isBrush: boolean;
        style: any;
    }[] = [];

    hgModel.spec().views.forEach(v => {
        const hgViewId = v.uid;

        // TODO: Better way to get view specifications?
        // Get spec of a view
        let spec = /* TODO: */ (v.tracks as any).center?.[0]?.contents?.[0]?.options?.spec;

        if (!spec) {
            // This means the orientation of this view is vertical, and spec might be positioned on the left
            spec = /* TODO: */ (v.tracks as any).left?.[0]?.contents?.[0]?.options?.spec;
            if (!spec) {
                // in case the first one is the axis track
                spec = /* TODO: */ (v.tracks as any).left?.[1]?.contents?.[0]?.options?.spec;
            }
        }

        if (!hgViewId || !spec) return;

        const resolved = resolveSuperposedTracks(spec);

        resolved.forEach(spec => {
            SUPPORTED_CHANNELS.forEach(cKey => {
                const channel = spec[cKey];

                if (IsChannelDeep(channel) && 'linkingId' in channel && channel.linkingId) {
                    linkingInfo.push({
                        layout: spec.layout === 'circular' ? 'circular' : 'linear',
                        hgViewId,
                        linkId: channel.linkingId,
                        isBrush: spec.mark === 'brush',
                        style: {
                            color: (spec as any).color?.value,
                            stroke: (spec as any).stroke?.value,
                            strokeWidth: (spec as any).strokeWidth?.value,
                            opacity: (spec as any).opacity?.value,
                            startAngle: spec.startAngle,
                            endAngle: spec.endAngle,
                            innerRadius: spec.innerRadius,
                            outerRadius: spec.outerRadius
                        }
                    });
                    return;
                }
            });
        });
    });
    return linkingInfo;
}
