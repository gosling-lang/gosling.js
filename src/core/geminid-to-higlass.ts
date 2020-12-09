import { Track as HiGlassTrack } from './higlass.schema';
import { HiGlassModel } from './higlass-model';
import { parseServerAndTilesetUidFromUrl } from './utils';
import { Track, Domain } from './geminid.schema';
import { BoundingBox, RelativePosition } from './utils/bounding-box';
import { resolveSuperposedTracks } from './utils/superpose';
import { getGenomicChannelKeyFromTrack, getGenomicChannelFromTrack } from './utils/validate';
import { IsDataDeep, IsChannelDeep, IsDataDeepTileset } from './geminid.schema.guards';

/**
 * Convert a gemini track into a HiGlass view and add it into a higlass model.
 */
export function geminidToHiGlass(
    hgModel: HiGlassModel,
    gmTrack: Track,
    bb: BoundingBox,
    layout: RelativePosition
): HiGlassModel {
    // TODO: check whether there are multiple track.data across superposed tracks
    // ...

    // we only look into the first resolved spec to get information, such as size of the track
    const firstResolvedSpec = resolveSuperposedTracks(gmTrack)[0];

    if (IsDataDeep(firstResolvedSpec.data)) {
        let server, tilesetUid;

        if (IsDataDeepTileset(firstResolvedSpec.data)) {
            const parsed = parseServerAndTilesetUidFromUrl(firstResolvedSpec.data.url);
            server = parsed.server;
            tilesetUid = parsed.tilesetUid;
        }

        // Is this track horizontal or vertical?
        const genomicChannel = getGenomicChannelFromTrack(firstResolvedSpec);
        const genomicChannelKey = getGenomicChannelKeyFromTrack(firstResolvedSpec);
        const isXGenomic = genomicChannelKey === 'x' || genomicChannelKey === 'xe';
        const isYGenomic = genomicChannelKey === 'y' || genomicChannelKey === 'ye';
        const xDomain = isXGenomic && IsChannelDeep(genomicChannel) ? (genomicChannel.domain as Domain) : undefined;
        const yDomain = isYGenomic && IsChannelDeep(genomicChannel) ? (genomicChannel.domain as Domain) : undefined;

        const hgTrack: HiGlassTrack = {
            type: 'gemini-track',
            server: server,
            tilesetUid: tilesetUid,
            width: bb.width,
            height: bb.height,
            options: {
                backgroundColor: 'transparent', // in this way, we can superpose multiple tracks
                spec: { ...gmTrack, data: undefined }
            }
        };

        if (gmTrack.data && IsDataDeep(gmTrack.data) && (gmTrack.data.type === 'csv' || gmTrack.data.type === 'json')) {
            // use geminid's custom data fetchers
            hgTrack.data = gmTrack.data;
        }

        if (gmTrack.superposeOnPreviousTrack) {
            hgModel.addTrackToCombined(hgTrack);
        } else {
            hgModel
                .addDefaultView()
                .setDomain(xDomain, yDomain)
                .setMainTrack(hgTrack)
                .addTrackSourceServers(server)
                .setZoomFixed(firstResolvedSpec.zoomable as undefined | boolean)
                .setLayout(layout);
        }

        // check whether to show axis
        ['x', 'y'].forEach(c => {
            const channel = (firstResolvedSpec as any)[c];
            if (IsChannelDeep(channel) && channel.axis && channel.axis !== 'none') {
                hgModel.setAxisTrack(channel.axis);
            }
        });

        hgModel.validateSpec();
    } else if (firstResolvedSpec.mark === 'empty') {
        // The `empty` tracks are used to add gaps between tracks vertically.
        hgModel.addDefaultView().setLayout(layout).setEmptyTrack(bb.width, bb.height);
    }
    return hgModel;
}
