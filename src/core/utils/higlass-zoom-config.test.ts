import type { HiGlassSpec, View } from '@gosling-lang/higlass-schema';
import { preverseZoomStatus } from './higlass-zoom-config';

describe('Management of HiGlass view configs', () => {
    const viewBase: Pick<View, 'tracks' | 'layout'> = {
        tracks: {
            top: [],
            left: [],
            center: [],
            right: [],
            bottom: [],
            gallery: [],
            whole: []
        },
        layout: {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        }
    };
    const prev: HiGlassSpec = {
        views: [{ ...viewBase, uid: 'existing-view', initialXDomain: [0, 1], initialYDomain: [0, 1] }],
        zoomLocks: { locksByViewUid: {}, locksDict: {} },
        locationLocks: { locksByViewUid: {}, locksDict: {} }
    };
    it('Should preserve zoom status', () => {
        const cur: HiGlassSpec = {
            views: [
                { ...viewBase, uid: 'existing-view', initialXDomain: [0, 1], initialYDomain: [0, 1] },
                { ...viewBase, uid: 'new-view', initialXDomain: [0, 999], initialYDomain: [0, 999] }
            ],
            zoomLocks: {
                locksByViewUid: {
                    'existing-view': 'lock-id',
                    'new-view': 'lock-id'
                },
                locksDict: {}
            },
            locationLocks: { locksByViewUid: {}, locksDict: {} }
        };
        preverseZoomStatus(cur, prev);
        expect(cur.views[0].initialXDomain).toEqual(cur.views[1].initialXDomain);
    });
    it("Shouldn't preserve zoom status", () => {
        // This example is a new visualization, not containing any previous view.
        const cur: HiGlassSpec = {
            views: [
                { ...viewBase, uid: 'new-view-1', initialXDomain: [0, 1], initialYDomain: [0, 1] },
                { ...viewBase, uid: 'new-view-2', initialXDomain: [0, 999], initialYDomain: [0, 999] }
            ],
            zoomLocks: {
                locksByViewUid: {
                    'new-view-1': 'lock-id',
                    'new-view-2': 'lock-id'
                },
                locksDict: {}
            },
            locationLocks: { locksByViewUid: {}, locksDict: {} }
        };
        preverseZoomStatus(cur, prev);
        expect(cur.views[0].initialXDomain).not.toEqual(cur.views[1].initialXDomain);
    });
});
