import type { GFF3Feature, GFF3Sequence } from '@gmod/gff';
/**
 * Type guard for GFF3Feature
 * @param entry An element from GFF.parseStringSync() return value
 * @returns True if type is GFF3Feature
 */
export function isGFF3Feature(entry: GFF3Feature | GFF3Sequence): entry is GFF3Feature {
    return Array.isArray(entry as GFF3Feature);
}

/** Returns an array of the unique values sampled n times between 0 and maxValue */
export function makeRandomSortedArray(n: number, maxValue: number) {
    const randomArray = [];
    for (let i = 0; i < n; i++) {
        const randomNumber = Math.floor(Math.random() * (maxValue + 1));
        randomArray.push(randomNumber);
    }
    const sorted = randomArray.sort((a, b) => a - b);
    return [...new Set(sorted)];
}
