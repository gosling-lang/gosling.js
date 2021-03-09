import { AxisPosition, SingleTrack, OverlaidTrack, Track } from '../gosling.schema';
import assign from 'lodash/assign';
import { IsChannelDeep, IsDataTrack, IsOverlaidTrack } from '../gosling.schema.guards';

/**
 * Resolve superposed tracks into multiple track specifications.
 * Some options are corrected to ensure the resolved tracks use consistent visual properties, such as the existence of the axis for genomic coordinates.
 */
export function resolveSuperposedTracks(track: Track): SingleTrack[] {
    if (IsDataTrack(track)) {
        // no BasicSingleTrack to return
        return [];
    }

    if (!IsOverlaidTrack(track)) {
        // no `superpose` to resolve
        return [track];
    }

    if (track.overlay.length === 0) {
        // This makes sure not to return empty object
        return [{ ...track, superpose: undefined } as SingleTrack];
    }

    const base: SingleTrack = JSON.parse(JSON.stringify(track));
    delete (base as Partial<OverlaidTrack>).overlay; // remove `superpose` from the base spec

    const resolved: SingleTrack[] = [];
    track.overlay.forEach((subSpec, i) => {
        const spec = assign(JSON.parse(JSON.stringify(base)), subSpec) as SingleTrack;
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
        } as SingleTrack;
    });

    // height
    // ...

    return corrected;
}

// !!! For the rendering performance, we need to keep tracks in a single track by superposing them as much as we can so that same data will not be loaded duplicately.
/**
 * Spread overlaid tracks if they are assigned to different data/metadata.
 * This process is necessary since we are passing over each track to HiGlass, and if a single track is mapped to multiple datastes, HiGlass cannot handle that.
 */
export function spreadTracksByData(tracks: Track[]): Track[] {
    return ([] as Track[]).concat(
        ...tracks.map(t => {
            if (IsDataTrack(t) || !IsOverlaidTrack(t) || t.overlay.length <= 1) {
                // no overlaid tracks to spread
                return [t];
            }

            if (t.overlay.filter(s => s.data).length === 0) {
                // overlaid tracks use the same data, so no point to spread.
                return [t];
            }

            const base: SingleTrack = JSON.parse(JSON.stringify(t));
            delete (base as Partial<OverlaidTrack>).overlay; // remove `overlay` from the base spec

            const spread: Track[] = [];
            const original: OverlaidTrack = JSON.parse(JSON.stringify(base));
            original.overlay = [];

            // TODO: This is a very naive apporach, and we can do better!
            t.overlay.forEach((subSpec, i) => {
                if (!subSpec.data) {
                    // No `data` is used, so just put that into the original `overlay` option.
                    original.overlay.push(subSpec);
                    return;
                }

                const spec = assign(JSON.parse(JSON.stringify(base)), subSpec) as SingleTrack;
                if (spec.title && i !== 0) {
                    // !!! This part should be consistent to `resolveSuperposedTracks` defined on the top of this file
                    delete spec.title; // remove `title` for the rest of the superposed tracks
                }
                spread.push(spec);
            });

            const output = original.overlay.length > 0 ? [original, ...spread] : spread;
            return output.map((track, i) => {
                return { ...track, overlayOnPreviousTrack: i !== 0 };
            });
        })
    );
}
