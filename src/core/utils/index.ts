import Ajv from 'ajv';
import { GLYPH_LOCAL_PRESET_TYPES, GLYPH_PRESETS } from '../../editor/example/deprecated/index';
import { GeminiSpec, Mark, IsMarkDeep, IsSingleTrack } from '../gemini.schema';

export function replaceTemplate(spec: GeminiSpec): GeminiSpec {
    spec.tracks.forEach(track => {
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

export function validateHG(hg: any): boolean {
    const validate = new Ajv({ extendRefs: true }).compile({
        /*  */
    });
    const valid = validate(hg);

    if (validate.errors) {
        console.warn(JSON.stringify(validate.errors, null, 2));
    }

    // TODO: check types such as default values and locationLocks

    return valid as boolean;
}
