import { BasicSingleTrack, GeminidSpec } from '../geminid.schema';
import { IsDataMetadata, IsTemplate } from '../geminid.schema.guards';
import assign from 'lodash/assign';

/**
 * Update track-level specs considering the root-level specs (e.g., arrangements).
 * @param spec
 */
export function fixSpecDownstream(spec: GeminidSpec) {
    /**
     * superposeOnPreviousTrack
     */
    if (spec.tracks[0]?.superposeOnPreviousTrack) {
        spec.tracks[0].superposeOnPreviousTrack = false;
    }

    /**
     * Zoomability
     */
    if (spec.static) {
        // Force disable zoomability when the top-level static option is enabled
        spec.tracks.forEach(t => {
            t.static = true;
        });
    }

    /**
     * Flag tracks to use circular marks
     */
    if (spec?.layout === 'circular') {
        // We need to let individual tracks know that they are rendered in a circular layout
        spec.tracks.forEach(t => {
            if (t.layout === undefined) {
                // EXPERIMENTAL: Remove if statement
                t.layout = 'circular';
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
        data: { type: 'tileset', url: 'https://localhost:8080/api/v1/tileset_info/?d=VLFaiSVjTjW6mkbjRjWREA' },
        metadata: {
            type: 'higlass-vector',
            column,
            value
        },
        mark: 'bar',
        x: { field: column, type: 'genomic', axis: 'bottom' },
        y: { field: value, type: 'quantitative' }
    };
}

/**
 * Override default visual encoding in each track for given data type.
 * @param spec
 */
export function resolvePartialSpec(spec: GeminidSpec) {
    spec.tracks.forEach((t, i) => {
        if (!t.metadata || !IsDataMetadata(t.metadata)) {
            // if `metadata` is not specified, we can not provide a correct template since we do not know the exact data type.
            return;
        }

        if (!IsTemplate(t)) {
            // This is not partial specification that we need to use templates
            return;
        }

        switch (t.metadata.type) {
            case 'higlass-vector':
                spec.tracks[i] = assign(getVectorTemplate(t.metadata.column, t.metadata.value), t);
                break;
        }
    });
}
