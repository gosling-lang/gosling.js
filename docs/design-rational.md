### Key characteristics for HiGlass-Lite
- Flexibility to users, burden to designers (i.e., us)
    - e.g., trackSourceServers: [] vs. servers: string[] | string
    - e.g., searchBox?: boolean | genomePositionSearchBox;
- Shorten key names to be able to more easily remember
    - e.g., genomePositionSearchBox => searchBox
- Optional configs placed separately
- Easy to apply and reproduce themes.
- Low level hierarchy of codes
    - e.g., views[{tracks:{top:[ ... ], ...}, ...} => views[{tracks:[ ... ], ...}
- Targeted for quick authoring visualizations
    - e.g., exportViewUrl less preferred
- Users do not need to think about uids (e.g., zoomLocks)
    - e.g., consistency: {zoomLevel: “shared”, zoomCenter: “shared”}
- Auto-generates readable UIDs
    - e.g., OHJakQICQD6gTD7skx4EWA => view-1-track-2-center-heatmap
    - This can better helps revising the compiled higlass view configs.
- ...
### Something to think of
- Relative positioning vs. absolute positioning
    - A || B || C (vega style) vs. left: [A], center: [B], right: [C]
- How to remove multiple layout possibly duplicated options
    - width, height, layout: {x, y, w, h}
### What are not supported in HiGlass-Lite compared to HiGlass view config
- No separate genomePositionSearchBox for each view.

### Exclusive features in HiGlass-Lite
- Consistency: determines visual consistency across views and/or tracks
    - e.g., consistency: { color: : "shared" } use same color for same type
    - e.g., consistency: { x: "independent" } not currently supported for track
    - e.g., { zoomScale: "shared", zoomCenter: "independent" }