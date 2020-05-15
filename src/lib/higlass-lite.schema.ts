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
 * (Add more here)
 */

/**
 * What is not supported by HiGlass-Lite.
 * Separate genomePositionSearchBox for each view. (removed genomePositionSearchBoxVisible)
 */

/**
 * Some rules in naming variables/interfaces.
 * - Make the names that are shown to users simple and short.
 * - Make the names that are internally used to be consistent to HG.
 */

export interface HiGlassLiteSpec {
    servers: string | string[]; // EQ_TO trackSourceServers
    config?: HLConfig;
    // TODO: Support locks (i.e., zoomLocks, locationLocks, valueScaleLocks)
}

interface genomePositionSearchBox {
    // TODO: Can we remove these or aggregate with others?
    autocompleteServer: string, // "//higlass.io/api/v1"
    autocompleteId: string, // "OHJakQICQD6gTD7skx4EWA"
    chromInfoServer: string, // "//higlass.io/api/v1"
    chromInfoId: string, // "hg19"
    //
}

interface HLConfig {
    // TODO: How about aggregating these three options?
    editable?: boolean; // true
    viewEditable?: boolean; // true
    tracksEditable?: boolean; // true
    // 
    searchBox?: boolean | genomePositionSearchBox; // EQ_TO genomePositionSearchBox

    exportViewUrl?: string // /api/v1/viewconfs
}

// TODO: Huge tasks here: Need to include options for each track.
// This can be found in `configs/index.js` at `higlass/higlass`.