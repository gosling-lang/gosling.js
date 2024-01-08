import type { GoslingSpec } from '@gosling-lang/gosling-schema';
import { alignmentWithText } from './responsive-alignment';

const commonProps = { width: 800, height: 400, xAxis: false, rowLegend: false, colorLegend: false };
export const EX_SPEC_PERF_ALIGNMENT: GoslingSpec = {
    zoomLimits: [1, 396],
    xDomain: { interval: [350, 396] },
    assembly: 'unknown',
    title: 'Smoother Zoom',
    subtitle: 'Rather than redrawing every element at every frame, we can scale existing elements',
    views: [
        {
            tracks: [
                {
                    ...alignmentWithText(commonProps),
                    title: 'New Approach: Stretching Tiles',
                    experimental: { stretchGraphics: true }
                }
            ]
        },
        {
            tracks: [
                {
                    ...alignmentWithText(commonProps),
                    title: 'Original Approach'
                }
            ]
        }
    ]
};
