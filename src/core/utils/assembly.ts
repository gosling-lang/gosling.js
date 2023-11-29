import type { Assembly } from '@gosling-lang/gosling-schema';

// re-export public assembly-specific utilities
export type { ChromSize } from './exported-utils';
export {
    getRelativeGenomicPosition,
    computeChromSizes,
    getChromInterval,
    getChromTotalSize,
    parseGenomicPosition
} from './exported-utils';

import { parseGenomicPosition, computeChromSizes } from './exported-utils';

/**
 * Some presets of auto-complete IDs (`autocompleteId`) to search for genes using the HiGlass server.
 */
export function getAutoCompleteId(assembly?: Assembly) {
    switch (assembly) {
        case 'hg19':
            return 'OHJakQICQD6gTD7skx4EWA';
        case 'mm10':
            return 'QDutvmyiSrec5nX4pA5WGQ';
        case 'mm9':
            return 'GUm5aBiLRCyz2PsBea7Yzg';
        case 'hg38':
        default:
            return 'P0PLbQMwTYGy-5uPIQid7A';
    }
}

/**
 * A class that consistently manage and convert genomics positions.
 */
export class GenomicPositionHelper {
    constructor(public chromosome: string, public start?: number, public end?: number) {}
    static fromString(str: string) {
        const result = parseGenomicPosition(str);
        return new GenomicPositionHelper(result.chromosome, result.start, result.end);
    }
    toAbsoluteCoordinates(assembly?: Assembly, padding = 0): [number, number] {
        const info = computeChromSizes(assembly);
        const size = info.size[this.chromosome];
        const interval = info.interval[this.chromosome];
        if (size === undefined || interval === undefined) {
            throw new Error(`Chromosome name ${this.chromosome} is not valid`);
        }
        let { start, end } = this;
        if (start === undefined || end === undefined) {
            // if only a chromosome name is specified, set to the extent of the chromosome
            [start, end] = [1, size];
        }
        const offset = interval[0];
        return [start + offset - padding, end + offset + padding];
    }
}
