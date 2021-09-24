// @ts-nocheck
import { Buffer } from 'buffer/';
import { Z_SYNC_FLUSH, Inflate } from 'pako';

// https://github.com/GMOD/bgzf-filehandle/blob/master/src/unzip.js

// browserify-zlib, which is the zlib shim used by default in webpacked code,
// does not properly uncompress bgzf chunks that contain more than
// one bgzf block, so export an unzip function that uses pako directly
// if we are running in a browser.
export async function unzip(inputData: Buffer) {
    try {
        let strm;
        let pos = 0;
        let i = 0;
        const chunks = [];
        let inflator;
        do {
            const remainingInput = inputData.slice(pos);
            inflator = new Inflate();
            ({ strm } = inflator);
            inflator.push(remainingInput, Z_SYNC_FLUSH);
            if (inflator.err) throw new Error(inflator.msg);

            pos += strm.next_in;
            chunks[i] = Buffer.from(inflator.result);
            i += 1;
        } while (strm.avail_in);

        const result = Buffer.concat(chunks);
        return result;
    } catch (e) {
        if (e.message.match(/incorrect header check/)) {
            throw new Error('problem decompressing block: incorrect gzip header check');
        }
    }
}

// similar to unzipChunk above but slices (0,minv.dataPosition) and (maxv.dataPosition,end) off
export async function unzipChunkSlice(inputData: Buffer, chunk: any) {
    try {
        let strm;
        let cpos = chunk.minv.blockPosition;
        let dpos = chunk.minv.dataPosition;
        const decompressedBlocks = [];
        const cpositions = [];
        const dpositions = [];
        do {
            const remainingInput = inputData.slice(cpos - chunk.minv.blockPosition);
            const inflator = new Inflate();
            // @ts-ignore
            ({ strm } = inflator);
            // @ts-ignore
            inflator.push(remainingInput, Z_SYNC_FLUSH);
            if (inflator.err) throw new Error(inflator.msg);

            // @ts-ignore
            const buffer = Buffer.from(inflator.result);
            decompressedBlocks.push(buffer);
            let len = buffer.length;

            cpositions.push(cpos);
            dpositions.push(dpos);
            if (decompressedBlocks.length === 1 && chunk.minv.dataPosition) {
                // this is the first chunk, trim it
                decompressedBlocks[0] = decompressedBlocks[0].slice(chunk.minv.dataPosition);
                len = decompressedBlocks[0].length;
            }
            const origCpos = cpos;
            cpos += strm.next_in;
            dpos += len;

            if (origCpos >= chunk.maxv.blockPosition) {
                // this is the last chunk, trim it and stop decompressing
                // note if it is the same block is minv it subtracts that already
                // trimmed part of the slice length

                decompressedBlocks[decompressedBlocks.length - 1] = decompressedBlocks[
                    decompressedBlocks.length - 1
                ].slice(
                    0,
                    chunk.maxv.blockPosition === chunk.minv.blockPosition
                        ? chunk.maxv.dataPosition - chunk.minv.dataPosition + 1
                        : chunk.maxv.dataPosition + 1
                );

                cpositions.push(cpos);
                dpositions.push(dpos);
                break;
            }
        } while (strm.avail_in);

        const buffer = Buffer.concat(decompressedBlocks);
        return { buffer, cpositions, dpositions };
    } catch (e) {
        if (e.message.match(/incorrect header check/)) {
            throw new Error('problem decompressing block: incorrect gzip header check');
        }
        throw e;
    }
}
