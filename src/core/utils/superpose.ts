import { AxisPosition, BasicSingleTrack, SingleTrack, SuperposedTrack, Track } from '../../core/gemini.schema';
import assign from 'lodash/assign';
import { IsChannelDeep, IsSuperposedTrack } from '../gemini.schema.guards';

/**
 * Resolve superposed tracks into multiple track specifications.
 * Some options are corrected to ensure the resolved tracks use consistent visual properties, such as the existence of the axis for genomic coordinates.
 */
export function resolveSuperposedTracks(track: Track): SingleTrack[] {
    if (!IsSuperposedTrack(track)) {
        // no `superpose` to resolve
        return [track];
    }

    const base: SingleTrack = JSON.parse(JSON.stringify(track));
    delete (base as Partial<SuperposedTrack>).superpose; // remove `superpose` from the base spec

    const resolved: SingleTrack[] = [];
    track.superpose.forEach((subSpec, i) => {
        const spec = assign(JSON.parse(JSON.stringify(base)), subSpec) as BasicSingleTrack;
        if (spec.title && i !== 0) {
            delete spec.title; // remove `title` for the rest of the superposed tracks
        }
        resolved.push(spec);
    });

    /* Correct spec for consistency */
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
