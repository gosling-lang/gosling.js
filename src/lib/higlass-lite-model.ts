import { HiGlassLiteSpec } from "./higlass-lite.schema";

export class HiGlassLiteModel {
    private hl: HiGlassLiteSpec;
    constructor(ihl: HiGlassLiteSpec) {
        this.hl = JSON.parse(JSON.stringify(ihl));

        // Add default specs.
        for (let v = 0; v < this.hl.views.length; v++) {
            if (!this.hl.views[v].w) this.hl.views[v].w = 12;
            if (!this.hl.views[v].h) this.hl.views[v].h = 12;
            if (!this.hl.views[v].x) this.hl.views[v].x = 0;
            if (!this.hl.views[v].y) this.hl.views[v].y = 0;
        }
    }

    public spec(): HiGlassLiteSpec {
        return this.hl;
    }
}