export * from './array';
export * from './assembly';
export * from './bounding-box';
export * from './chrom-size';
export * from './color-to-hex';
export * from './data-transform';
export * from './linking';
export * from './log';
export * from './omit-deep';
export * from './overlay';
export * from './polar';
export * from './position';
export * from './scalable-rendering';
export * from './scales';
export * from './semantic-zoom';
export * from './spec-preprocess';
export * from './style';
export * from './template';
export * from './text-style';
export * from './validate';
export * from './view-config';

export function validTilesetUrl(url: string) {
    if (!url.includes('tileset_info/?d=') || (!url.includes('https:') && !url.includes('http:'))) {
        return false;
    }
    return true;
}

export function parseServerAndTilesetUidFromUrl(url: string) {
    if (!url.includes('tileset_info/?d=') || (!url.includes('https:') && !url.includes('http:'))) {
        // TODO: Add regular expression to validate the format.
        // console.warn(`Data url format is incorrect:${url}`);
        return { server: undefined, tilesetUid: undefined };
    }

    const server = url.split('tileset_info/?d=')[0];
    const tilesetUid = url.split('tileset_info/?d=')[1];
    return { server, tilesetUid };
}
