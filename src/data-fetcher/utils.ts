import { bisector } from 'd3-array';
import { tsvParseRows } from 'd3-dsv';

import type * as HiGlass from '@higlass/types';

const chromInfoBisector = bisector((d: { pos: number }) => d.pos).left;

const chrToAbs = (chrom: string, chromPos: number, chromInfo: HiGlass.ChromInfo) =>
    chromInfo.chrPositions[chrom].pos + chromPos;

const absToChr = (absPosition: number, chromInfo: HiGlass.ChromInfo) => {
    if (!chromInfo || !chromInfo.cumPositions || !chromInfo.cumPositions.length) {
        return null;
    }

    let insertPoint = chromInfoBisector(chromInfo.cumPositions, absPosition);
    const lastChr = chromInfo.cumPositions[chromInfo.cumPositions.length - 1].chr;
    const lastLength = chromInfo.chromLengths[lastChr];

    // @ts-expect-error
    insertPoint -= insertPoint > 0 && 1;

    let chrPosition = Math.floor(absPosition - chromInfo.cumPositions[insertPoint].pos);
    let offset = 0;

    if (chrPosition < 0) {
        // before the start of the genome
        offset = chrPosition - 1;
        chrPosition = 1;
    }

    if (insertPoint === chromInfo.cumPositions.length - 1 && chrPosition > lastLength) {
        // beyond the last chromosome
        offset = chrPosition - lastLength;
        chrPosition = lastLength;
    }

    return [chromInfo.cumPositions[insertPoint].chr, chrPosition, offset, insertPoint] as const;
};

/**
 * Construct size of chromosomes from data.
 */
export function parseChrSizes(rows: string[][]): HiGlass.ChromInfo {
    const info: HiGlass.ChromInfo = {
        cumPositions: [],
        chromLengths: {},
        chrPositions: {},
        totalLength: 0
    };

    rows.forEach((d, i) => {
        const chr = d[0];
        const length = Number(d[1]);
        const chrPosition = { id: i, chr, pos: info.totalLength };

        info.chrPositions[chr] = chrPosition;
        info.chromLengths[chr] = length;
        info.cumPositions.push(chrPosition);
        info.totalLength += length;
    });

    return info;
}

export type ExtendedChromInfo = HiGlass.ChromInfo & {
    absToChr(absPos: number): ReturnType<typeof absToChr> | null;
    chrToAbs(chr: [name: string, pos: number]): number | null;
};

export async function fetchChromInfo(url: string): Promise<ExtendedChromInfo> {
    const response = await fetch(url);
    const chrInfoText = await response.text();
    const data = tsvParseRows(chrInfoText);
    const info = parseChrSizes(data);
    return {
        ...info,
        absToChr: absPos => (info.chrPositions ? absToChr(absPos, info) : null),
        chrToAbs: ([chrName, chrPos]) => (info.chrPositions ? chrToAbs(chrName, chrPos, info) : null)
    };
}
