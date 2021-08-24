import {
    AxisPosition,
    SingleTrack,
    OverlaidTrack,
    Track,
    ChannelDeep,
    DataDeep,
    DataTransform
} from '../gosling.schema';
import assign from 'lodash/assign';
import { IsChannelDeep, IsDataTrack, IsOverlaidTrack, IsSingleTrack } from '../gosling.schema.guards';

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

export function isIdenticalDataSpec(specs: (DataDeep | undefined)[]): boolean {
    if (specs.length === 0) {
        return false;
    }

    const definedSpecs = specs.filter(d => d) as DataDeep[];

    if (definedSpecs.length !== specs.length) {
        return false;
    }

    // Iterate keys to check if these are identical
    const keys = Object.keys(definedSpecs[0]).sort();
    let isIdentical = true;
    keys.forEach(k => {
        const uniqueProperties = Array.from(new Set(definedSpecs.map(d => JSON.stringify((d as any)[k]))));
        if (uniqueProperties.length !== 1) {
            isIdentical = false;
            return;
        }
    });
    return isIdentical;
}

export function isIdenticalDataTransformSpec(specs: (DataTransform[] | undefined)[]): boolean {
    if (specs.length === 0) {
        return false;
    }

    const definedSpecs = specs.filter(d => d) as DataTransform[][];

    if (definedSpecs.length !== specs.length) {
        return false;
    }

    if (Array.from(new Set(definedSpecs.map(d => d.length))).length !== 1) {
        // the length is different, so return early
        return false;
    }

    // Iterate keys to check if these are identical
    let isIdentical = true;
    definedSpecs[0].forEach((dt, i) => {
        const keys = Object.keys(dt).sort();
        keys.forEach(k => {
            const uniqueProperties = Array.from(new Set(definedSpecs.map(d => JSON.stringify((d[i] as any)[k]))));
            if (uniqueProperties.length !== 1) {
                isIdentical = false;
                return;
            }
        });
    });
    return isIdentical;
}

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

            if (t.overlay.filter(s => s.data).length === 0 && t.overlay.filter(s => s.dataTransform).length === 0) {
                // overlaid tracks use the same data/dataTransform from the parent, so no point to spread.
                return [t];
            }

            if (
                isIdenticalDataSpec(t.overlay.map(s => s.data)) &&
                isIdenticalDataTransformSpec(t.overlay.map(s => s.dataTransform))
            ) {
                // individual overlaid tracks define the same data, so no point to spread.
                return [t];
            }

            const base: SingleTrack = JSON.parse(JSON.stringify(t));
            delete (base as Partial<OverlaidTrack>).overlay; // remove `overlay` from the base spec

            const spread: Track[] = [];
            const original: OverlaidTrack = JSON.parse(JSON.stringify(base));
            original.overlay = [];

            t.overlay.forEach((subSpec, i) => {
                // If data specs are undefined, put the first spec to the parent
                if (!t.data) {
                    t.data = subSpec.data;
                }
                if (!t.dataTransform) {
                    t.dataTransform = subSpec.dataTransform;
                }

                // Determine if this `subSpec` should be added to `overlay` or become a separate track
                if (
                    (!t.data || !subSpec.data || isIdenticalDataSpec([t.data, subSpec.data])) &&
                    (!t.dataTransform ||
                        !subSpec.dataTransform ||
                        isIdenticalDataTransformSpec([t.dataTransform, subSpec.dataTransform]))
                ) {
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
                const overlayOnPreviousTrack = i !== 0;

                // Y axis should be positioned on the right or hidden if multiple tracks are overlaid to prevent visual occlussion.
                // Refer to this issue: https://github.com/gosling-lang/gosling.js/issues/400
                const y =
                    IsSingleTrack(track) && IsChannelDeep(track.y) && !track.y.axis && overlayOnPreviousTrack
                        ? ({ ...track.y, axis: i === 1 ? 'right' : 'none' } as ChannelDeep)
                        : IsSingleTrack(track)
                        ? track.y
                        : undefined;

                return { ...track, overlayOnPreviousTrack, y };
            });
        })
    );
}
