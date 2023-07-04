import type { GFF3Feature, GFF3Sequence } from '@gmod/gff';
/**
 * Type guard for GFF3Feature
 * @param entry An element from GFF.parseStringSync() return value
 * @returns True if type is GFF3Feature
 */
export function isGFF3Feature(entry: GFF3Feature | GFF3Sequence): entry is GFF3Feature {
    return Array.isArray(entry as GFF3Feature);
}