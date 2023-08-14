import type { CommonTrackDef, CommonViewDef, GoslingSpec, PartialTrack, View } from '@gosling-lang/gosling-schema';
import { traverseTracksAndViews } from '../compiler/spec-preprocess';

/**
 * A table that maps Gosling track IDs to HiGlass view IDs.
 */
export type IdTable = Record<string, string>;

/**
 * Manage IDs of Gosling tracks and compiled HiGlass views.
 * The HiGlass view IDs correspond to the "UIDs" of HiGlass *views*,
 * which are used for calling HiGlass APIs internally in Gosling.js.
 * It is 1:1 or N:1 mapping between Gosling tracks IDs and HiGlass views IDs.
 * https://docs.higlass.io/view_config.html#uids
 */
export class GoslingToHiGlassIdMapper {
    /** A mapping table between Gosling track IDs to HiGlass view IDs */
    #table: IdTable = {};

    addMapping(gtId: string, hvId: string) {
        if (this.#table[gtId] && this.#table[gtId] !== hvId) {
            console.warn(`The track ID ${gtId} already exists but overwriting with a different ID.`);
        }
        this.#table[gtId] = hvId;
    }
    getTable() {
        return this.#table;
    }
    getGoslingIds() {
        return Object.keys(this.#table);
    }
    getHiGlassId(gtId: string) {
        return this.#table[gtId];
    }
    /**
     * Get IDs of Gosling tracks that became the same HiGlass view.
     * @param HiGlassId
     * @returns
     */
    getSiblingGoslingIds(HiGlassId: string) {
        return Object.entries(this.#table)
            .filter(([, hvId]) => hvId === HiGlassId)
            .map(([gtId]) => gtId);
    }
}

/**
 * Find all unique IDs of 'views' in a Gosling spec and return them as an array.
 * @param spec
 * @returns
 */
export function getViewIds(spec: GoslingSpec | View | PartialTrack) {
    const viewIds = new Set<string>();
    if (spec.id) {
        // root view
        viewIds.add(spec.id);
    }
    traverseTracksAndViews(spec, subSpec => {
        if ('views' in subSpec || 'tracks' in subSpec) {
            // encountered a view
            if (subSpec.id) {
                // found a valid view id
                viewIds.add(subSpec.id);
            }
        }
    });
    return Array.from(viewIds);
}

/**
 * Find all unique IDs of 'tracks' in a Gosling spec and return them as an array.
 * @param spec
 * @returns
 */
export function getTrackIds(spec: GoslingSpec | View | PartialTrack) {
    const trackIds = new Set<string>();
    traverseTracksAndViews(spec, subSpec => {
        if (!('views' in subSpec) && !('tracks' in subSpec)) {
            // encountered a track
            if (subSpec.id) {
                // found a valid track id
                trackIds.add(subSpec.id);
            }
        }
    });
    return Array.from(trackIds);
}

/**
 * Get an internal spec using an ID of a track or a view. `undefined` if unfound.
 * @param spec
 * @returns
 */
export function getInternalSpecById(spec: GoslingSpec | View | PartialTrack, id: string) {
    let internalSpec: CommonViewDef | CommonTrackDef | undefined;
    if (spec.id === id) {
        // root view
        internalSpec = spec;
    }
    traverseTracksAndViews(spec, subSpec => {
        if (subSpec.id === id) {
            internalSpec = subSpec;
        }
    });
    return internalSpec;
}
