import { parseServerAndTilesetUidFromUrl } from '../../../src/core/utils';

describe('Parse tileset url correctly', () => {
    it('Tilesets', () => {
        const { server, tilesetUid } = parseServerAndTilesetUidFromUrl('https://S/tileset_info/?d=T');
        expect(server).toEqual('https://S/');
        expect(tilesetUid).toEqual('T');

        expect(parseServerAndTilesetUidFromUrl('random text').server).toBeUndefined();
    });
});
