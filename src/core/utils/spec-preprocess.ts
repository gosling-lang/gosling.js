import { GeminiSpec, GlyphElement, Track } from '../gemini.schema';
import { DEFAULT_TRACK_HEIGHT, DEFAULT_TRACK_WIDTH } from '../layout/defaults';
import { visualizationSize } from './bounding-box';

/**
 * Update track-level specs considering the root-level specs (e.g., arrangements).
 * @param spec
 */
export function fixSpecDownstream(spec: GeminiSpec) {
    /**
     * Flag tracks to use circular marks
     */
    if (spec.layout?.type === 'circular') {
        // We need to let individual tracks know that they are rendered in a circular layout
        spec.tracks.forEach(t => {
            t._is_circular = true;
        });
    }

    /**
     * Add empty tracks between tracks to intruduce white-space gaps.
     */
    addGap(spec);

    /**
     * Update width & height. Cumulative width and height of tracks should be equal to root-level size definition.
     */
    syncSize(spec);

    // console.log(spec);
}

/**
 * Add empty tracks (i.e., gaps) between tracks.
 * @param spec
 */
function addGap(spec: GeminiSpec): GeminiSpec {
    if (!spec.layout?.gap) {
        // We do not need to add empty tracks since betwee-track gaps are zero
        return spec;
    }
    const gap: number = spec.layout.gap;

    const wrap: number = spec.layout?.wrap ?? 999;

    // Total number of cells in the tabular layout
    const numCells = spec.tracks.map(t => (typeof t.span === 'number' ? t.span : 1)).reduce((a, b) => a + b, 0);

    // Number of columns and rows
    let numCols = 0;
    let numRows = 0;
    if (spec.layout?.direction === 'horizontal') {
        numRows = Math.ceil(numCells / wrap);
        numCols = Math.min(wrap, numCells);
    } else {
        // by default, vertical
        numCols = Math.ceil(numCells / wrap);
        numRows = Math.min(wrap, numCells);
    }

    // We add empty tracks between tracks.
    numRows += numRows - 1;
    numCols += numCols - 1;

    const tracksWithGaps: Track[] = [];

    const addGapTracks = (repeat: number) => {
        Array(repeat)
            .fill(0)
            .forEach(() => {
                tracksWithGaps.push(
                    JSON.parse(
                        JSON.stringify({
                            mark: 'empty',
                            data: { type: 'csv', url: '' },
                            width: gap,
                            height: gap
                        })
                    ) as Track
                );
            });
    };

    // Iterate tracks to add between-track gaps
    let colI = 0;
    let rowI = 0;
    spec.tracks.forEach((track, i) => {
        const span: number = typeof track.span === 'number' ? track.span : 1;

        tracksWithGaps.push({
            ...track,
            span: span + 1 // considering the gap, span += 1
        } as Track);

        if (spec.layout?.direction === 'horizontal') {
            colI += span + 1;

            if (colI >= numCols) {
                // at the end of the last column, so add a between-row gap
                if (i < spec.tracks.length - 1) addGapTracks(numCols);
                colI = 0;
                rowI += 1 + 1;
            } else {
                // add a between-column gap
                if (i < spec.tracks.length - 1) addGapTracks(span);
            }
        } else {
            // by default, vertical direction
            rowI += span + 1;

            if (rowI >= numRows) {
                // at the end of the last row, so add a between-column gap
                if (i < spec.tracks.length - 1) addGapTracks(numRows);
                rowI = 0;
                colI += 1 + 1;
            } else {
                // add a between-row gap
                if (i < spec.tracks.length - 1) addGapTracks(span);
            }
        }
    });

    // console.log(tracksWithGaps);
    spec.layout.gap = 0;
    spec.layout.wrap = wrap + 1;
    spec.tracks = tracksWithGaps;
    return spec;
}

// TODO: If top-level size def is missing, add them
/**
 * Assign consistent sizes (width and height) of tracks and visualizations in the spec.
 * Track-level sizes should be updated to be proportional to the entire size of the visualization.
 * @param spec
 */
function syncSize(spec: GeminiSpec): GeminiSpec {
    const actualSize = visualizationSize(spec, false); // Actual size
    const cumSize = visualizationSize(spec, true); // Cumulative size of track definitions

    const widthFactor = actualSize.width / cumSize.width;
    const heightFactor = actualSize.height / cumSize.height;

    spec.tracks.forEach(track => {
        track.width = typeof track.width === 'number' ? track.width * widthFactor : DEFAULT_TRACK_WIDTH * widthFactor;
        track.height =
            typeof track.height === 'number' ? track.height * heightFactor : DEFAULT_TRACK_HEIGHT * heightFactor;
    });

    // console.log(actualSize, cumSize, spec);
    return spec;
}

/**
 * Domains and ranges in conditional marks are moved into `select` option for the compiling simplicity.
 * @param elements
 */
export function deepToLongElements(elements: GlyphElement[]) {
    const longElements: GlyphElement[] = [];
    elements.forEach(element => {
        if (typeof element.mark === 'object') {
            const { bind } = element.mark;
            for (let i = 0; i < element.mark.domain.length; i++) {
                const domain = element.mark.domain[i];
                const range = element.mark.range[i];
                const select = element.select ? element.select : [];
                longElements.push({
                    ...element,
                    mark: range,
                    select: [...select, { channel: bind, oneOf: [domain] }]
                });
            }
        } else {
            longElements.push(element);
        }
    });
    return longElements;
}
