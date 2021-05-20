import { format } from 'd3-format';
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
 * Get relative chromosome position (e.g., `100` => `chr:100`)
 */
export function getRelativeGenomicPosition(absPos: number, assembly?: string): string {
    const chrAndRange = Object.entries(GET_CHROM_SIZES(assembly).interval).find(d => {
        const [, [start, end]] = d;
        return start <= absPos && absPos < end;
    });

    if (!chrAndRange) {
        // The number is out of range
        return `${absPos}`;
    }

    const pos = format(',')(absPos - chrAndRange[1][0]);
    return `${chrAndRange[0]}:${pos}`;
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
