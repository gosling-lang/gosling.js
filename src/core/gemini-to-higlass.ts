import { Track as HiGlassTrack } from './higlass.schema';
import { HiGlassModel, HIGLASS_AXIS_SIZE } from './higlass-model';
import { parseServerAndTilesetUidFromUrl } from './utils';
import { Track, IsDataDeep, IsChannelDeep, Domain } from './gemini.schema';
import { BoundingBox, RelativePosition } from './utils/bounding-box';
import { resolveSuperposedTracks } from './utils/superpose';
import { getGenomicChannelKeyFromTrack, getGenomicChannelFromTrack } from './utils/validate';

/**
 * Convert a gemini track into a HiGlass view.
 */
export function geminiToHiGlass(
    hgModel: HiGlassModel,
    gm: Track,
    bb: BoundingBox,
    layout: RelativePosition
): HiGlassModel {
    // TODO: check whether there are multiple track.data across superposed tracks
    // ...

    // we only look into the first resolved spec to get information, such as size of the track
    const firstResolvedSpec = resolveSuperposedTracks(gm)[0];

    if (
        // type guides
        typeof firstResolvedSpec.data !== 'undefined' &&
        IsDataDeep(firstResolvedSpec.data) &&
        firstResolvedSpec.data.url
    ) {
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

        // TODO: better way to sync between height/width of track in the description and actual track size?
        let isAxisShown = false;
        if (isXGenomic) {
            isAxisShown =
                IsChannelDeep(firstResolvedSpec.x) && ['top', 'bottom'].includes(firstResolvedSpec.x.axis as any);
        }
        if (isYGenomic) {
            isAxisShown =
                IsChannelDeep(firstResolvedSpec.y) && ['left', 'right'].includes(firstResolvedSpec.y.axis as any);
        }
        ///

        hgModel.setDomain(xDomain, yDomain);

        const hgTrack: HiGlassTrack = {
            type: 'gemini-track',
            server: server,
            tilesetUid: tilesetUid,
            width: bb.width - (isYGenomic && isAxisShown ? HIGLASS_AXIS_SIZE : 0),
            height: bb.height - (isXGenomic && isAxisShown ? HIGLASS_AXIS_SIZE : 0),
            options: {
                spec: { ...gm, data: undefined }
            }
        };

        if (gm.data && IsDataDeep(gm.data) && gm.data.type === 'csv') {
            // use a CSV data fetcher
            hgTrack.data = gm.data;
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
    }
    return hgModel;
}
