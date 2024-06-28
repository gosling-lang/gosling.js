import { IsMultipleViews, IsSingleView, type Assembly, type SingleView } from '@gosling-lang/gosling-schema';
import { GenomicPositionHelper, computeChromSizes } from '../../src/core/utils/assembly';
import { signal, type Signal } from '@preact/signals-core';
import type { GoslingSpec } from 'gosling.js';
import { TrackType } from './main';
import { isHeatmapTrack } from './heatmap';

/**
 * This is the information needed to link tracks together
 */
export interface LinkedEncoding {
    linkingId: string;
    signal: Signal;
    tracks: {
        id: string;
        encoding: 'x' | 'brush';
    }[];
}

/**
 * This is information extracted from the Gosling spec.
 * Is is the linking that is defined at the view level.
 */
interface ViewLink {
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
    encoding: 'x' | 'brush' | 'y';
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
    const { trackLinks, viewLinks } = getLinkedFeaturesRecursive(gs);
    console.warn('trackLinks', trackLinks);
    // We associate tracks the other tracks they are linked with
    const linkedEncodings = viewLinks.map(viewLink => {
        const linkedTracks = getLinkedTracks(viewLink.linkingId, trackLinks).map(track => ({
            id: track.trackId,
            encoding: track.encoding
        }));
        const viewTracks = viewLink.trackIds.map(trackId => ({ id: trackId, encoding: 'x' }));
        return {
            linkingId: viewLink.linkingId,
            signal: viewLink.signal,
            tracks: [...linkedTracks, ...viewTracks]
        } as LinkedEncoding;
    });
    // Combine trackLinks that do not belong to any viewLink
    const unlinkedTracks = trackLinks.filter(
        trackLink =>
            !linkedEncodings.some(link => link.linkingId !== undefined && trackLink.linkingId === link.linkingId)
    );
    linkedEncodings.push(...combineUnlinkedTracks(unlinkedTracks));

    return linkedEncodings.filter(link => link.tracks.length > 0);
}

/**
 * This function takes a list of unlinked tracks and combines them into linked encodings
 * This can happen when a track uses the "domain" property
 */
function combineUnlinkedTracks(unlinkedTracks: TrackLink[]): LinkedEncoding[] {
    console.warn('unlinkedTracks', unlinkedTracks);
    const linkedEncodings: LinkedEncoding[] = [];
    unlinkedTracks.forEach(trackLink => {
        const existingLink = linkedEncodings.find(link => link.linkingId && link.linkingId === trackLink.linkingId);
        if (existingLink) {
            existingLink.tracks.push({ id: trackLink.trackId, encoding: trackLink.encoding });
            if (trackLink.signal) {
                existingLink.signal = trackLink.signal;
            }
        } else {
            // TODO: handle default domain better.
            // We might just want to remove this link all together if it doesn't have a domain
            const DEFAULT_DOMAIN = [0, 3088269832];
            const newLink = {
                linkingId: trackLink.linkingId,
                tracks: [],
                signal: signal(DEFAULT_DOMAIN) // this signal will get replaced if the track has a domain
            } as LinkedEncoding;
            newLink.tracks.push({ id: trackLink.trackId, encoding: trackLink.encoding });
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
 * Helper function to get linked tracks by linkingId
 */
function getLinkedTracks(linkingId: string | undefined, trackLinks: TrackLink[]) {
    if (!linkingId) return [];
    return trackLinks.filter(trackLink => trackLink.linkingId === linkingId);
}

/**
 * Traverses the gosling spec to find all the linked tracks and brushes
 */
function getLinkedFeaturesRecursive(gs: GoslingSpec): LinkInfo {
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
            const newLinks = getLinkedFeaturesRecursive(view);
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
    // Helper function to create a track link for the x encoding
    function createXTrackLink(trackId: string, track: Track, trackType: TrackType, gs: SingleView) {
        const trackLink = {
            trackId: trackId,
            linkingId: track.x.linkingId,
            trackType,
            encoding: 'x'
        } as TrackLink;
        // If the track has a domain, we create a signal and add it to the trackLink
        if (track.x.domain !== undefined) {
            const { assembly } = gs;
            const domain = getDomain(track.x.domain, assembly);
            trackLink.signal = signal(domain);
        }
        return trackLink;
    }

    const { tracks } = gs;
    const trackLinks: TrackLink[] = [];
    tracks.forEach(track => {
        const trackType = isHeatmapTrack(track) ? TrackType.Heatmap : TrackType.Gosling;

        // Handle the y domain when we have a heatmap track
        if (trackType === TrackType.Heatmap) {
            const { assembly, xDomain, yDomain } = gs;
            const trackDomain = getDomain(yDomain ?? xDomain, assembly); // default to the xDomain if no yDomain
            const trackLink = {
                trackId: track.id,
                linkingId: track.y.linkingId, // we may or may not have a linkingId
                trackType,
                encoding: 'y',
                signal: signal(trackDomain)
            } as TrackLink;
            trackLinks.push(trackLink);
        }
        // Handle x domain
        if ('x' in track && track.x && 'linkingId' in track.x && track.x?.linkingId !== undefined) {
            if (track.mark === 'brush') console.warn('Track with brush mark should only be used as an overlay');
            const trackLink = createXTrackLink(track.id, track, trackType, gs);
            trackLinks.push(trackLink);
        }

        // Handle linking in the brushes which are defined in the overlay tracks
        if (!('_overlay' in track)) return;
        // Handle special case where we have a single overlay track that is not a brush
        if (track._overlay.length === 1 && track._overlay[0].mark !== 'brush') {
            const firstOverlay = track._overlay[0];
            const trackLink = createXTrackLink(track.id, firstOverlay, trackType, gs);
            trackLinks.push(trackLink);
            return;
        }
        // Handle case where we have multiple overlay tracks (we only care about the brushes)
        track._overlay!.forEach(overlay => {
            if (overlay.mark === 'brush') {
                const trackType = gs.layout === 'linear' ? TrackType.BrushLinear : TrackType.BrushCircular;
                const trackLink = {
                    trackId: overlay.id,
                    linkingId: overlay.x.linkingId,
                    trackType,
                    encoding: 'brush'
                };
                if (overlay.x.domain !== undefined) {
                    const { assembly } = gs;
                    const domain = getDomain(overlay.x.domain, assembly);
                    trackLink.signal = signal(domain);
                }
                trackLinks.push(trackLink);
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
        const hasXEncoding = 'x' in track;
        const hasLinkingId = hasXEncoding && track.x && 'linkingId' in track.x && track.x?.linkingId;

        // If the track is already linked to something else, we don't need to add it again
        if (!hasXEncoding || hasLinkingId) return;

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
    const hasOnlyInterval = 'interval' in xDomain && !('chromosome' in xDomain);
    const hasOnlyChromosome = 'chromosome' in xDomain && !('interval' in xDomain);
    const hasBoth = 'chromosome' in xDomain && 'interval' in xDomain;

    if (typeof xDomain === 'string') {
        position = xDomain;
    } else if (hasOnlyInterval) {
        position = `chr:${xDomain.interval[0]}-${xDomain.interval[1]}`;
    } else if (hasOnlyChromosome) {
        position = xDomain.chromosome;
    } else if (hasBoth) {
        position = `${xDomain.chromosome}:${xDomain.interval[0]}-${xDomain.interval[1]}`;
    }
    return position;
}
