import uuid from 'uuid';
import { Track as HiGlassTrack } from './higlass.schema';
import { HiGlassModel, HIGLASS_AXIS_SIZE } from './higlass-model';
import { parseServerAndTilesetUidFromUrl } from './utils';
import { Track, Domain, DataTransform } from './gosling.schema';
import { BoundingBox, RelativePosition } from './utils/bounding-box';
import { resolveSuperposedTracks } from './utils/overlay';
import { getGenomicChannelKeyFromTrack, getGenomicChannelFromTrack } from './utils/validate';
import { viridisColorMap } from './utils/colors';
import { IsDataDeep, IsChannelDeep, IsDataDeepTileset } from './gosling.schema.guards';
import { DEWFAULT_TITLE_PADDING_ON_TOP_AND_BOTTOM } from './layout/defaults';
import { CompleteThemeDeep } from './utils/theme';

/**
 * Convert a gosling track into a HiGlass view and add it into a higlass model.
 */
export function goslingToHiGlass(
    hgModel: HiGlassModel,
    gosTrack: Track,
    bb: BoundingBox,
    layout: RelativePosition,
    theme: Required<CompleteThemeDeep>
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
                mousePositionColor: theme.root.mousePositionColor,
                /* Track title */
                name: firstResolvedSpec.title,
                fontSize: theme.track.titleFontSize,
                labelPosition: firstResolvedSpec.title
                    ? theme.track.titleAlign === 'left'
                        ? 'topLeft'
                        : 'topRight'
                    : 'none',
                labelShowResolution: false,
                labelColor: theme.track.titleColor,
                labelBackgroundColor: theme.track.titleBackground,
                labelTextOpacity: 1,
                labelLeftMargin: 1,
                labelTopMargin: 1,
                labelRightMargin: 0,
                labelBottomMargin: 0,
                // TODO: Use this eventually
                // trackBorderWidth: firstResolvedSpec.style?.outlineWidth ?? 3,
                // trackBorderColor: firstResolvedSpec.style?.outline ?? '#DBDBDB',
                /* Others */
                backgroundColor: 'transparent', // in this way, we can superpose multiple tracks
                spec: { ...gosTrack },
                theme
            }
        };

        if (
            gosTrack.data &&
            IsDataDeep(gosTrack.data) &&
            (gosTrack.data.type === 'csv' ||
                gosTrack.data.type === 'json' ||
                gosTrack.data.type === 'bigwig' ||
                gosTrack.data.type === 'bam')
        ) {
            // use gosling's custom data fetchers
            hgTrack.data = {
                ...gosTrack.data,
                // Additionally, add assembly, otherwise, a default genome build is used
                assembly,
                // Add a data transformation spec so that the fetcher can properly sample datasets
                filter: (gosTrack as any).dataTransform?.filter((f: DataTransform) => f.type === 'filter')
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
                    endAngle: firstResolvedSpec.endAngle,
                    theme
                });
            }
        });

        hgModel.validateSpec(true);
    } else if (firstResolvedSpec.mark === 'header') {
        // `text` tracks are used to show title and subtitle of the views
        hgModel.addDefaultView(gosTrack.id ?? uuid.v1()).setLayout(layout);
        if (typeof firstResolvedSpec.title === 'string') {
            hgModel.setTextTrack(
                bb.width,
                theme.root.titleFontSize + DEWFAULT_TITLE_PADDING_ON_TOP_AND_BOTTOM,
                firstResolvedSpec.title,
                theme.root.titleColor,
                theme.root.titleFontSize ?? 18,
                theme.root.titleFontWeight,
                theme.root.titleAlign,
                theme.root.titleBackgroundColor,
                theme.root.titleFontFamily
            );
        }
        if (typeof firstResolvedSpec.subtitle === 'string') {
            hgModel.setTextTrack(
                bb.width,
                theme.root.subtitleFontSize + DEWFAULT_TITLE_PADDING_ON_TOP_AND_BOTTOM,
                firstResolvedSpec.subtitle,
                theme.root.subtitleColor,
                theme.root.subtitleFontSize ?? 14,
                theme.root.subtitleFontWeight,
                theme.root.subtitleAlign,
                theme.root.subtitleBackgroundColor,
                theme.root.subtitleFontFamily
            );
        }
    }
    return hgModel;
}
