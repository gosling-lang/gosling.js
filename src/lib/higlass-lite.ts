import Ajv from 'ajv';
import { HiGlassLiteSpec } from "./higlass-lite.schema";
import { HiGlassSpec, View as HGView } from "./higlass.schema";
import HiGlassSchema from "./higlass.schema.json";

function addTrackSourceServer(hg: HiGlassSpec, server: string) {
    if (hg.trackSourceServers?.indexOf(server) !== -1) hg.trackSourceServers?.push(server);
    return hg;
}

export function compile(hl: HiGlassLiteSpec): HiGlassSpec {

    let hg: HiGlassSpec = {};

    // TODO: Handle corner cases.

    // TODO: copy data so that we have the original `hl`.

    /**
     * Fill default values.
     */
    // Add default json spec for hl and hg
    // TODO: add default specs for `hl`
    for (let v = 0; v < hl.views.length; v++) {
        if (!hl.views[v].w) hl.views[v].w = 12;
        if (!hl.views[v].h) hl.views[v].h = 12;
        if (!hl.views[v].x) hl.views[v].x = 0;
        if (!hl.views[v].y) hl.views[v].y = 0;
    }
    // ...

    // TODO: init default `hg`
    // ...

    /**
     * Compile.
     */
    // config.
    hg.editable = hl.config?.editable;
    hg.chromInfoPath = hl.config?.chromInfoPath;
    hg.trackSourceServers = [];
    hg.views = [];

    // views.
    for (let v = 0; v < hl.views.length; v++) {
        const view = hl.views[v];

        let newView: HGView = {
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
            initialXDomain: [5.960464477539063e-8, 3100000000.0000005] // Default ?
        };

        for (let t = 0; t < view.tracks.length; t++) {
            const track = view.tracks[t];

            if (track.xAxis === true || track.xAxis === "top") {
                newView.tracks["top"]?.push({
                    type: "horizontal-chromosome-labels",
                    chromInfoPath: hl.config?.chromInfoPath,
                    height: 30
                });
            }

            const server = track.data.split("tileset_info/?d=")[0].split("https:")[1];
            newView.tracks[track.position]?.push({
                uid: track.uniqueName,
                type: track.type,
                server: server,
                tilesetUid: track.data.split("tileset_info/?d=")[1]
            });
            hg.trackSourceServers.push(server);

            if (track.xAxis === "bottom") {
                newView.tracks["bottom"]?.push({
                    type: "horizontal-chromosome-labels",
                    chromInfoPath: hl.config?.chromInfoPath,
                    height: 30
                });
            }
        }
        hg.views?.push(newView);
    }

    // TODO: Validate.
    validateHG(hg);

    return hg;
}

export function validateHG(spec: Object): boolean {

    const validate = new Ajv({ extendRefs: true }).compile(HiGlassSchema);
    const valid = validate(spec);

    if (validate.errors) {
        console.warn(JSON.stringify(validate.errors, null, 2));
    }

    // const hg = spec as HiGlassSpec;

    // TODO: check types such as default values and locationLocks

    return valid as boolean;
}