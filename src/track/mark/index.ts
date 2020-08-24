import { GeminiTrackModel } from '../../lib/gemini-track-model';
import { drawPoint } from './point';
import { drawLine } from './line';
import { drawBar } from './bar';
import { drawArea } from './area';
import { drawRect } from './rect';
import { ChannelTypes } from '../../lib/gemini.schema';

export const SUPPORTED_CHANNELS: (keyof typeof ChannelTypes)[] = [
    'color',
    'x',
    'y',
    'size',
    'row',
    'stroke',
    'strokeWidth',
    'opacity'
    // ...
];

export const RESOLUTION = 4;

/**
 * Draw a track based on the track specification in a Gemini grammar.
 */
export function drawMark(HGC: any, trackInfo: any, tile: any) {
    /**
     * TODO: Major Missing Things That We Need To Support Here
     * (1) Supporting vertical tracks
     * (2) Covering differet field type combinations, other than 1G, 1C, 1Q (e.g., multiple stacked bar charts)
     * (3) Get opacity of marks
     * (4) Draw axis for individual rows
     * (5) Misconnection between tiles (e.g., lines)
     * (6) Differentiate categorical colors from quantitative colors
     * (7) SVG support
     * (8) Layering multiple tracks
     * (9) Genomic coordinates on both x and y axes
     * (10) Tooltip
     * (11) Legends
     * (12) Glyph
     * (13) Data aggregation
     * (14) Ellipse instead of circle
     * (15) If invalide spec, show message
     * (16) Gap between rows
     * (17) Incorrect scale at the end of the genomic coordinate
     * (18) Scaling not consistent with zoom level
     * (19) Occasional black screen when zoomed in
     */

    if (!tile.geminiModel) {
        // we do not have a track model prepared to render a visualization
        return;
    }

    /* spec */
    const gm = tile.geminiModel as GeminiTrackModel;
    const spec = gm.spec();

    switch (spec.mark) {
        case 'point':
            drawPoint(HGC, trackInfo, tile);
            break;
        case 'bar':
            drawBar(HGC, trackInfo, tile);
            break;
        case 'line':
            drawLine(HGC, trackInfo, tile);
            break;
        case 'area':
            drawArea(HGC, trackInfo, tile);
            break;
        case 'rect':
            drawRect(HGC, trackInfo, tile);
            break;
        default:
            console.warn('Unsupported mark type');
            break;
    }

    if (!tile.rowScale || !tile.spriteInfos) {
        console.warn('Information for resaling tiles is not properly generated after drawing a track');
    }
}
