// Refer to the following url for dealing with defaults:
// https://github.com/vega/vega-lite/blob/23fe2b9c6a82551f321ccab751370ca48ae002c9/src/channeldef.ts#L961

/**
 * Some key characteristics in the HiGlass-Lite grammar.
 * 1. Flexibility to users, burden to developers.
 *      e.g., trackSourceServers: [] vs. servers: string[] | string;
 *      e.g., searchBox?: boolean | genomePositionSearchBox;
 * 2. Optional configs placed separately.
 * 3. Easy to apply and reproduce themes.
 * 4. Shorten key names to be able to easily remember.
 *      e.g., genomePositionSearchBox => searchBox
 * 5. Low level of hierarchy.
 *      e.g., views[{tracks:{top:[ ... ], ...}, ...} => 
 * 6. Targeted for quick authoring visualizations
 *      e.g., exportViewUrl less preferred
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
 * - TODO: consistency
 *      - Determines visual consistency across views and/or trakcs
 *      - e.g., consistency: { color: : "shared" } use same color for same type
 *      - e.g., consistency: { x: "independent" } not currently supported for track
 */

/**
 * Some rules in naming variables/interfaces.
 * - Make the names that are shown to users simple and short.
 * - Make the names that are internally used to be consistent to HG.
 */

export interface HiGlassLiteSpec {
    servers: string | string[]; // EQ_TO trackSourceServers
    chromInfoPath: string, // TODO: Can we aggregate this to one?
    views: View[];


    config?: HLConfig;

    // TODO: Support locks (i.e., zoomLocks, locationLocks, valueScaleLocks)
}

interface View {
    consistency: Consistency;
    // TODO: Add more..
}

interface Consistency {
    // true and false correspond to "shared" and "independent", respectively.
    color: "shared" | "independent" | "distinct" | true | false;
    x: "shared" | "independent" | true | false;
    y: "shared" | "independent" | true | false;
}

interface HLConfig {
    // TODO: How about aggregating these three options?
    editable?: boolean; // true
    viewEditable?: boolean; // true
    tracksEditable?: boolean; // true
    zoomFixed?: boolean; // false
    // 
    searchBox?: boolean | genomePositionSearchBox; // EQ_TO genomePositionSearchBox

    exportViewUrl?: string // /api/v1/viewconfs
}

interface genomePositionSearchBox {
    // TODO: Can we remove these or aggregate with others?
    autocompleteServer: string, // "//higlass.io/api/v1"
    autocompleteId: string, // "OHJakQICQD6gTD7skx4EWA"
    chromInfoServer: string, // "//higlass.io/api/v1"
    chromInfoId: string, // "hg19"
    //
}

// TODO: Huge tasks here: Need to include options for each track.
// This can be found in `configs/index.js` at `higlass/higlass`.