import { GLYPH_LOCAL_PRESET_TYPES, GLYPH_PRESETS } from '../../editor/example/deprecated/index';
import { GeminidSpec, Mark } from '../geminid.schema';
import { IsSingleTrack, IsMarkDeep } from '../geminid.schema.guards';

export function replaceTemplate(spec: GeminidSpec): GeminidSpec {
    spec.tracks?.forEach(track => {
        if (IsSingleTrack(track) && IsMarkDeep(track.mark)) {
            const predefinedTemplate = track.mark.type;
            if (GLYPH_LOCAL_PRESET_TYPES.includes(predefinedTemplate as any)) {
                track.mark = GLYPH_PRESETS.find(d => d.name === predefinedTemplate)?.mark as Mark;
            }
        }
    });
    return spec;
}

export function validTilesetUrl(url: string) {
    if (!url.includes('tileset_info/?d=') || (!url.includes('https:') && !url.includes('http:'))) {
        return false;
    }
    return true;
}

export function parseServerAndTilesetUidFromUrl(url: string) {
    if (!url.includes('tileset_info/?d=') || (!url.includes('https:') && !url.includes('http:'))) {
        // TODO: Add regular expression to validate the format.
        console.warn(`Data url format is incorrect:${url}`);
        return { server: undefined, tilesetUid: undefined };
    }

    const server = url.split('tileset_info/?d=')[0];
    const tilesetUid = url.split('tileset_info/?d=')[1];
    return { server, tilesetUid };
}
