import Ajv from 'ajv';
import HiGlassSchema from "./higlass.schema.json";
import { HiGlassLiteSpec, TrackPosition } from "./higlass-lite.schema";
import { HiGlassSpec, Track as HGTrack, GenomePositionSearchBox } from "./higlass.schema";
import { HiGlassModel } from './higlass-model';
import { HiGlassLiteModel } from './higlass-lite-model';
import { parseServerAndTilesetUidFromUrl, hgToHlTrackType, generateReadableTrackUid } from './utils';
import { isObject } from 'util';

// TODO: Auto-generate readable uids.

export function compile(ihl: HiGlassLiteSpec): HiGlassSpec {

    // TODO: Early return with invalidate specs.
    // ...

    const hl = new HiGlassLiteModel(ihl);
    const hg = new HiGlassModel();

    /**
     * Top-level Configurations.
     */
    hg.setEditable(hl.spec().config?.editable)
        .setChromInfoPath(hl.spec().config?.chromInfoPath);

    // Genome Search Box
    const genomePositionSearchBoxVisible = hl.spec().config?.searchBox !== undefined;
    const isSearchBoxObject = isObject(hl.spec().config?.searchBox);
    const genomePositionSearchBox: GenomePositionSearchBox = {
        chromInfoId: isSearchBoxObject ?
            (hl.spec().config?.searchBox as GenomePositionSearchBox)?.chromInfoId
            : "hg19",
        chromInfoServer: isSearchBoxObject ?
            (hl.spec().config?.searchBox as GenomePositionSearchBox)?.chromInfoServer
            : "//higlass.io/api/v1",
        autocompleteId: (hl.spec().config?.searchBox as GenomePositionSearchBox)?.autocompleteId,
        autocompleteServer: (hl.spec().config?.searchBox as GenomePositionSearchBox)?.autocompleteServer,
        visible: genomePositionSearchBoxVisible
    };

    /**
     * Views.
     */
    for (let v = 0; v < hl.spec().views.length; v++) {
        const view = hl.spec().views[v];
        /**
         * View.
         */
        hg.addNewView({
            uid: view.uniqueName ? view.uniqueName : `view-${v + 1}`,
            genomePositionSearchBoxVisible,
            genomePositionSearchBox,
            layout: {
                w: view.w as number,
                h: view.h as number,
                x: view.x as number,
                y: view.y as number
            },
            tracks: {
                top: [],
                left: [],
                center: [],
                right: [],
                bottom: [],
                gallery: [],
                whole: []
            },
            initialXDomain: [5.960464477539063e-8, 3100000000.0000005] // TODO: default value.
        });

        let numTracks = 1;
        let tracksToAddLastly: { p: TrackPosition, t: HGTrack }[] = [];
        for (let t = 0; t < view.tracks.length; t++) {
            const track = view.tracks[t];
            /**
             * Axis on the top or left.
             */
            if (track.xAxis === true || track.xAxis === "top") {
                const p = track.position === "center" ? "top" : track.position;
                const t: HGTrack = {
                    uid: track.uniqueName ? track.uniqueName : generateReadableTrackUid(hg.getLastView()?.uid, numTracks++),
                    type: "horizontal-chromosome-labels",
                    chromInfoPath: hl.spec().config?.chromInfoPath,
                    height: 30
                };
                if (track.position === "center") tracksToAddLastly.push({ p, t });
                else hg.addTrack(p, t);
            }
            if (track.yAxis === true || track.yAxis === "left") {
                const p = track.position === "center" ? "left" : track.position;
                const t: HGTrack = {
                    uid: track.uniqueName ? track.uniqueName : generateReadableTrackUid(hg.getLastView()?.uid, numTracks++),
                    type: "vertical-chromosome-labels",
                    chromInfoPath: hl.spec().config?.chromInfoPath,
                    width: 30
                }
                if (track.position === "center") tracksToAddLastly.push({ p, t });
                else hg.addTrack(p, t);
            }

            /**
             * Main track.
             */
            const { server, tilesetUid } = parseServerAndTilesetUidFromUrl(track.data);
            hg.addTrack(track.position, {
                uid: track.uniqueName ? track.uniqueName : generateReadableTrackUid(hg.getLastView()?.uid, numTracks++),
                type: hgToHlTrackType(track.type, track.position),
                server: server,
                tilesetUid: tilesetUid,
                width: track.width,
                height: track.height
            }).addTrackSourceServers(server);

            /**
             * Axis on the bottom or right.
             */
            if (track.xAxis === "bottom") {
                const p = track.position === "center" ? "bottom" : track.position;
                const t: HGTrack = {
                    uid: track.uniqueName ? track.uniqueName : generateReadableTrackUid(hg.getLastView()?.uid, numTracks++),
                    type: "horizontal-chromosome-labels",
                    chromInfoPath: hl.spec().config?.chromInfoPath,
                    height: 30
                };
                hg.addTrack(p, t);
            }
            if (track.yAxis === true || track.yAxis === "right") {
                const p = track.position === "center" ? "right" : track.position;
                const t: HGTrack = {
                    uid: track.uniqueName ? track.uniqueName : generateReadableTrackUid(hg.getLastView()?.uid, numTracks++),
                    type: "vertical-chromosome-labels",
                    chromInfoPath: hl.spec().config?.chromInfoPath,
                    width: 30
                }
                hg.addTrack(p, t);
            }
        }

        // For axes that need to be added lastly.
        tracksToAddLastly.forEach(({ p, t }) => hg.addTrack(p, t));
    }

    // TODO: Validate.
    validateHG(hg.spec());

    return hg.spec();
}

export function validateHG(hg: HiGlassSpec): boolean {

    const validate = new Ajv({ extendRefs: true }).compile(HiGlassSchema);
    const valid = validate(hg);

    if (validate.errors) {
        console.warn(JSON.stringify(validate.errors, null, 2));
    }

    // TODO: check types such as default values and locationLocks

    return valid as boolean;
}