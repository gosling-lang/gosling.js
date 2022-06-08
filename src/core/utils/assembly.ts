import type { GenomicPosition } from '@gosling.schema';
import {
    CHROM_SIZE_HG16,
    CHROM_SIZE_HG17,
    CHROM_SIZE_HG18,
    CHROM_SIZE_HG19,
    CHROM_SIZE_HG38,
    CHROM_SIZE_MM10,
    CHROM_SIZE_MM9
} from './chrom-size';

export interface ChromSize {
    size: { [chr: string]: number };
    interval: { [chr: string]: [number, number] };
    total: number;
    path: string;
}

/**
 * Get relative chromosome position (e.g., `100` => `{ chromosome: 'chr1', position: 100 }`)
 */
export function getRelativeGenomicPosition(absPos: number, assembly?: string): GenomicPosition {
    const [chromosome, absInterval] = Object.entries(GET_CHROM_SIZES(assembly).interval).find(d => {
        const [start, end] = d[1];
        return start <= absPos && absPos < end;
    }) ?? [null, null];

    if (!chromosome || !absInterval) {
        // The number is out of range
        return { chromosome: 'unknown', position: absPos };
    }

    return { chromosome, position: absPos - absInterval[0] };
}

/**
 * Get chromosome sizes.
 * @param assembly (default: 'hg38')
 */
export function GET_CHROM_SIZES(assembly?: string): ChromSize {
    if (assembly && assembly in CRHOM_SIZES) {
        return CRHOM_SIZES[assembly];
    } else {
        // We do not have that assembly prepared, so return a default one.
        return CRHOM_SIZES.hg38;
    }
}

const basePath = (assembly: string) => `https://s3.amazonaws.com/gosling-lang.org/data/${assembly}.chrom.sizes`;
const CRHOM_SIZES: { [assembly: string]: ChromSize } = Object.freeze({
    hg38: {
        size: CHROM_SIZE_HG38,
        interval: getChromInterval(CHROM_SIZE_HG38),
        total: getChromTotalSize(CHROM_SIZE_HG38),
        path: basePath('hg38')
    },
    hg19: {
        size: CHROM_SIZE_HG19,
        interval: getChromInterval(CHROM_SIZE_HG19),
        total: getChromTotalSize(CHROM_SIZE_HG19),
        path: basePath('hg19')
    },
    hg18: {
        size: CHROM_SIZE_HG18,
        interval: getChromInterval(CHROM_SIZE_HG18),
        total: getChromTotalSize(CHROM_SIZE_HG18),
        path: basePath('hg18')
    },
    hg17: {
        size: CHROM_SIZE_HG17,
        interval: getChromInterval(CHROM_SIZE_HG17),
        total: getChromTotalSize(CHROM_SIZE_HG17),
        path: basePath('hg17')
    },
    hg16: {
        size: CHROM_SIZE_HG16,
        interval: getChromInterval(CHROM_SIZE_HG16),
        total: getChromTotalSize(CHROM_SIZE_HG16),
        path: basePath('hg16')
    },
    mm10: {
        size: CHROM_SIZE_MM10,
        interval: getChromInterval(CHROM_SIZE_MM10),
        total: getChromTotalSize(CHROM_SIZE_MM10),
        path: basePath('mm10')
    },
    mm9: {
        size: CHROM_SIZE_MM9,
        interval: getChromInterval(CHROM_SIZE_MM9),
        total: getChromTotalSize(CHROM_SIZE_MM9),
        path: basePath('mm9')
    },
    // `unknown` assembly contains only one chromosome with max length
    unknown: {
        size: { chr: Number.MAX_VALUE },
        interval: { chr: [0, Number.MAX_VALUE] },
        total: Number.MAX_VALUE,
        path: basePath('hg38') // just to ensure this does not make crash
    }
});

/**
 * Calculate cumulative interval of each chromosome.
 */
export function getChromInterval(chromSize: { [k: string]: number }) {
    const interval: { [k: string]: [number, number] } = {};

    Object.keys(chromSize).reduce((sum, k) => {
        interval[k] = [sum, sum + chromSize[k]];
        return sum + chromSize[k];
    }, 0);

    return interval;
}

/**
 * Calculate total size of entire chromosomes.
 */
export function getChromTotalSize(chromSize: { [k: string]: number }) {
    return Object.values(chromSize).reduce((sum, current) => sum + current, 0);
}
