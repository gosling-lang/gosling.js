import { IsMultipleViews, IsSingleView, type Assembly, type SingleView } from '@gosling-lang/gosling-schema';
import { GenomicPositionHelper, computeChromSizes } from '../../src/core/utils/assembly';
import { signal, type Signal } from '@preact/signals-core';
import type { GoslingSpec } from 'gosling.js';
import { TrackType } from './main';
import type { Link } from 'react-router-dom';

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

const example1: LinkedEncoding = {
    linkingId: 'detail-1',
    encoding: 'x',
    signal: signal([0, 100]),
    trackIds: ['track1', 'track2', ''],
    brushIds: ['brush1']
};

const example2: LinkedEncoding = {
    linkingId: 'detail-2',
    encoding: 'x',
    signal: signal([0, 100]),
    trackIds: ['track2'],
    brushIds: ['brush2']
};

const example3: LinkedEncoding = {
    linkingId: undefined,
    encoding: 'x',
    signal: signal([0, 100]),
    trackIds: ['overview track', 'brush1', 'brush2'],
    brushIds: []
};

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
    signal?: Signal; // Some encodings have a "domain" property that can be used to create a signal
}

/**
 * Info collected from the GoslingSpec that is needed to link tracks together
 * The brushIds are added after the fact
 */
interface LinkInfo {
    trackLinks: TrackLink[];
    viewLinks: ViewLink[];
}

/**
 * Extracts the linked encodings from a GoslingSpec
 */
export function getLinkedEncodings(gs: GoslingSpec) {
    // First, we traverse the gosling spec to find all the linked tracks and brushes
    const { trackLinks, viewLinks } = getLinedFeaturesRecursive(gs);
    console.warn('trackLinks', trackLinks);
    // We combine the tracks and views that are linked together
    const linkedEncodings = viewLinks.map(viewLink => {
        const linkedBrushes = filterLinkedTracksByType(TrackType.BrushLinear, viewLink.linkingId, trackLinks);
        const linkedTracks = filterLinkedTracksByType(TrackType.Gosling, viewLink.linkingId, trackLinks);
        return {
            linkingId: viewLink.linkingId,
            encoding: viewLink.encoding,
            signal: viewLink.signal,
            trackIds: [...viewLink.trackIds, ...linkedTracks.map(track => track.trackId)],
            brushIds: linkedBrushes.map(brush => brush.trackId)
        } as LinkedEncoding;
    });
    // Combine trackLinks that do not belong to any viewLink
    const unlinkedTracks = trackLinks.filter(
        trackLink => !linkedEncodings.some(link => trackLink.linkingId === link.linkingId)
    );
    linkedEncodings.push(...combineUnlinkedTracks(unlinkedTracks));

    return linkedEncodings.filter(link => link.trackIds.length > 0 || link.brushIds.length > 0);
}

/**
 * This function takes a list of unlinked tracks and combines them into linked encodings
 * This can happen when a track uses the "domain" property
 */
function combineUnlinkedTracks(unlinkedTracks: TrackLink[]): LinkedEncoding[] {
    console.warn('unlinkedTracks', unlinkedTracks);
    const linkedEncodings: LinkedEncoding[] = [];
    unlinkedTracks.forEach(trackLink => {
        const existingLink = linkedEncodings.find(link => link.linkingId === trackLink.linkingId);
        if (existingLink) {
            if (isBrushTrack(trackLink.trackType)) {
                existingLink.brushIds.push(trackLink.trackId);
            } else {
                existingLink.trackIds.push(trackLink.trackId);
            }
            if (trackLink.signal) {
                existingLink.signal = trackLink.signal;
            }
        } else {
            const newLink = {
                linkingId: trackLink.linkingId,
                encoding: trackLink.encoding
            } as LinkedEncoding;

            if (isBrushTrack(trackLink.trackType)) {
                newLink.brushIds = [trackLink.trackId];
                newLink.trackIds = [];
            } else {
                newLink.trackIds = [trackLink.trackId];
                newLink.brushIds = [];
            }
            if (trackLink.signal) {
                newLink.signal = trackLink.signal;
            }
            linkedEncodings.push(newLink);
        }
    });
    console.warn('linkedEncodings from unlinked', linkedEncodings);
    return linkedEncodings;
}

/**
 * Helper function to determine if a track is a brush track
 */
function isBrushTrack(trackType: TrackType) {
    return trackType === TrackType.BrushLinear || trackType === TrackType.BrushCircular;
}
/**
 * Helper function to filter the linked tracks by type
 */
function filterLinkedTracksByType(trackType: TrackType, linkingId: string | undefined, trackLinks: TrackLink[]) {
    if (!linkingId) return [];
    return trackLinks.filter(trackLink => trackLink.linkingId === linkingId && trackLink.trackType === trackType);
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
            const trackLink = {
                trackId: track.id,
                linkingId: track.x.linkingId,
                trackType: TrackType.Gosling,
                encoding: 'x'
            } as TrackLink;
            // If the track has a domain, we create a signal and add it to the trackLink
            if (track.x.domain !== undefined) {
                const { assembly } = gs;
                const domain = getDomain(track.x.domain, assembly);
                trackLink.signal = signal(domain);
            }
            trackLinks.push(trackLink);
        }
        if (!('_overlay' in track)) return;
        track._overlay!.forEach(overlay => {
            if (overlay.mark === 'brush') {
                const trackType = gs.layout === 'linear' ? TrackType.BrushLinear : TrackType.BrushCircular;
                trackLinks.push({ trackId: overlay.id, linkingId: overlay.x.linkingId, trackType, encoding: 'x' });
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
        // If the track is already linked, we don't need to add it again
        if ('x' in track && track.x && 'linkingId' in track.x && track.x?.linkingId) {
            return;
        }
        // Add overlaid brush tracks to the link
        if ('_overlay' in track) {
            track._overlay?.forEach(overlay => {
                if (overlay.mark === 'brush') {
                    newLink.trackIds.push(overlay.id);
                }
            });
        }

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
