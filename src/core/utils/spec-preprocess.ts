import assign from 'lodash/assign';
import uuid from 'uuid';
import {
    SingleTrack,
    GoslingSpec,
    SingleView,
    Track,
    CommonViewDef,
    MultipleViews,
    OverlaidTracks
} from '../gosling.schema';
import {
    IsTemplate,
    IsDataDeepTileset,
    // IsSingleTrack,
    IsChannelDeep,
    IsOverlaidTracks,
    IsDataTrack
} from '../gosling.schema.guards';
import {
    DEFAULT_INNER_RADIUS_PROP,
    DEFAULT_TRACK_HEIGHT_LINEAR,
    DEFAULT_TRACK_WIDTH_LINEAR,
    DEFAULT_VIEW_SPACING
} from '../layout/defaults';

/**
 * Traverse individual tracks and call the callback function to read and/or update the track definition.
 * @param spec
 * @param callback
 */
export function traverseTracks(
    spec: GoslingSpec,
    callback: (t: Track | OverlaidTracks, i: number, ts: (Track | OverlaidTracks)[]) => void
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
 * Traverse views and tracks to use parents's properties if missing.
 * @param spec
 * @param callback
 */
export function traverseToFixSpecDownstream(spec: GoslingSpec | SingleView, parentDef?: CommonViewDef | MultipleViews) {
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
        if (spec.centerRadius === undefined) spec.centerRadius = DEFAULT_INNER_RADIUS_PROP;
        if (spec.spacing === undefined) spec.spacing = DEFAULT_VIEW_SPACING;
        if ('views' in spec && spec.arrangement === undefined) spec.arrangement = 'vertical';
        // Nothing to do if `xDomain` undefined
        // Nothing to do if `xLinkID` undefined
    }

    if ('tracks' in spec) {
        const linkId = uuid.v4();
        spec.tracks.forEach((track, i, array) => {
            /**
             * DataTrack
             */
            if (!IsOverlaidTracks(track) && IsDataTrack(track)) {
                // This shouldn't be reached since all `DataTrack`s should have been changed to `SingleTrack`s before calling this function.
                return;
            }

            /**
             * Fill props using default values and parents' values.
             */
            const fillProps = (t: SingleTrack, w = DEFAULT_TRACK_WIDTH_LINEAR, h = DEFAULT_TRACK_HEIGHT_LINEAR) => {
                /**
                 * If size is undefined, set default ones.
                 */
                if (!t.width) t.width = w;
                if (!t.height) t.height = h;

                /*
                 * Properties that shouldn't be defined by users.
                 */
                if (t.layout) t.layout = undefined;
                if (t._overlayOnPreviousTrack) t._overlayOnPreviousTrack = undefined;

                /**
                 * Override options received from the parent.
                 */
                if (!t.assembly) t.assembly = spec.assembly;
                if (!t.layout) t.layout = spec.layout;
                if (t.static === undefined) t.static = spec.static !== undefined ? spec.static : false;

                /**
                 * Add x-axis domain.
                 */
                if (IsChannelDeep(t.x) && !t.x.domain) {
                    t.x.domain = spec.xDomain;
                }

                /**
                 * Link tracks in a single view.
                 */
                if (IsChannelDeep(t.x) && !t.x.linkingId) {
                    t.x.linkingId = spec.xLinkingId ?? linkId;
                }
            };
            if (IsOverlaidTracks(track)) {
                track.tracks.forEach(o => fillProps(o as SingleTrack, track.width, track.height));
            } else {
                fillProps(track);
            }

            /**
             * Add axis to the first track if undefined.
             */
            if (i === 0) {
                const setAxisPosition = (t: SingleTrack) => {
                    if (IsChannelDeep(t.x) && !t.x.axis) {
                        t.x.axis = 'top';
                    }
                };
                if (IsOverlaidTracks(track)) {
                    if (track.tracks.length > 0) {
                        setAxisPosition(track.tracks[0] as SingleTrack);
                    }
                } else {
                    setAxisPosition(track);
                }
            }

            /*
             * Flip y scale if the last track uses `link` marks
             */
            if (i === array.length - 1) {
                const flipY = (t: SingleTrack) => {
                    if (t.mark === 'link' && t.flipY === undefined) {
                        t.flipY = true;
                    }
                };
                if (IsOverlaidTracks(track)) {
                    track.tracks.forEach(o => flipY(o as SingleTrack));
                } else {
                    flipY(track);
                }
            }
        });
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
    traverseTracks(spec, (track, i, tracks) => {
        if (!track.data || !IsDataDeepTileset(track.data)) {
            // if `data` is not specified, we can not provide a correct template.
            return;
        }

        const setTemplates = (_t: Track, _i: number, _tracks: Track[]) => {
            if (!IsTemplate(_t)) {
                // This is not partial specification that we need to use templates
                return;
            }

            switch (_t.data.type) {
                case 'vector':
                case 'bigwig':
                    _tracks[_i] = assign(getVectorTemplate(_t.data.column, _t.data.value), _t);
                    break;
                case 'multivec':
                    _tracks[_i] = assign(
                        getMultivecTemplate(_t.data.row, _t.data.column, _t.data.value, _t.data.categories),
                        _t
                    );
                    break;
            }
        };

        if (IsOverlaidTracks(track)) {
            track.tracks.forEach((o, i, ots) => {
                setTemplates(o, i, ots);
            });
        } else {
            setTemplates(track, i, tracks as Track[]);
        }
    });
}
