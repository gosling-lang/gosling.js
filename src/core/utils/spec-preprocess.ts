import assign from 'lodash/assign';
import uuid from 'uuid';
import { SingleTrack, GoslingSpec, SingleView, Track, CommonViewDef, MultipleViews } from '../gosling.schema';
import {
    IsTemplate,
    IsDataDeepTileset,
    IsSingleTrack,
    IsChannelDeep,
    IsOverlaidTrack,
    IsFlatTracks,
    IsStackedTracks,
    Is2DTrack
} from '../gosling.schema.guards';
import {
    DEFAULT_INNER_RADIUS_PROP,
    DEFAULT_TRACK_HEIGHT_LINEAR,
    DEFAULT_TRACK_WIDTH_LINEAR,
    DEFAULT_VIEW_SPACING
} from '../layout/defaults';
import { spreadTracksByData } from './overlay';

/**
 * Traverse individual tracks and call the callback function to read and/or update the track definition.
 * @param spec
 * @param callback
 */
export function traverseTracks(
    spec: GoslingSpec,
    callback: (t: Partial<Track>, i: number, ts: Partial<Track>[]) => void
) {
    if ('tracks' in spec) {
        spec.tracks.forEach((...args) => callback(...args));
    } else {
        spec.views.forEach(view => traverseTracks(view, callback));
    }
}

/**
 * Traverse individual tracks and views and call the callback function to read and/or update the common definition of views and tracks.
 * @param spec
 * @param callback
 */
export function traverseTracksAndViews(spec: GoslingSpec, callback: (tv: CommonViewDef) => void) {
    if ('tracks' in spec) {
        spec.tracks.forEach(t => callback(t));
    } else {
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
        // This is already `FlatTracks`
        return spec.tracks;
    }

    const newTracks: Track[] = [];
    if (IsStackedTracks(spec)) {
        spec.tracks.map(track => {
            if ('alignment' in track) {
                // This is OverlaidTracks
                newTracks.push({
                    ...track,
                    overlay: [...track.tracks],
                    tracks: undefined,
                    alignment: undefined
                } as Track);
            } else {
                newTracks.push(track);
            }
        });
    } else {
        newTracks.push({ ...spec, overlay: [...spec.tracks], tracks: undefined, alignment: undefined } as Track);
    }

    return JSON.parse(JSON.stringify(newTracks));
}

/**
 * Traverse views and tracks to use parents's properties if missing.
 * @param spec
 * @param callback
 */
