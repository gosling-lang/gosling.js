import { IsChannelDeep } from '../gemini.schema';
import { HiGlassModel } from '../higlass-model';
import { SUPPORTED_CHANNELS } from '../mark';
import { resolveSuperposedTracks } from './superpose';

/**
 *
 */
export function getLinkingInfo(hgModel: HiGlassModel) {
    const linkingInfo: { viewId: string; linkId: string }[] = [];

    hgModel.spec().views.forEach(v => {
        const viewId = v.uid;
        const spec = v.tracks.center?.[0].options.spec;

        if (!viewId || !spec) return;

        const firstResolvedSpec = resolveSuperposedTracks(spec)[0];

        // console.log(viewId, firstResolvedSpec);

        SUPPORTED_CHANNELS.forEach(cKey => {
            const channel = firstResolvedSpec[cKey];

            if (IsChannelDeep(channel) && channel.linking) {
                linkingInfo.push({ viewId, linkId: channel.linking });
                return;
            }
        });
    });
    return linkingInfo;
}
