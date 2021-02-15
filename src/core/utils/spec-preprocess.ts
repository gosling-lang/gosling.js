import assign from 'lodash/assign';
import uuid from 'uuid';
import { SingleTrack, GoslingSpec, View, Track, CommonViewDef, ArrangedViews } from '../gosling.schema';
import {
    IsTemplate,
    IsDataDeepTileset,
    IsSingleTrack,
    IsChannelDeep,
    IsOverlaidTrack,
    getArrangedViews
} from '../gosling.schema.guards';
import { DEFAULT_INNER_HOLE_PROP, DEFAULT_TRACK_HEIGHT_LINEAR, DEFAULT_TRACK_WIDTH_LINEAR } from '../layout/defaults';
import { spreadTracksByData } from './overlay';

/**
 * Traverse individual tracks and call the callback function to read and/or update the track definition.
 * @param spec
 * @param callback
 */
export function traverseTracks(spec: GoslingSpec, callback: (t: Track, i: number, ts: Track[]) => void) {
    if ('tracks' in spec) {
        spec.tracks.forEach((...args) => callback(...args));
    } else {
        getArrangedViews(spec).forEach(view => traverseTracks(view, callback));
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
        getArrangedViews(spec).forEach(v => {
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
export function traverseViewArrangements(spec: GoslingSpec, callback: (tv: ArrangedViews) => void) {
    if ('tracks' in spec) {
        // No need to do anything
    } else {
        callback(spec);
        getArrangedViews(spec).forEach(v => {
            traverseViewArrangements(v, callback);
        });
    }
}

// TODO: Many parts are repeatedly used here. Lets' do this in a cleaner way.
/**
 * Traverse views and tracks to use parents's properties if missing.
 * @param spec
 * @param callback
 */
export function traverseToFixSpecDownstream(spec: GoslingSpec | View, parentDef?: CommonViewDef) {
    if (parentDef) {
        // For assembly and layout, we use the ones defiend by the parents if missing
        if (spec.assembly === undefined) spec.assembly = parentDef.assembly;
        if (spec.layout === undefined) spec.layout = parentDef.layout;
        if (spec.static === undefined)
            spec.static = spec.layout === 'circular' ? true : parentDef.static !== undefined ? parentDef.static : false;
        if (spec.xDomain === undefined) spec.xDomain = parentDef.xDomain;
        if (spec.xLinkID === undefined) spec.xLinkID = parentDef.xLinkID;
        if (spec.centerHole === undefined) spec.centerHole = parentDef.centerHole;
    } else {
        // This means we are at the rool level, so assign default values if missing
        if (spec.assembly === undefined) spec.assembly = 'hg38';
        if (spec.layout === undefined) spec.layout = 'linear';
        if (spec.static === undefined) spec.static = spec.layout === 'circular' ? true : false;
        if (spec.centerHole === undefined) spec.centerHole = DEFAULT_INNER_HOLE_PROP;
        // Nothing to do when `xDomain` not suggested
        // Nothing to do when `xLinkID` not suggested
    }

    if ('tracks' in spec) {
        // !!! TODO: (FOR THE RENDERING PERFORMANCE) We need to also combine overlaid tracks if they use identical data and metadata so tha we have to load the data only once.
        // !!! This should be taken before fixing `overlayOnPreviousTrack` options.
        /**
         * Spread superposed tracks if they are assigned to different data/metadata.
         * This process is necessary since we are passing over each track to HiGlass, and if a track contain multiple datastes, HiGlass cannot handle that.
         */
        spec.tracks = spreadTracksByData(spec.tracks);

        const linkID = uuid.v4();
        spec.tracks.forEach((track, i, array) => {
            // If size not defined, set default ones
            if (!track.width) track.width = DEFAULT_TRACK_WIDTH_LINEAR;
            if (!track.height) track.height = DEFAULT_TRACK_HEIGHT_LINEAR;

            /**
             * Override options received from the parent
             */
            if (!track.assembly) track.assembly = spec.assembly;
            if (!track.layout) track.layout = spec.layout;
            if (track.static === undefined)
                track.static = track.layout === 'circular' ? true : spec.static !== undefined ? spec.static : false;

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
            if ((IsSingleTrack(track) || IsOverlaidTrack(track)) && IsChannelDeep(track.x) && !track.x.linkingID) {
                track.x.linkingID = spec.xLinkID ?? linkID;
            } else if (IsOverlaidTrack(track)) {
                let isAdded = false;
                track.overlay.forEach(o => {
                    if (isAdded) return; // We want to add only once

                    if (IsChannelDeep(o.x) && !o.x.linkingID) {
                        // TODO: Is this safe?
                        o.x.linkingID = spec.xLinkID ?? linkID;
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

            if (track.overlayOnPreviousTrack && array[i - 1]) {
                // Use the same size as the previous one
                track.width = array[i - 1].width;
                track.height = array[i - 1].height;

                track.layout = array[i - 1].layout;
                track.assembly = array[i - 1].assembly;
            }
        });
    } else {
        // we did not reach track definition, so continue traversing
        getArrangedViews(spec).forEach(v => {
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
