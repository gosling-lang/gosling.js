// For GMOD/bbi-js
// ref: https://github.com/GMOD/bbi-js/blob/891dbf9a422cb680f2b88ba605f30c9c5ad90dfa/src/blockView.ts#L387
import { Buffer } from 'buffer';
import { unzlibSync } from 'fflate';

// https://github.com/vitejs/vite/blob/b9e837a2aa2c1a7a8f93d4b19df9f72fd3c6fb09/packages/vite/src/node/plugins/resolve.ts#L285-L291
// Just polyfills zlib.inflateSync for the browser.
export function inflateSync(src: Uint8Array) {
    return Buffer.from(unzlibSync(src));
}

export default { inflateSync };
