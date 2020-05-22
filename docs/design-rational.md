### Key characteristics for HiGlass-Lite
- Flexibility and simplicity
    - Allow multiple types of input (vega)
        - e.g., `trackSourceServers: []` vs. `servers: string[] | string`
        - e.g., `searchBox?: boolean | genomePositionSearchBox`
    - Smaller number of options (e.g., track types currently more than 50)
        - e.g., `horizonta-` and `vertical-gene-annotations` => `gene-annotation-track`: Internally determine between the two depending on the track `position`.
        - e.g., Remove track type of `vertical-` and `horizontal-chromosome-labels`: Use `xAxis` and `yAxis` options to show chromosome labels.
    - Shorten the name of options to be able to more easily remember
        - e.g., `genomePositionSearchBox` => `searchBox`
- Low level hierarchy of codes
    - e.g., `views[{tracks:{top:[ ... ], ...}, ...}` => `views[{tracks:[ ... ]}, ...}]`
- Users do not need to think about uids (e.g., `zoomLocks`)
    - e.g., `consistency: {zoomLevel: “shared”, zoomCenter: “independent”}`
- Easy to apply and reproduce themes
- Optional configs placed separately
- Auto-generates readable UIDs
    - e.g., `OHJakQICQD6gTD7skx4EWA` => `view-1-track-2-center-heatmap`
    - This can be helpful in revising the compiled higlass view configs.
- Easier to determin visual consistency across views and/or tracks
    - e.g., `consistency: { color: : "shared" }` to use same color for same type
    - e.g., `{ zoomScale: "shared", zoomCenter: "independent" }`
    - e.g., `consistency: { x: "independent" }`: should we support?
- [...]

### Something to think of
- Relative positioning vs. absolute positioning
    - A || B || C (altair style) vs. {left: [A], center: [B], right: [C]}
- How to remove multiple layouting options
    - `width`, `height`, `layout: {x, y, w, h}`

### What are not supported in HiGlass-Lite compared to HiGlass view config
- No separate genomePositionSearchBox for each view.
- Not using `exportViewUrl`
    - HiGlass-Lite is targeted for quick authorization of visualizations.