import type { GoslingSpec } from '../core/gosling.schema';
import type {  AltGoslingSpec, AltTrack } from './alt-gosling-schema';
import { getAltSpec } from './alt-from-spec';
import { addDescriptions } from './alt-to-text';


export function getAlt(
    specTraversed: GoslingSpec,
    specOriginal: GoslingSpec
): string {
    console.log(specTraversed)

    // get altSpec
    const altSpec = getAltSpec(specTraversed) as AltGoslingSpec;

    // add descriptions
    addDescriptions(altSpec)

    console.log(altSpec);

    return 'hello';
}
