import uuid from 'uuid';
import { Track as HiGlassTrack } from './higlass.schema';
import { HiGlassModel, HIGLASS_AXIS_SIZE } from './higlass-model';
import { parseServerAndTilesetUidFromUrl } from './utils';
import { Track, Domain } from './gosling.schema';
import { BoundingBox, RelativePosition } from './utils/bounding-box';
import { resolveSuperposedTracks } from './utils/overlay';
import { getGenomicChannelKeyFromTrack, getGenomicChannelFromTrack } from './utils/validate';
import { viridisColorMap } from './utils/colors';
import { IsDataDeep, IsChannelDeep, IsDataDeepTileset } from './gosling.schema.guards';
import { DEFAULT_SUBTITLE_HEIGHT, DEFAULT_TITLE_HEIGHT } from './layout/defaults';

/**
 * Convert a gosling track into a HiGlass view and add it into a higlass model.
 */
export function goslingToHiGlass(
    hgModel: HiGlassModel,
    gosTrack: Track,
    bb: BoundingBox,
    layout: RelativePosition
): HiGlassModel {
    // TODO: check whether there are multiple track.data across superposed tracks
    // ...

    // we only look into the first resolved spec to get information, such as size of the track
    const firstResolvedSpec = resolveSuperposedTracks(gosTrack)[0];

    const assembly = firstResolvedSpec.assembly;

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
        // const isYGenomic = genomicChannelKey === 'y' || genomicChannelKey === 'ye';
        const xDomain = isXGenomic && IsChannelDeep(genomicChannel) ? (genomicChannel.domain as Domain) : undefined;
        // const yDomain = isYGenomic && IsChannelDeep(genomicChannel) ? (genomicChannel.domain as Domain) : undefined;

        const hgTrack: HiGlassTrack = {
            type: 'gosling-track',
            server,
            tilesetUid,
            width: bb.width,
            height: bb.height,
            options: {
                /* Mouse hover position */
                showMousePosition: firstResolvedSpec.layout === 'circular' ? false : true, // show mouse position only for linear tracks // TODO: or vertical
                mousePositionColor: '#B8BCC1',
                /* Track title */
                name: firstResolvedSpec.title,
                labelPosition: firstResolvedSpec.title ? 'topLeft' : 'none',
                fontSize: 12,
                labelColor: 'black',
                labelShowResolution: false,
                labelBackgroundColor: 'white',
                labelTextOpacity: 1,
                labelLeftMargin: 1,
                labelTopMargin: 1,
                labelRightMargin: 0,
                labelBottomMargin: 0,
                /* Others */
                backgroundColor: 'transparent', // in this way, we can superpose multiple tracks
                spec: { ...gosTrack }
            }
        };

        if (
            gosTrack.data &&
            IsDataDeep(gosTrack.data) &&
            (gosTrack.data.type === 'csv' || gosTrack.data.type === 'json' || gosTrack.data.type === 'bigwig')
        ) {
            // use gosling's custom data fetchers
            hgTrack.data = {
                ...gosTrack.data,
                // Additionally, add assembly, otherwise, a default build is used
                assembly,
                // Add a data transformation spec so that the fetcher can properly sample datasets
                filter: (gosTrack as any).dataTransform?.filter
            };
        }

        const isMatrix = gosTrack.data?.type === 'matrix';
        if (isMatrix) {
            // Use HiGlass' heatmap track for matrix data
            hgTrack.type = 'heatmap';
            hgTrack.options.colorRange =
                (gosTrack as any)?.color.range === 'warm'
                    ? ['white', 'rgba(245,166,35,1.0)', 'rgba(208,2,27,1.0)', 'black']
                    : viridisColorMap;
            hgTrack.options.trackBorderWidth = 1;
            hgTrack.options.trackBorderColor = 'black';
            hgTrack.options.colorbarPosition = (firstResolvedSpec.color as any)?.legend ? 'topRight' : 'hidden';
        }

        if (gosTrack.overlayOnPreviousTrack) {
            hgModel
                .setViewOrientation(gosTrack.orientation) // TODO: Orientation should be assigned to 'individual' views
                .addTrackToCombined(hgTrack);
        } else {
            hgModel
                .setViewOrientation(gosTrack.orientation) // TODO: Orientation should be assigned to 'individual' views
                .setAssembly(assembly) // TODO: Assembly should be assigned to 'individual' views
                .addDefaultView(gosTrack.id ?? uuid.v1(), assembly)
                .setDomain(xDomain, xDomain) // TODO:
                .setMainTrack(hgTrack)
                .addTrackSourceServers(server)
                .setZoomFixed(firstResolvedSpec.static === true)
                .setLayout(layout);
        }

        // check whether to show axis
        ['x', 'y'].forEach(c => {
            const channel = (firstResolvedSpec as any)[c];
            if (IsChannelDeep(channel) && channel.axis && channel.axis !== 'none' && channel.type === 'genomic') {
                const narrowSize = 400;
                const narrowerSize = 200;
                const narrowType =
                    // show two labels at the end in a `si` format when the track is too narrow
                    (c === 'x' && bb.width <= narrowerSize) || (c === 'y' && bb.height <= narrowerSize)
                        ? 'narrower'
                        : (c === 'x' && bb.width <= narrowSize) || (c === 'y' && bb.height <= narrowSize)
                        ? 'narrow'
                        : 'regular';
                hgModel.setAxisTrack(channel.axis, narrowType, {
                    layout: firstResolvedSpec.layout,
                    innerRadius:
                        channel.axis === 'top'
                            ? (firstResolvedSpec.outerRadius as number) - HIGLASS_AXIS_SIZE
                            : firstResolvedSpec.innerRadius,
                    outerRadius:
                        channel.axis === 'top'
                            ? firstResolvedSpec.outerRadius
                            : (firstResolvedSpec.innerRadius as number) + HIGLASS_AXIS_SIZE,
                    width: firstResolvedSpec.width,
                    height: firstResolvedSpec.height,
                    startAngle: firstResolvedSpec.startAngle,
                    endAngle: firstResolvedSpec.endAngle
                });
            }
        });

        hgModel.validateSpec();
    } else if (firstResolvedSpec.mark === 'header') {
        // `text` tracks are used to show title and subtitle of the views
        hgModel.addDefaultView(gosTrack.id ?? uuid.v1()).setLayout(layout);
        if (typeof firstResolvedSpec.title === 'string') {
            hgModel.setTextTrack(bb.width, DEFAULT_TITLE_HEIGHT, firstResolvedSpec.title, 'black', 18, 'bold');
        }
        if (typeof firstResolvedSpec.subtitle === 'string') {
            hgModel.setTextTrack(bb.width, DEFAULT_SUBTITLE_HEIGHT, firstResolvedSpec.subtitle, 'gray', 14, 'normal');
        }
    }
    return hgModel;
}
