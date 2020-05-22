import { HiGlassSpec, View as HGView, Track as HGTrack } from "./higlass.schema";
import { TrackPosition } from "./higlass-lite.schema";

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

    public addNewView(view: HGView) {
        this.hg.views?.push(view);
        return this;
    }

    public addTrack(position: TrackPosition, track: HGTrack) {
        if (!this.hg.views) return this;
        this.hg.views[this.hg.views.length - 1].tracks[position]?.push(track);
        return this;
    }
}