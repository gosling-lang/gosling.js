import { IsMultipleViews, IsSingleView, type Assembly, type SingleView } from '@gosling-lang/gosling-schema';
import { GenomicPositionHelper, computeChromSizes } from '../../src/core/utils/assembly';
import { signal, type Signal } from '@preact/signals-core';
import type { GoslingSpec } from 'gosling.js';
import { TrackType } from './main';

/**
 * This is the information needed to link tracks together
 */
export interface LinkedEncoding {
    linkingId: string;
    encoding: 'x';
    signal: Signal;
    trackIds: string[];
    brushIds: string[];
}
/**
 * This is information extracted from the Gosling spec.
 * Is is the linking that is defined at the view level.
 */
export interface ViewLink {
    linkingId?: string;
    encoding: 'x';
    trackIds: string[];
    signal: Signal;
}

/**
 * This is information extracted from the Gosling spec.
 * It is the x-linking defined at the track level (opposed to the view level)
 */
interface TrackLink {
    encoding: 'x';
    linkingId: string;
    trackId: string;
    trackType: TrackType;
}

/**
 * Info collected from the GoslingSpec that is needed to link tracks together
 * The brushIds are added after the fact
 */
interface LinkInfo {
    trackLinks: TrackLink[];
    viewLinks: ViewLink[];
}

function filterLinkedTracksByType(trackType: TrackType, linkingId: string | undefined, trackLinks: TrackLink[]) {
    if (!linkingId) return [];
    return trackLinks.filter(trackLink => trackLink.linkingId === linkingId && trackLink.trackType === trackType);
}

/**
 * Extracts the linked encodings from a GoslingSpec
 */
export function getLinkedEncodings(gs: GoslingSpec) {
    // First, we traverse the gosling spec to find all the linked tracks and brushes
    const { trackLinks, viewLinks } = getLinedFeaturesRecursive(gs);
    // We combine the tracks and views that are linked together
    const linkedEncodings = viewLinks.map(viewLink => {
        const linkedBrushes = filterLinkedTracksByType(TrackType.BrushLinear, viewLink.linkingId, trackLinks);
        console.warn(linkedBrushes)
        const linkedTracks = filterLinkedTracksByType(TrackType.Gosling, viewLink.linkingId, trackLinks);
        return {
            linkingId: viewLink.linkingId,
            encoding: viewLink.encoding,
            signal: viewLink.signal,
            trackIds: [...viewLink.trackIds, ...linkedTracks.map(track => track.trackId)],
            brushIds: linkedBrushes.map(brush => brush.trackId)
        } as LinkedEncoding;
    });
    return linkedEncodings;
}

/**
 * Traverses the gosling spec to find all the linked tracks and brushes
 */
function getLinedFeaturesRecursive(gs: GoslingSpec): LinkInfo {
    // Base case: single view
    if (IsSingleView(gs)) {
        const viewLinks = getSingleViewLinks(gs);
        const trackLinks = getSingleViewTrackLinks(gs);
        return { viewLinks: [viewLinks], trackLinks };
    }
    const linked: LinkInfo = { viewLinks: [], trackLinks: [] };
    // Recursive case: multiple views
    if (IsMultipleViews(gs)) {
        gs.views.forEach(view => {
            const newLinks = getLinedFeaturesRecursive(view);
            linked.viewLinks.push(...newLinks.viewLinks);
            linked.trackLinks.push(...newLinks.trackLinks);
        });
    }
    return linked;
}

/**
 * Extracts the linkingId from tracks that have a brush overlay
 */
function getSingleViewTrackLinks(gs: SingleView): TrackLink[] {
    const { tracks } = gs;
    const trackLinks: TrackLink[] = [];
    tracks.forEach(track => {
        if ('x' in track && track.x && 'linkingId' in track.x) {
            trackLinks.push({
                trackId: track.id,
                linkingId: track.x.linkingId,
                trackType: TrackType.Gosling,
                encoding: 'x'
            });
        }
        if (!('_overlay' in track)) return;
        track._overlay!.forEach(overlay => {
            if (overlay.mark === 'brush') {
                const trackType = gs.layout === 'linear' ? TrackType.BrushLinear : TrackType.BrushCircular;
                trackLinks.push({ trackId: track.id, linkingId: overlay.x.linkingId, trackType, encoding: 'x' });
            }
        });
    });
    return trackLinks;
}

/**
 * Links all of the tracks in a single view together
 */
function getSingleViewLinks(gs: SingleView): ViewLink {
    const { tracks, xDomain, assembly } = gs;
    const domain = getDomain(xDomain, assembly);

    const newLink: ViewLink = {
        linkingId: gs.linkingId,
        encoding: 'x',
        signal: signal(domain),
        trackIds: []
    };
    // Add each track to the link
    tracks.forEach(track => {
        newLink.trackIds.push(track.id);
    });
    return newLink;
}

/**
 * For a given xDomain and Assembly, return the the absolute domain [start, end]
 */
function getDomain(xDomain: GoslingSpec['xDomain'], assembly?: Assembly): [number, number] {
    let domain = [0, 0] as [number, number];
    if (!xDomain) {
        domain = [0, computeChromSizes(assembly).total];
    } else {
        const position = createDomainString(xDomain);
        const manager = GenomicPositionHelper.fromString(position);
        domain = manager.toAbsoluteCoordinates(assembly, 0);
    }
    return domain;
}

/**
 * Generates a string representation of the xDomain
 */
function createDomainString(xDomain: GoslingSpec['xDomain']) {
    if (typeof xDomain === 'string') {
        return xDomain;
    }
    let position = '';
    if (typeof xDomain === 'string') {
        position = xDomain;
    } else if (typeof xDomain === 'object' && 'chromosome' in xDomain && !('interval' in xDomain)) {
        position = xDomain.chromosome;
    } else if (typeof xDomain === 'object' && 'chromosome' in xDomain && 'interval' in xDomain) {
        position = `${xDomain.chromosome}:${xDomain.interval[0]}-${xDomain.interval[1]}`;
    }
    return position;
}
