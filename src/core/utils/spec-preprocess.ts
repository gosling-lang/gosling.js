import { BasicSingleTrack, GoslingSpec } from '../gosling.schema';
import { IsTemplate, IsDataDeepTileset } from '../gosling.schema.guards';
import assign from 'lodash/assign';
import { spreadTracksByData } from './superpose';

/**
 * Update track-level specs considering the root-level specs (e.g., arrangements).
 * @param spec
 */
export function fixSpecDownstream(spec: GoslingSpec) {
    /**
     * Genome builds
     */
    if (spec.assembly) {
        spec.tracks.forEach(t => {
            if (t.assembly === undefined) {
                t.assembly = spec.assembly;
            }
        });
    }

    // !!! TODO: (FOR THE RENDERING PERFORMANCE) We need to also combine superposed tracks if they use identical data and metadata so tha we have to load the data only once.
    // !!! This should be taken before fixing `superposeOnPreviousTrack` options.
    /**
     * Spread superposed tracks if they are assigned to different data/metadata.
     * This process is necessary since we are passing over each track to HiGlass, and if a track contain multiple datastes, HiGlass cannot handle that.
     */
    spec.tracks = spreadTracksByData(spec.tracks);

    /**
     * superposeOnPreviousTrack
     */
    if (spec.tracks[0]?.superposeOnPreviousTrack) {
        spec.tracks[0].superposeOnPreviousTrack = false;
    }

    spec.tracks.forEach((t, i) => {
        if (t.superposeOnPreviousTrack) {
            // If this track should be superposed on top of the previous one, copy the properties that should be shared with the reference track
            const prevTrack = spec.tracks[i - 1];
            t.span = prevTrack.span;
            t.layout = prevTrack.layout;
            t.width = prevTrack.width;
            t.height = prevTrack.height;
            t.title = prevTrack.title;
            t.subtitle = prevTrack.subtitle;
        }
    });

    // !!! This should be taken before fixing `static` options so that `layout` can be considered when disabling zoomability.
    /**
     * Flag tracks to use circular marks
     */
    if (spec?.layout === 'circular') {
        // We need to let individual tracks know that they are rendered in a circular layout
        spec.tracks.forEach(t => {
            if (t.layout === undefined) {
                t.layout = 'circular';
            }
        });
    }

    /**
     * Default `static` option is `true` for `circular` layouts.
     */
    // Force disable zoomability when the top-level static option is enabled
    spec.tracks.forEach(t => {
        if (t.static === undefined && t.layout === 'circular') {
            t.static = true;
        }
    });

    /**
     * Zoomability
     */
    if (spec.static !== undefined) {
        // Force disable zoomability when the top-level static option is enabled
        spec.tracks.forEach(t => {
            if (t.static === undefined) {
                t.static = spec.static;
            }
        });
    }
}

/**
 * Get an encoding template for the `higlass-vector` data type.
 * @param column
 * @param value
 */
export function getVectorTemplate(column: string, value: string): BasicSingleTrack {
    return {
        data: {
            type: 'vector',
            url: 'https://localhost:8080/api/v1/tileset_info/?d=VLFaiSVjTjW6mkbjRjWREA',
            column,
            value
        },
        mark: 'bar',
        x: { field: column, type: 'genomic', axis: 'bottom' },
        y: { field: value, type: 'quantitative' }
    };
}

export function getMultivecTemplate(
    row: string,
    column: string,
    value: string,
    categories: string[] | undefined
): BasicSingleTrack {
    return categories && categories.length < 10
        ? {
              data: {
                  type: 'multivec',
                  url: 'https://localhost:8080/api/v1/tileset_info/?d=VLFaiSVjTjW6mkbjRjWREA',
                  row,
                  column,
                  value,
                  categories
              },
              mark: 'bar',
              x: { field: column, type: 'genomic', axis: 'bottom' },
              y: { field: value, type: 'quantitative' },
              row: { field: row, type: 'nominal', legend: true },
              color: { field: row, type: 'nominal' }
          }
        : {
              data: {
                  type: 'multivec',
                  url: 'https://localhost:8080/api/v1/tileset_info/?d=VLFaiSVjTjW6mkbjRjWREA',
                  row,
                  column,
                  value,
                  categories
              },
              mark: 'rect',
              x: { field: column, type: 'genomic', axis: 'bottom' },
              row: { field: row, type: 'nominal', legend: true },
              color: { field: value, type: 'quantitative' }
          };
}

/**
 * Override default visual encoding in each track for given data type.
 * @param spec
 */
export function overrideTemplates(spec: GoslingSpec) {
    spec.tracks.forEach((t, i) => {
        if (!t.data || !IsDataDeepTileset(t.data)) {
            // if `data` is not specified, we can not provide a correct template.
            return;
        }

        if (!IsTemplate(t)) {
            // This is not partial specification that we need to use templates
            return;
        }

        switch (t.data.type) {
            case 'vector':
                spec.tracks[i] = assign(getVectorTemplate(t.data.column, t.data.value), t);
                break;
            case 'multivec':
                spec.tracks[i] = assign(
                    getMultivecTemplate(t.data.row, t.data.column, t.data.value, t.data.categories),
                    t
                );
                break;
        }
    });
}
