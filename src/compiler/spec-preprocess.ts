import type {
    SingleTrack,
    GoslingSpec,
    View,
    SingleView,
    Track,
    PartialTrack,
    CommonTrackDef,
    CommonViewDef,
    MultipleViews,
    DisplaceTransform
} from '@gosling-lang/gosling-schema';
import {
    IsSingleTrack,
    IsChannelDeep,
    IsFlatTracks,
    IsStackedTracks,
    Is2DTrack,
    IsDummyTrack,
    IsSingleView,
    IsOverlaidTracks
} from '@gosling-lang/gosling-schema';
import {
    DEFAULT_TRACK_HEIGHT_LINEAR,
    DEFAULT_TRACK_SIZE_2D,
    DEFAULT_TRACK_WIDTH_LINEAR,
    DEFAULT_VIEW_PROPERTIES
} from './defaults';
import { inheritStyle } from '../core/utils/style';
import { uuid } from '../core/utils/uuid';
import { pick } from 'lodash-es';

/**
 * Traverse individual tracks and call the callback function to read and/or update the track definition.
 * @param spec
 * @param callback
 */
export function traverseTracks(
    spec: GoslingSpec | View | PartialTrack,
    callback: (t: Partial<Track>, i: number, ts: Partial<Track>[]) => void
) {
    if ('tracks' in spec) {
        spec.tracks.forEach((t, i, ts) => {
            callback(t, i, ts);
            traverseTracks(t, callback);
        });
    } else if ('views' in spec) {
        spec.views.forEach(view => traverseTracks(view, callback));
    }
}

/**
 * Traverse individual tracks and views and call the callback function to read and/or update the common definition of views and tracks.
 * @param spec
 * @param callback
 */
export function traverseTracksAndViews(
    spec: GoslingSpec | View | PartialTrack,
    callback: (tv: CommonViewDef | CommonTrackDef) => void
) {
    if ('tracks' in spec) {
        spec.tracks.forEach(t => {
            callback(t);
            traverseTracksAndViews(t, callback);
        });
    } else if ('views' in spec) {
        spec.views.forEach(v => {
            callback(v);
            traverseTracksAndViews(v, callback);
        });
    }
}

/**
 * Traverse individual view arrangements and call the callback function to read and/or update the arrangement information.
 * @param spec
 * @param callback
 */
export function traverseViewArrangements(spec: GoslingSpec, callback: (tv: MultipleViews) => void) {
    if ('tracks' in spec) {
        // No need to do anything
    } else {
        callback(spec);
        spec.views.forEach(v => {
            traverseViewArrangements(v, callback);
        });
    }
}

/**
 * This convert the nested track definitions into a flat array.
 * @param spec
 */
export function convertToFlatTracks(spec: SingleView): Track[] {
    if (IsFlatTracks(spec)) {
        // This is already `FlatTracks`, so just override the view definition
        const base = { ...spec, tracks: undefined, id: undefined };
        return spec.tracks
            .filter(track => !track._invalidTrack)
            .map(track => Object.assign(JSON.parse(JSON.stringify(base)), track) as SingleTrack);
    }

    const newTracks: Track[] = [];
    if (IsStackedTracks(spec)) {
        spec.tracks
            .filter(track => !track._invalidTrack)
            .map(track => {
                if ('alignment' in track) {
                    // This is OverlaidTracks
                    newTracks.push({
                        ...track,
                        _overlay: [...track.tracks],
                        tracks: undefined,
                        alignment: undefined
                    } as Track);
                } else {
                    // Override track definitions from views
                    const base = { ...spec, tracks: undefined, id: undefined };
                    const newSpec = Object.assign(JSON.parse(JSON.stringify(base)), track) as SingleTrack;
                    newTracks.push(newSpec);
                }
            });
    } else {
        const overlays = [...spec.tracks.filter(track => !track._invalidTrack)];
        let newTrack = {
            ...spec,
            tracks: undefined,
            alignment: undefined
        } as any;
        if (overlays.length === 1) {
            // If there is only a single overlay, we just merge it with the track.
            newTrack = { ...newTrack, ...overlays[0] };
        } else {
            newTrack._overlay = overlays;
        }
        newTracks.push(newTrack as Track);
    }

    return JSON.parse(JSON.stringify(newTracks));
}

/**
 * TODO: The description will be revisited.
 * This function passes down properties from parents, so any missing values can be filled in.
 */
export function processGoslingSpec(spec: GoslingSpec | SingleView, parentDef?: CommonViewDef | MultipleViews) {
    // Property inheritance
    if (parentDef) {
        spec = Object.assign({}, pick(parentDef, Object.keys(DEFAULT_VIEW_PROPERTIES)), spec);
        spec.style = inheritStyle(parentDef.style, spec.style);
    }

    // Fill in defaults
    spec = Object.assign({ id: uuid() }, DEFAULT_VIEW_PROPERTIES, spec);

    // We are now going deeper...
    if (IsSingleView(spec)) {
        processSingleView(spec);
    } else {
        spec.views.forEach(view => processGoslingSpec(view, spec as CommonViewDef));
    }
}

