import { GoslingSpec, Track } from '../gosling.schema';
import { getBoundingBox, getRelativeTrackInfo } from './bounding-box';
import { traverseToFixSpecDownstream, overrideTemplates } from './spec-preprocess';

describe('Fix Spec Downstream', () => {
    it('Empty Views', () => {
        const info = getRelativeTrackInfo({
            parallelViews: [
                {
                    tracks: []
                }
            ]
        });
        const size = getBoundingBox(info);
        expect(!isNaN(+size.width) && isFinite(size.width)).toEqual(true);
        expect(!isNaN(+size.height) && isFinite(size.height)).toEqual(true);
    });
    it('static', () => {
        {
            const spec: GoslingSpec = {
                static: true,
                parallelViews: [{ tracks: [{ overlay: [], width: 0, height: 0 }] }]
            };
            traverseToFixSpecDownstream(spec);
            expect(spec.parallelViews[0].static).toEqual(true);
            expect((spec.parallelViews[0] as any).tracks[0].static).toEqual(true);
        }
        {
            const spec: GoslingSpec = {
                layout: 'circular',
                parallelViews: [{ layout: 'linear', tracks: [{ overlay: [], width: 0, height: 0 }] }]
            };
            traverseToFixSpecDownstream(spec);
            expect(spec.parallelViews[0].static).toEqual(true);
            expect((spec.parallelViews[0] as any).tracks[0].static).toEqual(true); // TODO:
        }
    });
    it('Layout in Tracks Should Be Removed', () => {
        const spec: GoslingSpec = {
            parallelViews: [
                {
                    tracks: [{ layout: 'circular', overlay: [], width: 0, height: 0 }]
                }
            ]
        };
        traverseToFixSpecDownstream(spec);
        expect((spec.parallelViews[0] as any).tracks[0].layout).toEqual('linear');
    });
});

describe('Spec Preprocess', () => {
    it('overlayOnPreviousTrack', () => {
        const spec: GoslingSpec = {
            layout: 'circular',
            tracks: [
                { data: { type: 'csv', url: '' }, mark: 'bar', overlayOnPreviousTrack: true, width: 100, height: 100 }
            ]
        };
        traverseToFixSpecDownstream(spec);

        // Should be fixed to `false` since the first track do not have a previoous track
        expect(spec.tracks[0].overlayOnPreviousTrack).toEqual(false);
    });

    it('circular layout', () => {
        const spec: GoslingSpec = {
            layout: 'circular',
            tracks: [{} as Track, { static: false } as Track]
        };
        traverseToFixSpecDownstream(spec);

        expect(spec.tracks[0].layout).toEqual('circular');

        // By default, `static` option for circular tracks are `false` since we do not currently support proper zoom/pan interactions for circular ones.
        expect(spec.tracks[0].static).toEqual(true);

        // The `static` option shouldn't be changed if it is defined by a user.
        expect(spec.tracks[1].static).toEqual(false);
    });

    it('override template (higlass-vector)', () => {
        const spec: GoslingSpec = {
            tracks: [{ data: { type: 'vector', url: '', column: 'c', value: 'v' } } as Track]
        };
        overrideTemplates(spec);
        expect(spec.tracks[0]).toHaveProperty('mark');
    });

    it('override template (higlass-multivec)', () => {
        const spec: GoslingSpec = {
            tracks: [{ data: { type: 'multivec', url: '', row: 'r', column: 'c', value: 'v' } } as Track]
        };
        overrideTemplates(spec);
        expect(spec.tracks[0]).toHaveProperty('mark');
    });
});
