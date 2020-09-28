import Ajv from 'ajv';
import HiGlassSchema from './higlass.schema.json';
import { HiGlassSpec, Track as HiGlassTrack } from './higlass.schema';
import { HiGlassModel, HIGLASS_AXIS_SIZE } from './higlass-model';
import { parseServerAndTilesetUidFromUrl } from './utils';
import { Track, IsDataDeep, IsChannelDeep, Domain } from './gemini.schema';
import { BoundingBox } from './utils/bounding-box';
import { resolveSuperposedTracks } from './utils/superpose';
import { getGenomicChannelKeyFromTrack, getGenomicChannelFromTrack } from './utils/validate';

export function compiler(track: Track, bb: BoundingBox): HiGlassSpec {
    const higlass = new HiGlassModel();

    // TODO: check whether there are multiple track.data across superposed tracks
    // ...

    // we only look into the first resolved spec to get information, such as size of the track
    const firstResolvedSpec = resolveSuperposedTracks(track)[0];

    if (
        // type guides
        typeof firstResolvedSpec.data !== 'undefined' &&
        IsDataDeep(firstResolvedSpec.data) &&
        firstResolvedSpec.data.url
    ) {
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

        higlass.setDomain(xDomain, yDomain);

        const hgTrack: HiGlassTrack = {
            type: 'gemini-track',
            server: server,
            tilesetUid: tilesetUid,
            width: bb.width - (isYGenomic && isAxisShown ? HIGLASS_AXIS_SIZE : 0),
            height: bb.height - (isXGenomic && isAxisShown ? HIGLASS_AXIS_SIZE : 0),
            options: {
                spec: { ...track, data: undefined }
            }
        };

        if (track.data && IsDataDeep(track.data) && track.data.type === 'csv') {
            // use a CSV data fetcher
            hgTrack.data = track.data;
        }

        higlass
            .setMainTrack(hgTrack)
            .addTrackSourceServers(server)
            .setZoomFixed(firstResolvedSpec.zoomable as undefined | boolean);

        // check whether to show axis
        ['x', 'y'].forEach(c => {
            const channel = (firstResolvedSpec as any)[c];
            if (IsChannelDeep(channel) && channel.axis) {
                higlass.setAxisTrack(channel.axis);
            }
        });

        higlass.validateSpec();
        return higlass.spec();
    }
    return {};
}

export function validateHG(hg: HiGlassSpec): boolean {
    const validate = new Ajv({ extendRefs: true }).compile(HiGlassSchema);
    const valid = validate(hg);

    if (validate.errors) {
        console.warn(JSON.stringify(validate.errors, null, 2));
    }

    // TODO: Check types such as default values and locationLocks

    return valid as boolean;
}
