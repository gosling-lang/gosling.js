import type { JoinTransform, SpatialTrack, Track } from '@gosling-lang/gosling-schema';
import { assert } from "../core/utils/assert";
import type { OverlaidSpatialTrack } from 'src/tracks/spatial-track/spatial-track';

/**
 * Convert a 3D-specific spec into a generalized spec (i.e., moving 3D model data to the `join` transform)
 */
export function _fixTrackToWalkaround(t: Track) {
    // export function _fixTrackToWalkaround(t: SpatialTrack | OverlaidSpatialTrack) {
    console.warn("track before _fixTrackToWalkaround", t);
    console.log({ ...t });
    const { layout } = t;
    t.layout;
    if (typeof layout == 'object' && 'type' in layout && layout.type === 'spatial') {
        // This means, we encountered a spatial layout track
        const { model } = layout;
        const [x, y, z] = model.xyz;
        const { url, chromosome: chr, position: coord } = model;
        assert('spatial' in t, "Should be a spatial track.");
        t.spatial = {
            x,
            y,
            z,
            chr,
            coord
        };
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
        t.layout = 'spatial';
    } else if (typeof layout == 'object') {
        t.layout = layout.type;
    }

    if (t.locus && !t.x) {
        t.x = { ...t.locus, type: 'genomic' };
    }
    console.warn("track after _fixTrackToWalkaround", t);
}
