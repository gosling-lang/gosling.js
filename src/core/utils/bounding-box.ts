import { ArrangedViews, CommonViewDef, GoslingSpec, Track, View } from '../gosling.schema';
import { getArrangedViews, IsXAxis } from '../gosling.schema.guards';
import { HIGLASS_AXIS_SIZE } from '../higlass-model';
import {
    DEFAULT_INNER_HOLE_PROP,
    DEFAULT_SUBTITLE_HEIGHT,
    DEFAULT_TITLE_HEIGHT,
    DEFAULT_VIEW_SPACING
} from '../layout/defaults';
import { traverseTracksAndViews, traverseViewArrangements } from './spec-preprocess';

export interface Size {
    width: number;
    height: number;
}

export interface GridInfo extends Size {
    columnSizes: number[];
    rowSizes: number[];
    columnGaps: number[];
    rowGaps: number[];
}

/**
 * Position information of each track.
 */
export interface BoundingBox extends Size {
    x: number;
    y: number;
}

/**
 * Relative positioning of views, used in HiGlass view configs as `layout`.
 */
export interface RelativePosition {
    w: number;
    h: number;
    x: number;
    y: number;
}

/**
 * Track information for its arrangement.
 */
export interface TrackInfo {
    track: Track;
    boundingBox: BoundingBox;
    layout: RelativePosition;
}

/**
 * Return the size of entire visualization.
 * @param trackInfos
 */
export function getBoundingBox(trackInfos: TrackInfo[]) {
    let width = 0;
    let height = 0;

    trackInfos.forEach(_ => {
        const w = _.boundingBox.x + _.boundingBox.width;
        const h = _.boundingBox.y + _.boundingBox.height;
        if (height < h) {
            height = h;
        }
        if (width < w) {
            width = w;
        }
    });
    return { width, height };
}

/**
 * Collect information of individual tracks including their size/position and specs
 * @param spec
 */
export function getRelativeTrackInfo(spec: GoslingSpec): TrackInfo[] {
    let trackInfos: TrackInfo[] = [] as TrackInfo[];

    // Collect track information including spec, bounding boxes, and RGL' `layout`.
    traverseAndCollectTrackInfo(spec, trackInfos); // RGL parameter (`layout`) is not deteremined yet since we do not know the entire size of vis yet.

    // Get the size of entire visualization.
    const size = getBoundingBox(trackInfos);

    // Titles
    if (spec.title || spec.subtitle) {
        // If title and/or subtitle presents, offset the y position by title/subtitle size
        const titleHeight = (spec.title ? DEFAULT_TITLE_HEIGHT : 0) + (spec.subtitle ? DEFAULT_SUBTITLE_HEIGHT : 0);
        const marginBottom = 4;

        size.height += titleHeight + marginBottom;

        // Offset all non-title tracks.
        trackInfos.forEach(_ => {
            _.boundingBox.y += titleHeight + marginBottom;
        });

        // Add a title track.
        trackInfos = [
            {
                track: getTextTrack({ width: size.width, height: titleHeight }, spec.title, spec.subtitle),
                boundingBox: { x: 0, y: 0, width: size.width, height: titleHeight },
                layout: { x: 0, y: 0, w: 12, h: (titleHeight / size.height) * 12.0 }
            },
            ...trackInfos
        ];
    }

    // Calculate `layout`s for React Grid Layout (RGL).
    trackInfos.forEach(_ => {
        _.layout.x = (_.boundingBox.x / size.width) * 12;
        _.layout.y = (_.boundingBox.y / size.height) * 12;
        _.layout.w = (_.boundingBox.width / size.width) * 12;
        _.layout.h = (_.boundingBox.height / size.height) * 12;
    });

    return trackInfos;
}

/**
 * Visit all tracks and views in the Gosling spec to collect information of individual tracks, including their size, position, and spec.
 * @param spec
 * @param output
 * @param dx
 * @param dy
 * @param forceWidth
 * @param forceHeight
 * @param circularRootNotFound
 */
