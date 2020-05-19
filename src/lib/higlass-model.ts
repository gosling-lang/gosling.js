import { HiGlassSpec, Track as HGTrack } from "./higlass.schema";
import { View as HLView, TrackPosition } from "./higlass-lite.schema";

export class HiGlassModel {
    private hg: HiGlassSpec;
    constructor() {
        this.hg = {};

        // Add default specs.
        this.hg.trackSourceServers = [];
        this.hg.views = [];
    }

    public spec(): HiGlassSpec {
        return this.hg;
    }

    public getLastView() {
        return this.hg.views?.[this.hg.views?.length - 1];
    }

    public setEditable(editable: boolean | undefined) {
        this.hg.editable = editable;
        return this;
    }

    public setChromInfoPath(chromInfoPath: string | undefined) {
        this.hg.chromInfoPath = chromInfoPath;
        return this;
    }

    public addTrackSourceServers(trackSourceServers: string | undefined) {
        if (trackSourceServers && this.hg.trackSourceServers?.indexOf(trackSourceServers) === -1)
            this.hg.trackSourceServers?.push(trackSourceServers);
        return this;
    }

    public addNewView(view: HLView) {
        const viewNum = this.hg.views?.length ? this.hg.views?.length + 1 : 1;
        const uid = view.uniqueName ? view.uniqueName : `view-${viewNum}`;
        this.hg.views?.push({
            uid,
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
        return this;
    }

    public addTrack(position: TrackPosition, track: HGTrack) {
        if (!this.hg.views) return this;
        this.hg.views[this.hg.views.length - 1].tracks[position]?.push(track);
        return this;
    }
}