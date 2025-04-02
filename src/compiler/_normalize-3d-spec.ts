import type { JoinTransform, Track } from '@gosling-lang/gosling-schema';

/**
 * Convert a 3D-specific spec into a generalized spec (i.e., moving 3D model data to the `join` transform)
 */
export function _fixTrackToWalkaround(t: Track) {
    const { layout } = t;
    if (typeof layout == 'object' && 'type' in layout && layout.type === 'spatial') {
        // This means, we encountered a spatial layout track
        const { model } = layout;
        const [x, y, z] = model.xyz;
        const { url, chromosome: chr, position: coord } = model;
        // @ts-expect-error
        t.spatial = {
            x,
            y,
            z,
            chr,
            coord
        };
        const dataTransform: JoinTransform = {
            type: 'join',
            from: { url, chromosomeField: chr, genomicField: coord },
            to: { startField: 'start', endField: 'end' }
        };
        // @ts-expect-error
        t.dataTransform = [dataTransform];
        t.layout = 'spatial';
    } else if (typeof layout == 'object') {
        t.layout = layout.type;
    }

    // @ts-expect-error
    if (t.locus && !t.x) {
        // @ts-expect-error
        t.x = { ...t.locus, type: 'genomic' };
    }
    console.error('fixed track spec', t);
}
