import assign from 'lodash/assign';
import uuid from 'uuid';
import {
    SingleTrack,
    GoslingSpec,
    SingleView,
    Track,
    CommonViewDef,
    MultipleViews,
    PossibleTrack,
    PrMultipleViews,
    PrGoslingSpec,
    OverlaidTrackWithSharedDef,
    DataTrack
} from '../gosling.schema';
import {
    needTemplate,
    // IsDataDeepTileset,
    IsChannelDeep,
    IsOverlaidTrack,
    // IsDataTrack,
    IsOverlaidTrackWithSharedDef
} from '../gosling.schema.guards';
import {
    DEFAULT_INNER_RADIUS_PROP,
    DEFAULT_TRACK_HEIGHT_LINEAR,
    DEFAULT_TRACK_WIDTH_LINEAR,
    DEFAULT_VIEW_SPACING
} from '../layout/defaults';

/**
 * Traverse views and tracks to use parents's properties if missing.
 * @param spec
 * @param callback
 */
export function processSpec(spec: GoslingSpec | SingleView, parentDef?: CommonViewDef | MultipleViews) {
    if (parentDef) {
        /**
         * Override props from parents.
         */
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
        /**
         * This means we are at the rool level, so assign default values if missing.
         */
        if (spec.assembly === undefined) spec.assembly = 'hg38';
        if (spec.layout === undefined) spec.layout = 'linear';
        if (spec.static === undefined) spec.static = false;
        // Nothing to do if `xDomain` undefined
        // Nothing to do if `xLinkId` undefined
        if (spec.centerRadius === undefined) spec.centerRadius = DEFAULT_INNER_RADIUS_PROP;
        if (spec.spacing === undefined) spec.spacing = DEFAULT_VIEW_SPACING;
        if ('views' in spec && spec.arrangement === undefined) spec.arrangement = 'vertical';
    }

    if ('tracks' in spec) {
        const sharedLinkingId = uuid.v4();
        if (IsOverlaidTrack(spec)) {
            // An overlaid track
            processTrack(spec, 0, [spec], spec, sharedLinkingId);
        } else {
            // Multiple tracks stacked
            spec.tracks.forEach((track: PossibleTrack, i, array) => {
                processTrack(track, i, array, spec, sharedLinkingId);
            });
        }
    } else {
        // We did not reach track definition, so continue traversing
        spec.views.forEach(v => {
            processSpec(v, spec as CommonViewDef);
        });
    }
}

/**
 * Process a track (either an overlaid track or a regular track).
 */
function processTrack(
    track: PossibleTrack,
    index: number,
    array: PossibleTrack[],
    parent: SingleView,
    sharedLinkingId: string
) {
    if (needTemplate(track)) {
        // If this is a data track, override a template.
        overrideTemplate(track as DataTrack | Track, index, array as Track[]);
    } else if (IsOverlaidTrackWithSharedDef(track)) {
        // If a shared track definition is being used, override it to individual track definitions.
        const base = JSON.parse(JSON.stringify(track.sharedTrackDefinition));

        // Remove a `sharedTrackDefinition` prop.
        delete (track as Partial<OverlaidTrackWithSharedDef>).sharedTrackDefinition;

        // Override the base track definition.
        track.tracks.forEach((t, i, ts) => {
            const newTrack = assign(JSON.parse(JSON.stringify(base)), t) as SingleTrack;

            // Override templates if needed.
            if (needTemplate(newTrack)) {
                overrideTemplate(newTrack, i, ts as Track[]);
            }

            ts[i] = newTrack;
        });
    }

    /**
     * Correct tracks that are overlaid.
     */
    if (IsOverlaidTrack(track)) {
        track.tracks.forEach((t, i) => {
            /*
             * Title should be contained only in the first track.
             */
            if (t.title && i !== 0) {
                delete t.title;
            }
        });
    }

    /**
     * Fill props using default values and parents' values.
     */
    const fillProps = (t: SingleTrack) => {
        /**
         * If size is undefined, set default ones.
         */
        if (!t.width) t.width = DEFAULT_TRACK_WIDTH_LINEAR;
        if (!t.height) t.height = DEFAULT_TRACK_HEIGHT_LINEAR;

        /*
         * Properties that shouldn't be defined by users.
         */
        if (t.layout) t.layout = undefined;
        if (t._overlayOnPreviousTrack) t._overlayOnPreviousTrack = undefined;

        /**
         * Override options received from the parent.
         */
        if (!t.assembly) t.assembly = parent.assembly;
        if (!t.layout) t.layout = parent.layout;
        if (t.static === undefined) t.static = parent.static !== undefined ? parent.static : false;

        /**
         * Add x-axis domain.
         */
        if (IsChannelDeep(t.x) && !t.x.domain) {
            t.x.domain = parent.xDomain;
        }

        /**
         * Link tracks in a single view.
         */
        if (IsChannelDeep(t.x) && !t.x.linkingId) {
            t.x.linkingId = parent.xLinkingId ?? sharedLinkingId;
        }
    };
    if (IsOverlaidTrack(track)) {
        track.tracks.forEach(o => fillProps(o as SingleTrack));

        // Set a flag value to `true` so that we know that these tracks should be stored in a single higlass track.
        track.tracks.forEach((o, j) => (o._overlayOnPreviousTrack = j !== 0));
    } else {
        fillProps(track as SingleTrack);
    }

    /**
     * Add axis to the first track if undefined.
     */
    if (index === 0) {
        const setAxisPosition = (t: SingleTrack) => {
            if (IsChannelDeep(t.x) && !t.x.axis) {
                t.x.axis = 'top';
            }
        };
        if (IsOverlaidTrack(track)) {
            if (track.tracks.length > 0) {
                setAxisPosition(track.tracks[0] as SingleTrack);
            }
        } else {
            setAxisPosition(track as SingleTrack);
        }
    }

    /*
     * Flip y scale if the last track uses `link` marks
     */
    if (index === array.length - 1) {
        const flipY = (t: SingleTrack) => {
            if (t.mark === 'link' && t.flipY === undefined) {
                t.flipY = true;
            }
        };
        if (IsOverlaidTrack(track)) {
            track.tracks.forEach(o => flipY(o as SingleTrack));
        } else {
            flipY(track as SingleTrack);
        }
    }
}

