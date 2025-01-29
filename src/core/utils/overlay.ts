import type { AxisPosition, LeafTrack, DataDeep, OverlaidTracks, StackedTracks } from '@gosling-lang/gosling-schema';
import { IsChannelDeep, IsDummyTrack, IsTemplateTrack, isOverlaidTracks } from '@gosling-lang/gosling-schema';
import type { ProcessedTrack } from 'demo/track-def/types';

/**
 * Resolve superposed tracks into multiple track specifications.
 * Some options are corrected to ensure the resolved tracks use consistent visual properties, such as the existence of the axis for genomic coordinates.
 */
export function expandOverlaidTracks(track: LeafTrack | OverlaidTracks | StackedTracks): LeafTrack[] {
    if (IsTemplateTrack(track) || IsDummyTrack(track)) {
        // no BasicSingleTrack to return
        return [];
    }

    if (!('tracks' in track) || track.tracks.length === 0) {
        return [{ ...track } as LeafTrack];
    }

    const base: LeafTrack = JSON.parse(JSON.stringify(track));
    delete (base as Partial<OverlaidTracks>)._overlay; // remove `superpose` from the base spec

    const resolved: LeafTrack[] = [];
    track._overlay.forEach((subSpec, i) => {
        const spec = Object.assign(JSON.parse(JSON.stringify(base)), subSpec) as LeafTrack;
        if (spec.title && i !== 0) {
            delete spec.title;
        }
        resolved.push(spec);
    });

    // Correct the spec for consistency
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
        } as ProcessedTrack;
    });

    // height
    // ...

    return corrected;
}

/**
 * Spread overlaid tracks if they are assigned to different data/metadata.
 * This process is necessary since we are passing over each track to HiGlass, and if a single track is mapped to multiple datastes, HiGlass cannot handle that.
 */
/*
export function spreadTracksByData(tracks: Track[]): Track[] {
    return ([] as Track[]).concat(
        ...tracks.map(t => {
            if (!IsOverlaidTrack(t) || t._overlay.length <= 1) {
                // no overlaid tracks to spread
                return [t];
            }

            if (t._overlay.filter(s => s.data).length === 0) {
                // overlaid tracks use the parent's data specs as it w/o re-specification, so no point to spread.
                return [t];
            }

            if (isIdenticalDataSpec([t.data, ...t._overlay.map(s => s.data)])) {
                // individual overlaid tracks define the same data, so no point to spread.
                return [t];
            }

            const base: Partial<OverlaidTrack> = { ...t, id: undefined, _overlay: undefined };
            const spread: Track[] = [];
            const original: OverlaidTrack = JSON.parse(JSON.stringify(base));
            original._overlay = [];

            t._overlay.forEach(subSpec => {
                // If data specs are undefined, put the first spec to the parent
                if (!original.data) {
                    original.data = subSpec.data;
                }

                // If the id is undefined, put the first spec to the parent
                if (!original.id) {
                    original.id = subSpec.id;
                }

                // Determine if this `subSpec` should be added to `overlay` or become a separate track
                if (!subSpec.data || isIdenticalDataSpec([original.data, subSpec.data])) {
                    original._overlay.push(subSpec);
                    return;
                }

                const spec = Object.assign(JSON.parse(JSON.stringify(base)), subSpec) as SingleTrack;
                spread.push(spec);
            });

            const output = original._overlay.length > 0 ? [original, ...spread] : spread;
            return output.map((track, i, arr) => {
                const overlayOnPreviousTrack = i !== 0;

                // Y axis should be positioned on the right or hidden if multiple tracks are overlaid to prevent visual occlussion.
                // Refer to this issue: https://github.com/gosling-lang/gosling.js/issues/400
                const y =
                    IsSingleTrack(track) && IsChannelDeep(track.y) && !track.y.axis && overlayOnPreviousTrack
                        ? ({ ...track.y, axis: i === 1 ? 'right' : 'none' } as ChannelDeep)
                        : IsSingleTrack(track)
                            ? track.y
                            : undefined;

                if (track.title && i !== arr.length - 1 && arr.length !== 1) {
                    delete track.title; // remove `title` except the last one
                }
                return { ...track, overlayOnPreviousTrack, y } as Track;
            });
        })
    );
}
*/
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
