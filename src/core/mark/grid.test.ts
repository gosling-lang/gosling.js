import * as PIXI from 'pixi.js';
import { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import type { SingleTrack } from '@gosling-lang/gosling-schema';
import { getTheme } from '../utils/theme';
import { drawGrid } from './grid';

describe('Grid', () => {
    const g = new PIXI.Graphics();
    const HGC = {
        dimensions: [100, 400],
        position: [0, 0],
        pBackground: g
    };
    it('Linear Y Grid', () => {
        const t: SingleTrack = {
            data: { type: 'csv', url: '' },
            mark: 'line',
            x: { field: 'x', type: 'genomic' },
            y: { field: 'y', type: 'quantitative', grid: true },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, y: 2 },
            { x: 11, y: 22 },
            { x: 111, y: 222 }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawGrid(HGC, model, getTheme());
    });

    it('Linear Row Grid', () => {
        const t: SingleTrack = {
            data: { type: 'csv', url: '' },
            mark: 'line',
            x: { field: 'x', type: 'genomic' },
            row: { field: 'y', type: 'nominal', grid: true },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, y: '2' },
            { x: 11, y: '22' },
            { x: 111, y: '222' }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawGrid(HGC, model, getTheme());
    });

    it('Circular Y Grid', () => {
        const t: SingleTrack = {
            layout: 'circular',
            startAngle: 0,
            endAngle: 240,
            innerRadius: 10,
            outerRadius: 40,
            data: { type: 'csv', url: '' },
            mark: 'line',
            x: { field: 'x', type: 'genomic' },
            y: { field: 'y', type: 'quantitative', grid: true },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, y: 2 },
            { x: 11, y: 22 },
            { x: 111, y: 222 }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawGrid(HGC, model, getTheme());
    });

    it('Circular Row Grid', () => {
        const t: SingleTrack = {
            layout: 'circular',
            startAngle: 0,
            endAngle: 240,
            innerRadius: 10,
            outerRadius: 40,
            data: { type: 'csv', url: '' },
            mark: 'line',
            x: { field: 'x', type: 'genomic' },
            row: { field: 'y', type: 'nominal', grid: true },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, y: '2' },
            { x: 11, y: '22' },
            { x: 111, y: '222' }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawGrid(HGC, model, getTheme());
    });
});
