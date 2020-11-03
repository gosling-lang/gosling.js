import { Track as HiGlassTrack } from './higlass.schema';
import { HiGlassModel } from './higlass-model';
import { parseServerAndTilesetUidFromUrl } from './utils';
import { Track, Domain } from './gemini.schema';
import { BoundingBox, RelativePosition } from './utils/bounding-box';
import { resolveSuperposedTracks } from './utils/superpose';
import { getGenomicChannelKeyFromTrack, getGenomicChannelFromTrack } from './utils/validate';
import { IsDataDeep, IsChannelDeep } from './gemini.schema.guards';

/**
 * Convert a gemini track into a HiGlass view and add it into higlass model.
 */
export function geminiToHiGlass(
    hgModel: HiGlassModel,
    gmTrack: Track,
    bb: BoundingBox,
    layout: RelativePosition
): HiGlassModel {
    // TODO: check whether there are multiple track.data across superposed tracks
    // ...

    // we only look into the first resolved spec to get information, such as size of the track
    const firstResolvedSpec = resolveSuperposedTracks(gmTrack)[0];

    if (IsDataDeep(firstResolvedSpec.data) && firstResolvedSpec.data.url) {
        // add a default view
        hgModel.addDefaultView();

        const { server, tilesetUid } = parseServerAndTilesetUidFromUrl(firstResolvedSpec.data.url);

        // Is this track horizontal or vertical?
        const genomicChannel = getGenomicChannelFromTrack(firstResolvedSpec);
        const genomicChannelKey = getGenomicChannelKeyFromTrack(firstResolvedSpec);
        const isXGenomic = genomicChannelKey === 'x' || genomicChannelKey === 'xe';
        const isYGenomic = genomicChannelKey === 'y' || genomicChannelKey === 'ye';
        const xDomain = isXGenomic && IsChannelDeep(genomicChannel) ? (genomicChannel.domain as Domain) : undefined;
        const yDomain = isYGenomic && IsChannelDeep(genomicChannel) ? (genomicChannel.domain as Domain) : undefined;

        hgModel.setDomain(xDomain, yDomain);

        const hgTrack: HiGlassTrack = {
            type: 'gemini-track',
            server: server,
            tilesetUid: tilesetUid,
            width: bb.width,
            height: bb.height,
            options: {
                spec: { ...gmTrack, data: undefined }
            }
        };

        if (gmTrack.data && IsDataDeep(gmTrack.data) && gmTrack.data.type === 'csv') {
            // use a CSV data fetcher
            hgTrack.data = gmTrack.data;
        }

        hgModel
            .setMainTrack(hgTrack)
            .addTrackSourceServers(server)
            .setZoomFixed(firstResolvedSpec.zoomable as undefined | boolean)
            .setLayout(layout);

        // check whether to show axis
        ['x', 'y'].forEach(c => {
            const channel = (firstResolvedSpec as any)[c];
            if (IsChannelDeep(channel) && channel.axis) {
                hgModel.setAxisTrack(channel.axis);
            }
        });

        hgModel.validateSpec();
    } else if (firstResolvedSpec.mark === 'empty') {
        hgModel.addDefaultView().setLayout(layout).setEmptyTrack(bb.width, bb.height);
    }
    return hgModel;
}
