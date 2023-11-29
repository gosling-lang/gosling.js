import type { Assembly } from '@gosling-lang/gosling-schema';

/**
 * Get a chromosome name for the consistentcy, e.g., `1` --> `chr1`.
 * @param chrName A chromosome name to be sanitized
 * @param assembly A genome assembly of the data
 * @param chromosomePrefix A prefix string that can be replaced to 'chr'
 * @returns
 */
export function sanitizeChrName(chrName: string, assembly: Assembly, chromosomePrefix?: string) {
    if (Array.isArray(assembly)) {
        // this is a custom assembly, so use this as is
        return chrName;
    }

    // For assemblies in Gosling, we use the `chr` prefix consistently
    if (chromosomePrefix) {
        // `hs1` --> `chr1`
        chrName = chrName.replace(chromosomePrefix, 'chr');
    } else if (!chrName.includes('chr')) {
        // `1` --> `chr1`
        chrName = `chr${chrName}`;
    }
    return chrName;
}
