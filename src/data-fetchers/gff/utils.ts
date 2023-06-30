import type { GFF3Feature, GFF3Sequence } from '@gmod/gff';
import type { GffTile } from './gff-worker';

/**
 * Type guard for GFF3Feature
 * @param entry An element from GFF.parseStringSync() return value
 * @returns True if type is GFF3Feature
 */
export function isGFF3Feature(entry: GFF3Feature | GFF3Sequence): entry is GFF3Feature {
    return Array.isArray(entry as GFF3Feature);
}
/**
 * Processes return value of GFF.parseStringSync() into tiles
 * @param parsed Output from GFF.parseStringSync()
 * @returns An array of GffTile
 */
export function parsedDataToTiles(parsed: (GFF3Feature | GFF3Sequence)[]): GffTile[] {
    const tiles: GffTile[] = [];
    for (const line of parsed) {
        if (isGFF3Feature(line)) {
            for (const feature of line) {
                tiles.push(feature);
            }
        }
    }
    return tiles;
}
