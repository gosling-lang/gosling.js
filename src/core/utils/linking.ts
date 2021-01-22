import { IsChannelDeep } from '../gosling.schema.guards';
import { HiGlassModel } from '../higlass-model';
import { SUPPORTED_CHANNELS } from '../mark';
import { resolveSuperposedTracks } from './superpose';

/**
 *
 */
export function getLinkingInfo(hgModel: HiGlassModel) {
    const linkingInfo: {
        layout: 'circular' | 'linear';
        viewId: string;
        linkId: string;
        isBrush: boolean;
        style: any;
    }[] = [];

    hgModel.spec().views.forEach(v => {
        const viewId = v.uid;
        const spec = /* TODO: */ (v.tracks as any).center?.[0]?.contents?.[0]?.options?.spec;

        if (!viewId || !spec) return;

        const resolved = resolveSuperposedTracks(spec);

        resolved.forEach(s => {
            SUPPORTED_CHANNELS.forEach(cKey => {
                const channel = s[cKey];

                if (IsChannelDeep(channel) && channel.linkingID) {
                    linkingInfo.push({
                        layout: s.layout === 'circular' ? 'circular' : 'linear',
                        viewId,
                        linkId: channel.linkingID,
                        isBrush: s.mark === 'rect-brush',
                        style: {
                            color: (s as any).color?.value,
                            stroke: (s as any).stroke?.value,
                            strokeWidth: (s as any).strokeWidth?.value,
                            opacity: (s as any).opacity?.value,
                            innerRadius: s.innerRadius,
                            outerRadius: s.outerRadius
                        }
                    });
                    return;
                }
            });
        });
    });
    return linkingInfo;
}
