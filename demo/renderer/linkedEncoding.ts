import { IsMultipleViews, IsSingleView, type Assembly, type SingleView } from '@gosling-lang/gosling-schema';
import { GenomicPositionHelper, computeChromSizes } from '../../src/core/utils/assembly';
import { signal, type Signal } from '@preact/signals-core';
import type { GoslingSpec } from 'gosling.js';

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
 * Info collected from the GoslingSpec that is needed to associate brushes with tracks
 */
interface BrushInfo {
    trackId: string;
    linkingId: string;
}

/**
 * Info collected from the GoslingSpec that is needed to link tracks together
 * The brushIds are added after the fact
 */
interface BrushAndEncoding {
    linkedEncodings: Omit<LinkedEncoding, 'brushIds'>[];
    brushes: BrushInfo[];
}

/**
 * Extracts the linked encodings from a GoslingSpec
 */
export function getLinkedEncodings(gs: GoslingSpec) {
    // First, we traverse the gosling spec to find all the linked tracks and brushes
    const { linkedEncodings, brushes } = getLinedFeaturesRecursive(gs) as {
        linkedEncodings: LinkedEncoding[];
        brushes: BrushInfo[];
    };
    // We need to associate the brushes with the linked encodings
    linkedEncodings.forEach(le => {
        le.brushIds = [];
    });
    brushes.forEach(brush => {
        const { trackId, linkingId } = brush;
        linkedEncodings.forEach(le => {
            if (le.linkingId === linkingId) {
                le.brushIds.push(trackId);
            }
        });
    });
    return linkedEncodings;
}

/**
 * Traverses the gosling spec to find all the linked tracks and brushes
 */
function getLinedFeaturesRecursive(gs: GoslingSpec): BrushAndEncoding {
    // Base case: single view
    if (IsSingleView(gs)) {
        const linkedEncodings = getSingleViewLinkedEncoding(gs);
        const brushes = getSingleViewBrushes(gs);
        return { linkedEncodings: [linkedEncodings], brushes };
    }
    const linked: BrushAndEncoding = { linkedEncodings: [], brushes: [] };
    // Recursive case: multiple views
    if (IsMultipleViews(gs)) {
        gs.views.forEach(view => {
            const newLinks = getLinedFeaturesRecursive(view);
            linked.linkedEncodings.push(...newLinks.linkedEncodings);
            linked.brushes.push(...newLinks.brushes);
        });
    }
    return linked;
}

/**
 * Extracts the linkingId from tracks that have a brush overlay
 */
function getSingleViewBrushes(gs: SingleView): BrushInfo[] {
    const { tracks } = gs;
    const brushes: BrushInfo[] = [];
    tracks.forEach(track => {
        if (!('_overlay' in track)) return;
        track._overlay!.forEach(overlay => {
            if (overlay.mark === 'brush') {
                brushes.push({ trackId: track.id, linkingId: overlay.x.linkingId });
            }
        });
    });
    return brushes;
}

/**
 * Links all of the tracks in a single view together
 */
function getSingleViewLinkedEncoding(gs: SingleView) {
    const { tracks, xDomain, assembly } = gs;
    const domain = getDomain(xDomain, assembly);

    const newLink: Omit<LinkedEncoding, 'brushIds'> = {
        linkingId: gs.linkingId || '',
        encoding: 'x',
        signal: signal(domain),
        trackIds: []
    };
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
