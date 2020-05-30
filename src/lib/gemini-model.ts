import { GeminiSpec } from "./gemini.schema";

export class GeminiModel {
    private gm: GeminiSpec;
    constructor(_gm: GeminiSpec) {
        this.gm = JSON.parse(JSON.stringify(_gm));

        // Add default specs.
        // ...
    }

    public spec(): GeminiSpec {
        return this.gm;
    }
}