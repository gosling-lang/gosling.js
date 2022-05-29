import * as PIXI from 'pixi.js';
import { getTheme } from '@gosling/theme';
import { GoslingTrackModel } from '../gosling-track-model';
import { drawLine } from './line';

import type { SingleTrack } from '@gosling/schema';

describe('Rendering Point', () => {
    const g = new PIXI.Graphics();
    it('Simple', () => {
        const t: SingleTrack = {
            data: { type: 'csv', url: '' },
            mark: 'line',
            x: { field: 'x', type: 'genomic' },
            y: { field: 'y', type: 'quantitative' },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, y: 2 },
            { x: 11, y: 22 },
            { x: 111, y: 222 }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawLine(g, model, 100, 100);
    });
});