/**
 * Traverse individual tracks and call the callback function to read and/or update the track definition.
 * @param spec
 * @param callback
 */
//  export function traverseTracks(
//     spec: GoslingSpec,
//     callback: (t: PossibleTrack, i: number, ts: PossibleTrack[]) => void
// ) {
//     if ('tracks' in spec) {
//         spec.tracks.forEach((...args) => callback(...args));
//     } else {
//         spec.views.forEach(view => traverseTracks(view, callback));
//     }
// }

/**
 * Traverse individual tracks and views and call the callback function to read and/or update the common definition of views and tracks.
 * @param spec
 * @param callback
 */
export function traverseTracksAndViews(spec: PrGoslingSpec, callback: (tv: CommonViewDef) => void) {
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
export function traverseViewArrangements(spec: PrGoslingSpec, callback: (tv: PrMultipleViews) => void) {
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
// export function overrideTemplates(spec: GoslingSpec) {
//     traverseTracks(spec, (track, i, tracks) => {
//         if (!track.data || !IsDataDeepTileset(track.data)) {
//             // if `data` is not specified, we can not provide a correct template.
//             return;
//         }

//         const setTemplates = (_t: Track, _i: number, _tracks: Track[]) => {
//             if (!needTemplate(_t)) {
//                 // This is not partial specification that we need to use templates
//                 return;
//             }

//             switch (_t.data.type) {
//                 case 'vector':
//                 case 'bigwig':
//                     _tracks[_i] = assign(getVectorTemplate(_t.data.column, _t.data.value), _t);
//                     break;
//                 case 'multivec':
//                     _tracks[_i] = assign(
//                         getMultivecTemplate(_t.data.row, _t.data.column, _t.data.value, _t.data.categories),
//                         _t
//                     );
//                     break;
//             }
//         };

//         if (IsOverlaidTrack(track)) {
//             track.tracks.forEach((o, i, ots) => {
//                 setTemplates(o, i, ots);
//             });
//         } else {
//             setTemplates(track, i, tracks as Track[]);
//         }
//     });
// }

/**
 * Override default visual encoding for given data type.
 */
export function overrideTemplate(track: Track, index: number, array: Track[]) {
    if (!needTemplate(track)) {
        return;
    }

    switch (track.data.type) {
        case 'vector':
        case 'bigwig':
            array[index] = assign(getVectorTemplate(track.data.column, track.data.value), track);
            break;
        case 'multivec':
            array[index] = assign(
                getMultivecTemplate(track.data.row, track.data.column, track.data.value, track.data.categories),
                track
            );
            break;
    }
}
