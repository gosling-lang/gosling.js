import * as PIXI from 'pixi.js';
import { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import type { SingleTrack } from '@gosling-lang/gosling-schema';
import { getTheme } from '../utils/theme';
import { drawWithinLink } from './withinLink';

describe('Rendering link', () => {
    const g = new PIXI.Graphics();
    const trackInfo = { dimensions: [100, 100] };
    it('Linear Band', () => {
        const t: SingleTrack = {
            data: { type: 'csv', url: '' },
            mark: 'withinLink',
            x: { field: 'x', type: 'genomic' },
            xe: { field: 'xe', type: 'genomic' },
            x1: { field: 'x1', type: 'genomic' },
            x1e: { field: 'x1e', type: 'genomic' },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, x1: 2, xe: 3, x1e: 4 },
            { x: 11, x1: 22, xe: 33, x1e: 44 },
            { x: 111, x1: 222, xe: 333, x1e: 444 }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawWithinLink(g, trackInfo, model);
    });
    it('Circular Band', () => {
        const t: SingleTrack = {
            layout: 'circular',
            data: { type: 'csv', url: '' },
            mark: 'withinLink',
            x: { field: 'x', type: 'genomic' },
            xe: { field: 'xe', type: 'genomic' },
            x1: { field: 'x1', type: 'genomic' },
            x1e: { field: 'x1e', type: 'genomic' },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, x1: 2, xe: 3, x1e: 4 },
            { x: 11, x1: 22, xe: 33, x1e: 44 },
            { x: 111, x1: 222, xe: 333, x1e: 444 }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawWithinLink(g, trackInfo, model);
    });
    it('Linear line', () => {
        const t: SingleTrack = {
            layout: 'linear',
            data: { type: 'csv', url: '' },
            mark: 'withinLink',
            x: { field: 'x', type: 'genomic' },
            xe: { field: 'xe', type: 'genomic' },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, x1: 2, xe: 3, x1e: 4 },
            { x: 11, x1: 22, xe: 33, x1e: 44 },
            { x: 111, x1: 222, xe: 333, x1e: 444 }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawWithinLink(g, trackInfo, model);
    });
    it('Circular line', () => {
        const t: SingleTrack = {
            layout: 'circular',
            data: { type: 'csv', url: '' },
            mark: 'withinLink',
            x: { field: 'x', type: 'genomic' },
            xe: { field: 'xe', type: 'genomic' },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, x1: 2, xe: 3, x1e: 4 },
            { x: 11, x1: 22, xe: 33, x1e: 44 },
            { x: 111, x1: 222, xe: 333, x1e: 444 }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawWithinLink(g, trackInfo, model);
    });
});
