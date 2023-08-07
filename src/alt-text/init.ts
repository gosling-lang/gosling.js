import type { GoslingSpec, Datum } from '../core/gosling.schema';
import type {  AltGoslingSpec, AltTrack } from './alt-gosling-schema';
import { getAltSpec } from './alt-from-spec';
import { addDescriptions } from './alt-to-text';
import { altUpdateSpecWithData } from './alt-from-data';


export function getAlt(
    specTraversed: GoslingSpec,
    specOriginal: GoslingSpec
): AltGoslingSpec {
    console.log(specTraversed)

    // get altSpec
    const altSpec = getAltSpec(specTraversed) as AltGoslingSpec;

    // add descriptions
    addDescriptions(altSpec)

    console.log(altSpec);

    return altSpec;
}

export function updateAlt(
    altGoslingSpec: AltGoslingSpec, 
    id: string, 
    flatTileData: Datum[]
): AltGoslingSpec {
    return altUpdateSpecWithData(altGoslingSpec, id, flatTileData);
}