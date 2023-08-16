import * as PIXI from 'pixi.js';
import { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import type { SingleTrack } from '@gosling-lang/gosling-schema';
import { getTheme } from '../utils/theme';
import { drawTriangle } from './triangle';

describe('Rendering triangle', () => {
    const g = new PIXI.Graphics();
    it('Linear Triangle', () => {
        const t: SingleTrack = {
            data: { type: 'csv', url: '' },
            mark: 'triangleLeft',
            x: { field: 'x', type: 'genomic' },
            xe: { field: 'xe', type: 'genomic' },
            y: { field: 'y', type: 'quantitative' },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, xe: 1, y: 2 },
            { x: 11, xe: 11, y: 22 },
            { x: 111, xe: 111, y: 222 }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawTriangle(g, model, 100, 100);
    });

    it('Circular Triangle', () => {
        const t: SingleTrack = {
            layout: 'circular',
            data: { type: 'csv', url: '' },
            mark: 'triangleLeft',
            x: { field: 'x', type: 'genomic' },
            xe: { field: 'xe', type: 'genomic' },
            y: { field: 'y', type: 'quantitative' },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, xe: 1, y: 2 },
            { x: 11, xe: 11, y: 22 },
            { x: 111, xe: 111, y: 222 }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawTriangle(g, model, 100, 100);
    });
});
