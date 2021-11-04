import { AxisPosition, Encoding, SingleTrack, OverlaidTrack, Track, ChannelDeep, DataDeep } from '../gosling.schema';
import { assign } from 'lodash-es';
import { IsChannelDeep, IsDataTrack, IsOverlaidTrack, IsSingleTrack } from '../gosling.schema.guards';

/**
 * Resolve superposed tracks into multiple track specifications.
 * Some options are corrected to ensure the resolved tracks use consistent visual properties, such as the existence of the axis for genomic coordinates.
 */
export function resolveSuperposedTracks(track: Track): SingleTrack[] {
    if (IsDataTrack(track)) {
        // no BasicSingleTrack to return
        return []; // TODO: handle TemplateTrack
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
    delete (base as Partial<OverlaidTrack>).overlay; // remove `overlay` from the base spec

    const resolved: SingleTrack[] = [];
    track.overlay.forEach((subSpec, i) => {
        const encoding = assign(JSON.parse(JSON.stringify(base.encoding ?? {})), subSpec.encoding ?? {}) as Encoding;
        const spec = assign(JSON.parse(JSON.stringify(base)), subSpec) as SingleTrack;
        spec.encoding = encoding;
        if (spec.title && i !== 0) {
            delete spec.title;
        }
        resolved.push(spec);
    });

    /* Correct the spec for consistency */
    // x-axis
    let xAxisPosition: undefined | AxisPosition = undefined;
    resolved.forEach(d => {
        if (IsChannelDeep(d.encoding.x) && d.encoding.x.axis && !xAxisPosition) {
            xAxisPosition = d.encoding.x.axis;
        }
    });

    const corrected = resolved.map(d => {
        return {
            ...d,
            x: { ...d.encoding.x, axis: xAxisPosition }
        } as SingleTrack;
    });

    // height
    // ...

    return corrected;
}

/**
 * Spread overlaid tracks if they are assigned to different data/metadata.
 * This process is necessary since we are passing over each track to HiGlass, and if a single track is mapped to multiple datastes, HiGlass cannot handle that.
 */
export function spreadTracksByData(tracks: Track[]): Track[] {
    return ([] as Track[]).concat(
        ...tracks.map(t => {
            if (!IsOverlaidTrack(t) || t.overlay.length <= 1) {
                // no overlaid tracks to spread
                return [t];
            }

            if (t.overlay.filter(s => s.data).length === 0) {
                // overlaid tracks use the parent's data specs as it w/o re-specification, so no point to spread.
                return [t];
            }

            if (isIdenticalDataSpec([t.data, ...t.overlay.map(s => s.data)])) {
                // individual overlaid tracks define the same data, so no point to spread.
                return [t];
            }

            const base: SingleTrack = JSON.parse(JSON.stringify(t));
            delete (base as Partial<OverlaidTrack>).overlay; // remove `overlay` from the base spec

            const spread: Track[] = [];
            const original: OverlaidTrack = JSON.parse(JSON.stringify(base));
            original.overlay = [];

            t.overlay.forEach(subSpec => {
                // If data specs are undefined, put the first spec to the parent
                if (!original.data) {
                    original.data = subSpec.data;
                }

                // Determine if this `subSpec` should be added to `overlay` or become a separate track
                if (!subSpec.data || isIdenticalDataSpec([original.data, subSpec.data])) {
                    original.overlay.push(subSpec);
                    return;
                }

                const spec = assign(JSON.parse(JSON.stringify(base)), subSpec) as SingleTrack;
                spread.push(spec);
            });

            const output = original.overlay.length > 0 ? [original, ...spread] : spread;
            return output.map((track, i, arr) => {
                const overlayOnPreviousTrack = i !== 0;

                // Y axis should be positioned on the right or hidden if multiple tracks are overlaid to prevent visual occlussion.
                // Refer to this issue: https://github.com/gosling-lang/gosling.js/issues/400
                const y =
                    IsSingleTrack(track) &&
                    IsChannelDeep(track.encoding.y) &&
                    !track.encoding.y.axis &&
                    overlayOnPreviousTrack
                        ? ({ ...track.encoding.y, axis: i === 1 ? 'right' : 'none' } as ChannelDeep)
                        : IsSingleTrack(track)
                        ? track.encoding.y
                        : undefined;

                if (track.title && i !== arr.length - 1 && arr.length !== 1) {
                    delete track.title; // remove `title` except the last one
                }
                return { ...track, overlayOnPreviousTrack, encoding: { ...track.encoding, y } } as Track;
            });
        })
    );
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
