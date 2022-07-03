import { bisector } from 'd3-array';
import { tsvParseRows } from 'd3-dsv';
import { RemoteFile as _RemoteFile } from 'generic-filehandle';

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

export class RemoteFile extends _RemoteFile {
    // Overrides `read` to eagerly read 200 or 206 response
    // from https://github.com/GMOD/generic-filehandle/blob/0e8209be25e3097307bd15e964edd8c017e808d7/src/remoteFile.ts#L100-L162
    public read: _RemoteFile['read'] = async (
        buffer,
        offset = 0,
        length,
        position = 0,
        opts = {}
    ): Promise<{ bytesRead: number; buffer: Buffer }> => {
        const { headers = {}, signal, overrides = {} } = opts;

        if (length < Infinity) {
            headers.range = `bytes=${position}-${position + length}`;
        } else if (length === Infinity && position !== 0) {
            headers.range = `bytes=${position}-`;
        }
        const args = {
            // @ts-expect-error private property
            ...this.baseOverrides,
            ...overrides,
            headers: {
                ...headers,
                ...overrides.headers,
                // @ts-expect-error private property
                ...this.baseOverrides.headers
            },
            method: 'GET',
            redirect: 'follow',
            mode: 'cors',
            signal
        };
        const response = await this.fetch(this.url, args);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText} ${this.url}`);
        }

        // Just read the response if it was successful.
        if (response.status === 200 || response.status === 206) {
            // @ts-expect-error private method
            const responseData = await this.getBufferFromResponse(response);
            const bytesCopied = responseData.copy(buffer, offset, 0, Math.min(length, responseData.length));

            // try to parse out the size of the remote file
            const res = response.headers.get('content-range');
            const sizeMatch = /\/(\d+)$/.exec(res || '');
            if (sizeMatch && sizeMatch[1]) {
                // @ts-expect-error private property
                this._stat = { size: parseInt(sizeMatch[1], 10) };
            }

            return { bytesRead: bytesCopied, buffer };
        }

        // TODO: try harder here to gather more information about what the problem is
        throw new Error(`HTTP ${response.status} fetching ${this.url}`);
    };
}