export function expandTrackDisplacement(track: PartialTrack) {
    if ('displacement' in track) {
        if (
            track.displacement?.type === 'pile' &&
            track.row === undefined &&
            IsChannelDeep(track.x) &&
            track.x.field &&
            IsChannelDeep(track.xe) &&
            track.xe.field
            // Question: Should we consider mark types? (e.g., link might not be supported?)
        ) {
            const newField = uuid();
            const startField = track.x.field;
            const endField = track.xe.field;
            const padding = track.displacement.padding;
            const displaceTransform: DisplaceTransform = {
                type: 'displace',
                newField,
                boundingBox: { startField, endField, padding },
                method: 'pile'
            };

            // Add a data transform for stacking
            if (!track.dataTransform) {
                track.dataTransform = [];
            }
            track.dataTransform = [...track.dataTransform, displaceTransform];
            track.row = { field: newField, type: 'nominal' };
        } else if (track.displacement?.type === 'spread') {
            // ...
        }
    }
}

export function processSingleView(spec: SingleView) {
    // TODO: Implement the below in another place
    // let tracks: Track[] = convertToFlatTracks(spec);
    // !!! Be aware that this should be taken before fixing `overlayOnPreviousTrack` options.
    /**
     * Spread superposed tracks if they are assigned to different data spec.
     * This process is necessary since we are passing over each track to HiGlass, and if a track contain multiple datastes, HiGlass cannot handle that.
     */
    // tracks = spreadTracksByData(tracks);

    spec.tracks.forEach((track, i, array) => {
        // Properties that shouldn't be provided by users
        track.layout = undefined;
        track.zoomLimits = undefined;

        // Inherit properties
        track.style = inheritStyle(spec.style, track.style);
        track = Object.assign(
            { id: uuid() },
            {
                assembly: spec.assembly,
                zoomLimits: spec.zoomLimits,
                layout: spec.layout,
                orientation: spec.orientation,
                static: spec.static
            },
            track
        );

        if (Is2DTrack(track)) {
            track = Object.assign(
                {},
                {
                    width: DEFAULT_TRACK_SIZE_2D,
                    height: DEFAULT_TRACK_SIZE_2D
                },
                track
            );
        } else {
            track = Object.assign(
                {},
                {
                    width: DEFAULT_TRACK_WIDTH_LINEAR,
                    height: DEFAULT_TRACK_HEIGHT_LINEAR
                },
                track
            );
        }

        expandTrackDisplacement(track);

        /**
         * Unsupported Gosling spec
         */
        if (track.layout === 'circular' && IsDummyTrack(track)) {
            // Dummy track cannot have a circular layout
            track._invalidTrack = true;
            return;
        }

        // Override styles
        if (IsOverlaidTracks(track)) {
            // Remove the dummy tracks from an overlay track
            track.tracks = track.tracks.filter(overlaidTrack => {
                return !('type' in overlaidTrack && overlaidTrack.type == 'dummy-track');
            });
            // Reuse styles defined by parents
            track.tracks.forEach(o => {
                o.style = inheritStyle(track.style, o.style);
            });
        }

        /**
         * Orientation is only supported in 1D linear layouts
         */
        if ((track.layout === 'circular' || Is2DTrack(track)) && track.orientation === 'vertical') {
            track.orientation = 'horizontal';
        }

        /**
         * A track with 2D genomic coordinates is forced to use a linear layout
         */
        if (Is2DTrack(track)) {
            // TODO: Add a test for this.
            track.layout = 'linear';

            /**
             * Add y-axis domain
             */
            if ((IsSingleTrack(track) || IsOverlaidTrack(track)) && IsChannelDeep(track.y) && !track.y.domain) {
                track.y.domain = spec.yDomain;
            } else if (IsOverlaidTracks(track)) {
                track.tracks.forEach(o => {
                    if (IsChannelDeep(o.y) && !o.y.domain) {
                        o.y.domain = spec.yDomain;
                    }
                });
            }
        }

        /**
         * Add x-axis domain
         */
        if ((IsSingleTrack(track) || IsOverlaidTrack(track)) && IsChannelDeep(track.x) && !track.x.domain) {
            track.x.domain = spec.xDomain;
        } else if (IsOverlaidTrack(track)) {
            track._overlay.forEach(o => {
                if (IsChannelDeep(o.x) && !o.x.domain) {
                    o.x.domain = spec.xDomain;
                }
            });
        }

        /**
         * Link tracks in a single view
         */
        if ((IsSingleTrack(track) || IsOverlaidTrack(track)) && IsChannelDeep(track.x) && !track.x.linkingId) {
            track.x.linkingId = spec.linkingId;
        } else if (IsOverlaidTrack(track)) {
            let isAdded = false;
            track._overlay.forEach(o => {
                if (isAdded) return; // We want to add only once

                if (IsChannelDeep(o.x) && !o.x.linkingId) {
                    // TODO: Is this safe?
                    o.x.linkingId = spec.linkingId;
                    isAdded = true;
                }
            });
        }

        if (i === 0) {
            // There is no track to overlay on
            track.overlayOnPreviousTrack = false;
        }

        // This means this track is positioned on the top of a view
        if (
            i === 0 ||
            (i !== 0 &&
                tracks.slice(0, i).filter(d => !d.overlayOnPreviousTrack).length === 1 &&
                track.overlayOnPreviousTrack === true)
        ) {
            /**
             * Add axis to the first track, i.e., the track on the top, if undefined
             */
            if ((IsSingleTrack(track) || IsOverlaidTrack(track)) && IsChannelDeep(track.x) && !track.x.axis) {
                if (track.orientation === 'vertical') {
                    track.x.axis = 'left';
                } else {
                    track.x.axis = 'top';
                }
            } else if (IsOverlaidTrack(track)) {
                // let isNone = false; // If there is at least one 'none' axis, should not render axis.
                track._overlay.forEach(o => {
                    if (IsChannelDeep(o.x) && !o.x.axis) {
                        if (track.orientation === 'vertical') {
                            o.x.axis = 'left';
                        } else {
                            o.x.axis = 'top';
                        }
                    }
                    //  else if (IsChannelDeep(o.x) && o.x.axis === 'none') {
                    //     isNone = true;
                    // }
                });
            }
        }

        /*
         * Change axis positions considering the orientation.
         */
        if (
            (IsSingleTrack(track) || IsOverlaidTrack(track)) &&
            IsChannelDeep(track.x) &&
            track.x.axis &&
            track.x.axis !== 'none'
        ) {
            if (track.orientation === 'vertical') {
                if (track.x.axis === 'top') {
                    track.x.axis = 'left';
                } else if (track.x.axis === 'bottom') {
                    track.x.axis = 'right';
                }
            } else {
                if (track.x.axis === 'left') {
                    track.x.axis = 'top';
                } else if (track.x.axis === 'right') {
                    track.x.axis = 'bottom';
                }
            }
        } else if (IsOverlaidTrack(track)) {
            // let isNone = false; // If there is at least one 'none' axis, should not render axis.
            track._overlay.forEach(o => {
                if (IsChannelDeep(o.x) && o.x.axis && o.x.axis !== 'none') {
                    if (track.orientation === 'vertical') {
                        if (o.x.axis === 'top') {
                            o.x.axis = 'left';
                        } else if (o.x.axis === 'bottom') {
                            o.x.axis = 'right';
                        }
                    } else {
                        if (o.x.axis === 'left') {
                            o.x.axis = 'top';
                        } else if (o.x.axis === 'right') {
                            o.x.axis = 'bottom';
                        }
                    }
                }
                //  else if (IsChannelDeep(o.x) && o.x.axis === 'none') {
                //     isNone = true;
                // }
            });
        }

        /*
         * Flip y scale if the last track uses `link` marks
         */
        if (
            // first track can never flipped by default
            i !== 0 &&
            // [0, ..., i] tracks should not overlaid as a single track
            ((i === array.length - 1 && array.slice(0, i + 1).filter(d => d.overlayOnPreviousTrack).length < i) ||
                // Are the rest of the tracks overlaid as a single track?
                (i !== array.length - 1 &&
                    array.slice(i + 1).filter(d => d.overlayOnPreviousTrack).length === array.length - i - 1 &&
                    array.slice(0, i + 1).filter(d => d.overlayOnPreviousTrack).length < i))
        ) {
            if (IsSingleTrack(track) && track.mark === 'withinLink' && track.flipY === undefined) {
                track.flipY = true;
            } else if (IsOverlaidTrack(track)) {
                if (track.mark === 'withinLink' && track.flipY === undefined) {
                    track.flipY = true;
                }
                track._overlay.forEach(o => {
                    if (o.mark === 'withinLink' && o.flipY === undefined) {
                        o.flipY = true;
                    }
                });
            }
        }

        if (track.overlayOnPreviousTrack && array[i - 1]) {
            // Use the same size as the previous one
            track.width = array[i - 1].width;
            track.height = array[i - 1].height;

            track.layout = array[i - 1].layout;
            track.assembly = array[i - 1].assembly;
        }
    });
    // Filter out any invalid tracks
    tracks = tracks.filter(track => !track._invalidTrack);

    spec.tracks = tracks;
}
