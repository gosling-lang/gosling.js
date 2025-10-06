import type { JoinTransform, OverlaidTrack, SingleTrack } from '@gosling-lang/gosling-schema';
import { assert } from "../core/utils/assert";

/**
 * Convert a 3D-specific spec into a generalized spec (i.e., moving 3D model data to the `join` transform).
 * What happens here:
 *     1. asdf
 */
export function propagateSpatialLayoutInfo(t: SingleTrack | OverlaidTrack) {
    const { layout } = t;
    if (typeof layout == 'object' && 'type' in layout && layout.type === 'spatial') {
        // This means, we encountered a spatial layout track
        const { model } = layout;
        const [x, y, z] = model.xyz;
        const { url, chromosome: chr, position: coord } = model;
        //~ Step 1: Moving the spatial layout information from the view layout level down to the track level
        t.spatial = {
            x,
            y,
            z,
            chr,
            coord
        };
        t.layout = 'spatial';

        //~ Step 2: Moving the 3D model data information to the `join` transform
        const dataTransform: Omit<JoinTransform, 'to'> = {
            type: 'join',
            from: { url, chromosomeField: chr, genomicField: coord }
        };
        // TODO: need to support other data types as well
        let to: JoinTransform['to'] = { startField: 'start', endField: 'end' };
        if (t.data?.type === 'bigwig') {
            to = { startField: 'start', endField: 'end' };
        } else if (t.data?.type === 'csv') {
            // TODO: Not the reliable way to select two data fields corresponding to start and end positions
            const startField = t.data.genomicFields?.[0] ?? 'unknown';
            const endField = t.data.genomicFields?.[1] ?? undefined;
            to = { startField, endField };
        }
        t.dataTransform = [{ ...dataTransform, to }, ...(t.dataTransform ?? [])];
    } else if (typeof layout == 'object') {
        t.layout = layout.type;
    }

    if (t.locus && !t.x) {
        t.x = { ...t.locus, type: 'genomic' };
    }
}
