// Refer to the following url for dealing with defaults:
// https://github.com/vega/vega-lite/blob/23fe2b9c6a82551f321ccab751370ca48ae002c9/src/channeldef.ts#L961

/**
 * Some key characteristics in the HiGlass-Lite grammar.
 * 1. Flexibility to users, burden to developers.
 *      e.g., trackSourceServers: [] vs. servers: string[] | string;
 *      e.g., searchBox?: boolean | genomePositionSearchBox;
 * 2. Optional configs placed separately.
 * 3. Easy to apply and reproduce themes.
 * 4. Shorten key names to be able to more easily remember.
 *      e.g., genomePositionSearchBox => searchBox
 * 5. Low level of hierarchy.
 *      e.g., views[{tracks:{top:[ ... ], ...}, ...} => 
 * 6. Targeted for quick authoring visualizations
 *      e.g., exportViewUrl less preferred
 * 7. Users do not need to think about uids (e.g., zoomLocks)
 * 8. Use and auto-generates readable UIDs
 *      e.g., "view-1-track-2-center-heatmap" vs. OHJakQICQD6gTD7skx4EWA
 *          (HiGlass is making this ? OHJakQICQD6gTD7skx4EWA?)
 *      This helps further working on the compiled higlass view configs.
 * (*). Should notice that I do not fully understand use cases, so the coverage can be changed.
 * (Add more here)
 */

/**
 * Something to Think of.
 * - relative positioning vs. absolute positioning
 *      e.g., A || B || C vs. Left: [A, B, C]
 */

/**
 * What are not supported in HiGlass-Lite.
 * Separate genomePositionSearchBox for each view. (removed genomePositionSearchBoxVisible)
 */

/**
 * What are new things supported in HiGlass-Lite.
 * - Consistency
 *      - Determines visual consistency across views and/or trakcs
 *      - e.g., consistency: { color: : "shared" } use same color for same type
 *      - e.g., consistency: { x: "independent" } not currently supported for track
 *      - TODO: include zoomlocks here? e.g., { zoomScale: "shared", zoomCenter: "independent" }
 */

/**
 * Some rules in naming variables/interfaces.
 * - Make the names that are shown to users simple and short.
 * - Make the names that are internally used to be consistent to HG.
 */

export interface HiGlassLiteSpec {
    servers?: string | string[]; // EQ_TO trackSourceServers

    views: View[];

    consistency?: Consistency[];

    config?: HLTopLevelConfig;
}

export interface View {
    uniqueName?: string;  // EQ_TO uid
    // TODO: change these two similar to that in altair?
    xDomain?: number[]; // EQ_TO initialXDomain // TODO: Can we use more readable format? (e.g., chr1.12322)
    yDomain?: number[]; // EQ_TO initialYDomain
    ///
    // TODO: should we just provide absolute position using the `Track.width and Track.height`?
    w?: number; // EQ_TO `layout.width`, range (0 - 12) (Default: 12)
    h?: number; // EQ_TO `layout.height`, range (0 - 12) (Default: 12)
    x?: number;  // EQ_TO `layout.x`, range (0 - 12) (Default: 0)
    y?: number;  // EQ_TO `layout.y`, range (0 - 12) (Default: 0)
    ///
    tracks: Track[];

    // TODO: overlays?: Overlay[];
    // TODO: selectionView?

    config?: HLTopLevelConfig;
}

/**
 * Currently covering "heatmap" and "*-gene-annotations" in `EnumTrack`
 */
export type TrackType = "heatmap" | "gene-annotation";
export interface Track {
    uniqueName?: string;
    description?: string;
    type: TrackType;
    data: string;   // URL of data (format: `${server}${tilesetUid}`).
    // TOOD: should we support for non-genomic axis?
    xAxis: true | false | "top" | "bottom"; // Default: top
    yAxis: true | false | "left" | "right"; // Default: right
    ///
    position: TrackPosition;
    chromInfoPath?: string;
    size?: number;  // Used only for `top`, `left`, `right`, and `bottom` tracks.
    width?: number;     // (Default: ?)
    height?: number;    // (Default: ?)

    // TODO: Investigate these more:
    // position?: string; // EQ_TO Track.position. What is this for?
    // options?: Object;
    // data?: Data; // ?
    // fromViewUid?: null | string;
    // x?: number;
    // y?: number;
}

export type TrackPosition = "center" | "left" | "top" | "right" | "bottom" | "gallery" | "whole";

interface Data {
    type?: string;  // TODO: What kinds of types exist?
    children?: any[];
    tiles?: Object;
    tilesetInfo?: Object;
}

interface Consistency {
    /**
     * `true` and `false` correspond to "shared" and "independent", respectively.
     */
    // List of `uniqueName` of `view` or `track` or indexes appear in the specification.
    targets: string[] | number[];
    // Default: The first element of `targets`.
    reference?: string;
    color?: "shared" | "independent" | "distinct" | true | false;
    x?: "shared" | "independent" | true | false;
    y?: "shared" | "independent" | true | false;
    zoomScale?: "shared" | "independent" | true | false;
    zoomCenter?: "shared" | "independent" | true | false;
}

interface HLTopLevelConfig {
    /**
     * This can be applied to the top level, i.e., in HiGlassLiteSpec.
     */
    chromInfoPath: string; // TODO: Can we aggregate multiple of these to one?
    exportViewUrl?: string // /api/v1/viewconfs
    // TODO: How about aggregating these three options?
    editable?: boolean; // true
    viewEditable?: boolean; // true
    tracksEditable?: boolean; // true
    zoomFixed?: boolean; // false
    //
    searchBox?: boolean | GenomePositionSearchBox; // EQ_TO genomePositionSearchBox
}

interface GenomePositionSearchBox {
    // TODO: Can we remove these or aggregate with others?
    autocompleteServer?: string, // "//higlass.io/api/v1"
    autocompleteId?: string, // "OHJakQICQD6gTD7skx4EWA"
    chromInfoServer: string, // "//higlass.io/api/v1"
    chromInfoId: string, // "hg19"
    //
}

// TODO: Huge tasks here: Need to include options for each track.
// This can be found in `configs/index.js` at `higlass/higlass`.