function traverseAndCollectTrackInfo(
    spec: GoslingSpec | View,
    output: TrackInfo[],
    dx = 0,
    dy = 0,
    circularRootNotFound = true // A flag variable to find a root level of circular tracks/views
) {
    let cumWidth = 0;
    let cumHeight = 0;

    /* Parameters to determine if we need to combine all the children to show as a single circular visualization */
    let allChildCircularLayout = true;
    let traversedAtLeastOnce = false;
    traverseTracksAndViews(spec, (tv: CommonViewDef) => {
        traversedAtLeastOnce = true;
        if (tv.layout !== 'circular') {
            allChildCircularLayout = false;
        }
    });

    let noChildConcatArrangement = true; // if v/hconcat is being used by children, circular visualizations should be adjacently placed.
    traverseViewArrangements(spec, (a: ArrangedViews) => {
        if ('vconcatViews' in a || 'hconcatViews' in a) {
            noChildConcatArrangement = false;
        }
    });

    const isThisCircularRoot =
        circularRootNotFound &&
        allChildCircularLayout &&
        traversedAtLeastOnce &&
        noChildConcatArrangement &&
        ('parallelViews' in spec || 'serialViews' in spec || 'tracks' in spec);

    const numTracksBeforeInsert = output.length;

    if ('tracks' in spec) {
        // Use the largest `width` for this view.
        cumWidth = Math.max(...spec.tracks.map(d => d.width)); //forceWidth ? forceWidth : spec.tracks[0]?.width;
        spec.tracks.forEach((track, i, array) => {
            // let scaledHeight = track.height;

            if (getNumOfXAxes([track]) === 1) {
                track.height += HIGLASS_AXIS_SIZE;
            }

            track.width = cumWidth;

            output.push({
                track,
                boundingBox: {
                    x: dx,
                    y: dy + cumHeight,
                    width: cumWidth,
                    height: track.height
                },
                layout: { x: 0, y: 0, w: 0, h: 0 } // Just put a dummy info here, this should be added after entire bounding box has been determined
            });

            if (array[i + 1] && array[i + 1].overlayOnPreviousTrack) {
                // do not add a height
            } else {
                cumHeight += track.height;
                if (i !== array.length - 1) {
                    cumHeight += spec.spacing ?? 0;
                }
            }
        });
    } else {
        // We did not reach a track definition, so continue traversing.
        const spacing = spec.spacing ? spec.spacing : DEFAULT_VIEW_SPACING;

        // We first calculate position and size of each view and track by considering it as if it uses a linear layout
        if ('parallelViews' in spec || 'vconcatViews' in spec) {
            // const sizes = getSizeDefOfArrangedViews(spec);
            getArrangedViews(spec).forEach((v, i, array) => {
                const viewBB = traverseAndCollectTrackInfo(
                    v,
                    output,
                    dx,
                    dy + cumHeight,
                    !isThisCircularRoot && circularRootNotFound
                );

                if (cumWidth < viewBB.width) {
                    cumWidth = viewBB.width;
                }
                if (i !== array.length - 1) {
                    cumHeight += spacing;
                }
                cumHeight += viewBB.height;
            });
        } else if ('serialViews' in spec || 'hconcatViews' in spec) {
            getArrangedViews(spec).forEach((v, i, array) => {
                const viewBB = traverseAndCollectTrackInfo(
                    v,
                    output,
                    dx + cumWidth,
                    dy,
                    !isThisCircularRoot && circularRootNotFound
                );

                if (cumHeight < viewBB.height) {
                    cumHeight = viewBB.height;
                }
                if (i !== array.length - 1) {
                    cumWidth += spacing;
                }
                cumWidth += viewBB.width;
            });
        }
    }

    // If this is a root view that uses a circular layout, use the posiiton and size of views/tracks to calculate circular-specific parameters, such as outer/inner radius and start/end angle
    if (isThisCircularRoot) {
        const cTracks = output.slice(numTracksBeforeInsert);

        const INNER_HOLE = spec.centerHole !== undefined ? spec.centerHole : DEFAULT_INNER_HOLE_PROP;
        const TOTAL_RADIUS = cumWidth / 2.0; // (cumWidth + cumHeight) / 2.0 / 2.0;
        const TOTAL_RING_SIZE = TOTAL_RADIUS * (1 - INNER_HOLE);

        // const numXAxes = getNumOfXAxes(cTracks.map(info => info.track));

        cTracks.forEach((t, i) => {
            t.track.layout = 'circular';

            t.track.outerRadius = TOTAL_RADIUS - ((t.boundingBox.y - dy) / cumHeight) * TOTAL_RING_SIZE;
            t.track.innerRadius =
                TOTAL_RADIUS - ((t.boundingBox.y + t.boundingBox.height - dy) / cumHeight) * TOTAL_RING_SIZE;
            t.track.startAngle = ((t.boundingBox.x - dx) / cumWidth) * 360;
            t.track.endAngle = ((t.boundingBox.x + t.boundingBox.width - dx) / cumWidth) * 360;

            t.boundingBox.x = dx;
            t.boundingBox.y = dy;

            // Circular tracks share the same size and position since technically these tracks are being overlaid on top of the others
            t.boundingBox.height = t.track.height = t.boundingBox.width = t.track.width = TOTAL_RADIUS * 2;

            if (i !== 0) {
                t.track.overlayOnPreviousTrack = true;
            }
        });

        cumHeight = TOTAL_RADIUS * 2;
    }

    return { x: dx, y: dy, width: cumWidth, height: cumHeight };
}

export function getNumOfXAxes(tracks: Track[]): number {
    return tracks.filter(t => IsXAxis(t)).length;
}

/**
 * Get a spec for a title track.
 * @param size
 * @param title
 * @param subtitle
 */
const getTextTrack = (size: Size, title?: string, subtitle?: string) => {
    return JSON.parse(
        JSON.stringify({
            mark: 'header',
            width: size.width,
            height: size.height,
            title,
            subtitle
        })
    ) as Track;
};
