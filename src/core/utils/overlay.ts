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
