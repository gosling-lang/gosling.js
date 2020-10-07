import { IsChannelDeep } from '../gemini.schema.guards';
import { HiGlassModel } from '../higlass-model';
import { SUPPORTED_CHANNELS } from '../mark';
import { resolveSuperposedTracks } from './superpose';

/**
 *
 */
export function getLinkingInfo(hgModel: HiGlassModel) {
    const linkingInfo: { viewId: string; linkId: string; isBrush: boolean; style: any }[] = [];

    hgModel.spec().views.forEach(v => {
        const viewId = v.uid;
        const spec = /* TODO: */ (v.tracks as any).center?.[0].contents?.[0].options.spec;

        if (!viewId || !spec) return;

        const resolved = resolveSuperposedTracks(spec);

        resolved.forEach(s => {
            SUPPORTED_CHANNELS.forEach(cKey => {
                const channel = s[cKey];

                if (IsChannelDeep(channel) && channel.linker) {
                    linkingInfo.push({
                        viewId,
                        linkId: channel.linker,
                        isBrush: s.mark === 'rect-brush',
                        style: {
                            color: (s as any).color?.value,
                            stroke: (s as any).stroke?.value,
                            strokeWidth: (s as any).strokeWidth?.value,
                            opacity: (s as any).opacity?.value
                        }
                    });
                    return;
                }
            });
        });
    });
    return linkingInfo;
}