export function traverseToFixSpecDownstream(spec: GoslingSpec | SingleView, parentDef?: CommonViewDef | MultipleViews) {
    if (parentDef) {
        // For assembly and layout, we use the ones defiend by the parents if missing
        if (spec.assembly === undefined) spec.assembly = parentDef.assembly;
        if (spec.layout === undefined) spec.layout = parentDef.layout;
        if (spec.static === undefined) spec.static = parentDef.static !== undefined ? parentDef.static : false;
        if (spec.xDomain === undefined) spec.xDomain = parentDef.xDomain;
        if (spec.xLinkingId === undefined) spec.xLinkingId = parentDef.xLinkingId;
        if (spec.centerRadius === undefined) spec.centerRadius = parentDef.centerRadius;
        if (spec.spacing === undefined && !('tracks' in spec)) spec.spacing = parentDef.spacing;
        if ('views' in spec && 'arrangement' in parentDef && spec.arrangement === undefined)
            spec.arrangement = parentDef.arrangement;
    } else {
        // This means we are at the rool level, so assign default values if missing
        if (spec.assembly === undefined) spec.assembly = 'hg38';
        if (spec.layout === undefined) spec.layout = 'linear';
        if (spec.static === undefined) spec.static = false;
        if (spec.centerRadius === undefined) spec.centerRadius = DEFAULT_INNER_RADIUS_PROP;
        if (spec.spacing === undefined) spec.spacing = DEFAULT_VIEW_SPACING;
        if ('views' in spec && spec.arrangement === undefined) spec.arrangement = 'vertical';
        // Nothing to do when `xDomain` not suggested
        // Nothing to do when `xLinkID` not suggested
    }

    if ('tracks' in spec) {
        let tracks: Track[] = convertToFlatTracks(spec);

        // !!! TODO: (FOR THE RENDERING PERFORMANCE) We need to also combine overlaid tracks if they use identical data spec so that we have to load the data only once.
        // !!! Be aware that this should be taken before fixing `overlayOnPreviousTrack` options.
        /**
         * Spread superposed tracks if they are assigned to different data spec.
         * This process is necessary since we are passing over each track to HiGlass, and if a track contain multiple datastes, HiGlass cannot handle that.
         */
        tracks = spreadTracksByData(tracks);

        const linkID = uuid.v4();
        tracks.forEach((track, i, array) => {
            // If size not defined, set default ones
            if (!track.width) track.width = DEFAULT_TRACK_WIDTH_LINEAR;
            if (!track.height) track.height = DEFAULT_TRACK_HEIGHT_LINEAR;

            /*
             * Properties that shouldn't be suggested
             */
            if (track.layout) track.layout = undefined;

            /**
             * Override options received from the parent
             */
            if (!track.assembly) track.assembly = spec.assembly;
            if (!track.layout) track.layout = spec.layout;
            if (track.static === undefined) track.static = spec.static !== undefined ? spec.static : false;

            /**
             * A track with 2D genomic coordinates is forced to use a linear layout
             */
            if (Is2DTrack(track)) {
                // TODO: Add a test for this.
                track.layout = 'linear';
            }

            /**
             * Add x-axis domain
             */
            if ((IsSingleTrack(track) || IsOverlaidTrack(track)) && IsChannelDeep(track.x) && !track.x.domain) {
                track.x.domain = spec.xDomain;
            } else if (IsOverlaidTrack(track)) {
                track.overlay.forEach(o => {
                    if (IsChannelDeep(o.x) && !o.x.domain) {
                        o.x.domain = spec.xDomain;
                    }
                });
            }

            /**
             * Link tracks in a single view
             */
            if ((IsSingleTrack(track) || IsOverlaidTrack(track)) && IsChannelDeep(track.x) && !track.x.linkingId) {
                track.x.linkingId = spec.xLinkingId ?? linkID;
            } else if (IsOverlaidTrack(track)) {
                let isAdded = false;
                track.overlay.forEach(o => {
                    if (isAdded) return; // We want to add only once

                    if (IsChannelDeep(o.x) && !o.x.linkingId) {
                        // TODO: Is this safe?
                        o.x.linkingId = spec.xLinkingId ?? linkID;
                        isAdded = true;
                    }
                });
            }

            if (i === 0) {
                // There is no track to overlay on
                track.overlayOnPreviousTrack = false;

                /**
                 * Add axis to the first track
                 */
                if ((IsSingleTrack(track) || IsOverlaidTrack(track)) && IsChannelDeep(track.x) && !track.x.axis) {
                    track.x.axis = 'top';
                } else if (IsOverlaidTrack(track)) {
                    let isNone = false; // If there is at least one 'none' axis, should not render axis.
                    track.overlay.forEach(o => {
                        if (!isNone && IsChannelDeep(o.x) && !o.x.axis) {
                            o.x.axis = 'top';
                        } else if (IsChannelDeep(o.x) && o.x.axis === 'none') {
                            isNone = true;
                        }
                    });
                }
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
                if (IsSingleTrack(track) && track.mark === 'link' && track.flipY === undefined) {
                    track.flipY = true;
                } else if (IsOverlaidTrack(track)) {
                    if (track.mark === 'link' && track.flipY === undefined) {
                        track.flipY = true;
                    }
                    track.overlay.forEach(o => {
                        if (o.mark === 'link' && o.flipY === undefined) {
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

        spec.tracks = tracks;
    } else {
        // we did not reach track definition, so continue traversing
        spec.views.forEach(v => {
            traverseToFixSpecDownstream(v, spec as CommonViewDef);
        });
    }
}

/**
 * Get an encoding template for the `higlass-vector` data type.
 * @param column
 * @param value
 */
export function getVectorTemplate(column: string, value: string): SingleTrack {
    return {
        data: {
            type: 'vector',
            url: '',
            column,
            value
        },
        mark: 'bar',
        x: { field: column, type: 'genomic', axis: 'top' },
        y: { field: value, type: 'quantitative' },
        width: 400,
        height: 100
    };
}

export function getMultivecTemplate(
    row: string,
    column: string,
    value: string,
    categories: string[] | undefined
): SingleTrack {
    return categories && categories.length < 10
        ? {
              data: {
                  type: 'multivec',
                  url: '',
                  row,
                  column,
                  value,
                  categories
              },
              mark: 'bar',
              x: { field: column, type: 'genomic', axis: 'top' },
              y: { field: value, type: 'quantitative' },
              row: { field: row, type: 'nominal', legend: true },
              color: { field: row, type: 'nominal' },
              width: 400,
              height: 100
          }
        : {
              data: {
                  type: 'multivec',
                  url: '',
                  row,
                  column,
                  value,
                  categories
              },
              mark: 'rect',
              x: { field: column, type: 'genomic', axis: 'top' },
              row: { field: row, type: 'nominal', legend: true },
              color: { field: value, type: 'quantitative' },
              width: 400,
              height: 100
          };
}

/**
 * Override default visual encoding in each track for given data type.
 * @param spec
 */
export function overrideTemplates(spec: GoslingSpec) {
    traverseTracks(spec, (t, i, ts) => {
        if (!t.data || !IsDataDeepTileset(t.data)) {
            // if `data` is not specified, we can not provide a correct template.
            return;
        }

        if ('alignment' in t) {
            // This is an OverlaidTracks, so skip this.
            return;
        }

        if (!IsTemplate(t)) {
            // This is not partial specification that we need to use templates
            return;
        }

        switch (t.data.type) {
            case 'vector':
            case 'bigwig':
                ts[i] = assign(getVectorTemplate(t.data.column, t.data.value), t);
                break;
            case 'multivec':
                ts[i] = assign(getMultivecTemplate(t.data.row, t.data.column, t.data.value, t.data.categories), t);
                break;
        }
    });
}
