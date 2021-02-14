import { DEFAULT_VIEW_SPACING } from '../layout/defaults';
import { getBoundingBox, getRelativeTrackInfo } from './bounding-box';

describe('Arrangement', () => {
    it('1 View, 1 Track', () => {
        const spec = { tracks: [{ overlay: [], width: 10, height: 10 }] };
        const info = getRelativeTrackInfo(spec);
        expect(info).toHaveLength(1);

        expect(info[0].track).toEqual(spec.tracks[0]);
        expect(info[0].boundingBox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
        expect(info[0].layout).toEqual({ x: 0, y: 0, w: 12, h: 12 });
    });

    it('1 View, 1 Track (N Overlaid Tracks)', () => {
        const spec1 = {
            tracks: [
                { overlay: [], width: 10, height: 10 },
                { overlay: [], width: 10, height: 10 }
            ]
        };
        const spec2 = {
            tracks: [
                { overlay: [{}, {}, {}], width: 10, height: 10 },
                { overlay: [], width: 10, height: 10 }
            ]
        };
        const spec3 = {
            tracks: [
                { overlay: [], width: 10, height: 10 },
                { overlay: [], width: 10, height: 10, overlayOnPreviousTrack: true },
                { overlay: [], width: 10, height: 10, overlayOnPreviousTrack: true },
                { overlay: [], width: 10, height: 10 }
            ]
        };
        expect(getBoundingBox(getRelativeTrackInfo(spec1))).toEqual(getBoundingBox(getRelativeTrackInfo(spec2)));
        expect(getBoundingBox(getRelativeTrackInfo(spec1))).toEqual(getBoundingBox(getRelativeTrackInfo(spec3)));
    });

    it('1 View, N Tracks', () => {
        const spec = {
            tracks: [
                { overlay: [], width: 10, height: 10 },
                { overlay: [], width: 10, height: 10 }
            ]
        };
        const info = getRelativeTrackInfo(spec);
        expect(info).toHaveLength(2);

        expect(info[0].track).toEqual(spec.tracks[0]);
        expect(info[0].boundingBox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
        expect(info[0].layout).toEqual({ x: 0, y: 0, w: 12, h: (10 / 20) * 12 });

        expect(info[1].track).toEqual(spec.tracks[1]);
        expect(info[1].boundingBox).toEqual({ x: 0, y: 10, width: 10, height: 10 });
        expect(info[1].layout).toEqual({ x: 0, y: 6, w: 12, h: (10 / 20) * 12 });
    });

    it('Palallel Views', () => {
        const spec = {
            parallelViews: [
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                },
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                }
            ]
        };
        const info = getRelativeTrackInfo(spec);
        expect(info).toHaveLength(4);

        const size = getBoundingBox(info);
        expect(size).toEqual({ width: 10, height: 40 + DEFAULT_VIEW_SPACING });

        expect(info[0].boundingBox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
        expect(info[1].boundingBox).toEqual({ x: 0, y: 10, width: 10, height: 10 });
        expect(info[2].boundingBox).toEqual({ x: 0, y: 20 + DEFAULT_VIEW_SPACING, width: 10, height: 10 });
        expect(info[3].boundingBox).toEqual({ x: 0, y: 30 + DEFAULT_VIEW_SPACING, width: 10, height: 10 });
    });

    it('Serial Views', () => {
        const spec = {
            serialViews: [
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                },
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                }
            ]
        };
        const info = getRelativeTrackInfo(spec);
        expect(info).toHaveLength(4);

        const size = getBoundingBox(info);
        expect(size).toEqual({ width: 20 + DEFAULT_VIEW_SPACING, height: 20 });

        expect(info[0].boundingBox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
        expect(info[1].boundingBox).toEqual({ x: 0, y: 10, width: 10, height: 10 });
        expect(info[2].boundingBox).toEqual({ x: 10 + DEFAULT_VIEW_SPACING, y: 0, width: 10, height: 10 });
        expect(info[3].boundingBox).toEqual({ x: 10 + DEFAULT_VIEW_SPACING, y: 10, width: 10, height: 10 });
    });

    it('Parallel Views === VConcat Views in Linear Layout', () => {
        const spec1 = {
            parallelViews: [
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                },
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                }
            ]
        };
        const spec2 = {
            vconcatViews: [
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                },
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                }
            ]
        };
        expect(getRelativeTrackInfo(spec1)).toEqual(getRelativeTrackInfo(spec2));
    });

    it('Serial Views === HConcat Views in Linear Layout', () => {
        const spec1 = {
            serialViews: [
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                },
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                }
            ]
        };
        const spec2 = {
            hconcatViews: [
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                },
                {
                    tracks: [
                        { overlay: [], width: 10, height: 10 },
                        { overlay: [], width: 10, height: 10 }
                    ]
                }
            ]
        };
        expect(getRelativeTrackInfo(spec1)).toEqual(getRelativeTrackInfo(spec2));
    });

    it('Complex Parallel Views in Linear Layout', () => {
        {
            const t = { overlay: [], width: 10, height: 10 };
            const spec = {
                parallelViews: [
                    {
                        parallelViews: [{ tracks: [t] }]
                    },
                    {
                        parallelViews: [{ tracks: [t] }]
                    }
                ]
            };
            const info = getRelativeTrackInfo(spec);
            expect(info).toHaveLength(2);

            const size = getBoundingBox(info);
            expect(size).toEqual({ width: 10, height: 20 + DEFAULT_VIEW_SPACING });

            expect(info[0].boundingBox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
            expect(info[1].boundingBox).toEqual({ x: 0, y: 10 + DEFAULT_VIEW_SPACING, width: 10, height: 10 });
        }
    });

    it('Complex Serial Views in Linear Layout', () => {
        {
            const t = { overlay: [], width: 10, height: 10 };
            const spec = {
                serialViews: [
                    {
                        serialViews: [{ tracks: [t] }]
                    },
                    {
                        serialViews: [{ tracks: [t] }]
                    }
                ]
            };
            const info = getRelativeTrackInfo(spec);
            expect(info).toHaveLength(2);

            const size = getBoundingBox(info);
            expect(size).toEqual({ width: 20 + DEFAULT_VIEW_SPACING, height: 10 });

            expect(info[0].boundingBox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
            expect(info[1].boundingBox).toEqual({ x: 10 + DEFAULT_VIEW_SPACING, y: 0, width: 10, height: 10 });
        }
    });

    it('Complex Views in Linear Layout', () => {
        {
            const t = { overlay: [], width: 10, height: 10 };
            const spec1 = {
                parallelViews: [
                    { tracks: [t] },
                    {
                        serialViews: [{ tracks: [t] }]
                    }
                ]
            };
            const spec2 = {
                parallelViews: [{ tracks: [t] }, { tracks: [t] }]
            };
            expect(getRelativeTrackInfo(spec1)).toEqual(getRelativeTrackInfo(spec2));
        }
        {
            const t = { overlay: [], width: 10, height: 10 };
            const spec1 = {
                serialViews: [
                    { tracks: [t] },
                    {
                        serialViews: [{ tracks: [t] }]
                    }
                ]
            };
            const spec2 = {
                serialViews: [{ tracks: [t] }, { tracks: [t] }]
            };
            expect(getRelativeTrackInfo(spec1)).toEqual(getRelativeTrackInfo(spec2));
        }
        {
            const t = { overlay: [], width: 10, height: 10 };
            const spec = {
                serialViews: [
                    {
                        parallelViews: [{ tracks: [t] }, { tracks: [t] }]
                    },
                    {
                        serialViews: [{ tracks: [t] }]
                    }
                ]
            };
            const info = getRelativeTrackInfo(spec);
            expect(info).toHaveLength(3);

            const size = getBoundingBox(info);
            expect(size).toEqual({ width: 20 + DEFAULT_VIEW_SPACING, height: 20 + DEFAULT_VIEW_SPACING });

            expect(info[0].boundingBox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
            expect(info[1].boundingBox).toEqual({ x: 0, y: 10 + DEFAULT_VIEW_SPACING, width: 10, height: 10 });
            expect(info[2].boundingBox).toEqual({ x: 10 + DEFAULT_VIEW_SPACING, y: 0, width: 10, height: 10 });
        }
    });

    it('Uneven Size of Views', () => {
        {
            const t = { overlay: [], width: 10, height: 10 };
            const t_2w = { overlay: [], width: 20, height: 10 };
            const spec = {
                serialViews: [
                    {
                        parallelViews: [{ tracks: [t] }, { tracks: [t_2w] }]
                    },
                    {
                        serialViews: [{ tracks: [t] }]
                    }
                ]
            };
            const info = getRelativeTrackInfo(spec);
            expect(info).toHaveLength(3);

            const size = getBoundingBox(info);
            expect(size).toEqual({ width: 30 + DEFAULT_VIEW_SPACING, height: 20 + DEFAULT_VIEW_SPACING });

            expect(info[0].boundingBox).toEqual({ x: 0, y: 0, width: 10, height: 10 });
            expect(info[1].boundingBox).toEqual({ x: 0, y: 10 + DEFAULT_VIEW_SPACING, width: 20, height: 10 });
            expect(info[2].boundingBox).toEqual({ x: 20 + DEFAULT_VIEW_SPACING, y: 0, width: 10, height: 10 });
        }
    });
});
