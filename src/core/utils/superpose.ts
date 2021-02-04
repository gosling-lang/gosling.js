import { AxisPosition, BasicSingleTrack, SuperposedTrack, Track } from '../gosling.schema';
import assign from 'lodash/assign';
import { IsChannelDeep, IsDataTrack, IsSuperposedTrack } from '../gosling.schema.guards';

/**
 * Resolve superposed tracks into multiple track specifications.
 * Some options are corrected to ensure the resolved tracks use consistent visual properties, such as the existence of the axis for genomic coordinates.
 */
export function resolveSuperposedTracks(track: Track): BasicSingleTrack[] {
    if (IsDataTrack(track)) {
        // no BasicSingleTrack to return
        return [];
    }

    if (!IsSuperposedTrack(track)) {
        // no `superpose` to resolve
        return [track];
    }

    if (track.superpose.length === 0) {
        // This makes sure not to return empty object
        return [{ ...track, superpose: undefined } as BasicSingleTrack];
    }

    const base: BasicSingleTrack = JSON.parse(JSON.stringify(track));
    delete (base as Partial<SuperposedTrack>).superpose; // remove `superpose` from the base spec

    const resolved: BasicSingleTrack[] = [];
    track.superpose.forEach((subSpec, i) => {
        const spec = assign(JSON.parse(JSON.stringify(base)), subSpec) as BasicSingleTrack;
        if (spec.title && i !== 0) {
            // !!! This part should be consistent to `spreadTracksByData` defined on the bottom of this file
            delete spec.title; // remove `title` for the rest of the superposed tracks
        }
        resolved.push(spec);
    });

    /* Correct the spec for consistency */
    // x-axis
    let xAxisPosition: undefined | AxisPosition = undefined;
    resolved.forEach(d => {
        if (IsChannelDeep(d.x) && d.x.axis && !xAxisPosition) {
            xAxisPosition = d.x.axis;
        }
    });

    const corrected = resolved.map(d => {
        return {
            ...d,
            x: { ...d.x, axis: xAxisPosition }
        } as BasicSingleTrack;
    });

    // height
    // ...

    return corrected;
}

// !!! For the rendering performance, we need to keep tracks in a single track by superposing them as much as we can so that same data will not be loaded duplicately.
/**
 * Spread superposed tracks if they are assigned to different data/metadata.
 * This process is necessary since we are passing over each track to HiGlass, and if a single track is mapped to multiple datastes, HiGlass cannot handle that.
 */
export function spreadTracksByData(tracks: Track[]): Track[] {
    return ([] as Track[]).concat(
        ...tracks.map(t => {
            if (IsDataTrack(t) || !IsSuperposedTrack(t) || t.superpose.length <= 1) {
                // no superposed tracks to spread
                return [t];
            }

            if (t.superpose.filter(s => s.data || s.metadata).length === 0) {
                // superposed tracks use the same data and metadata, so no point to spread.
                return [t];
            }

            const base: BasicSingleTrack = JSON.parse(JSON.stringify(t));
            delete (base as Partial<SuperposedTrack>).superpose; // remove `superpose` from the base spec

            const spread: Track[] = [];
            const original: SuperposedTrack = JSON.parse(JSON.stringify(base));
            original.superpose = [];

            // TODO: This is a very naive apporach, and we can do better!
            t.superpose.forEach((subSpec, i) => {
                if (!subSpec.metadata && !subSpec.data) {
                    // Neither metadata nor data is used, so just put that into the original `superpose` option.
                    original.superpose.push(subSpec);
                    return;
                }

                const spec = assign(JSON.parse(JSON.stringify(base)), subSpec) as BasicSingleTrack;
                if (spec.title && i !== 0) {
                    // !!! This part should be consistent to `resolveSuperposedTracks` defined on the top of this file
                    delete spec.title; // remove `title` for the rest of the superposed tracks
                }
                spec.superposeOnPreviousTrack = true;
                spread.push(spec);
            });

            // !!! Order is important here because `spead` tracks will have `superposeOnPreviousTrack` flags, and they do not want to be superposed on top of non-related one.
            return [original, ...spread];
        })
    );
}
