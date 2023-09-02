import * as PIXI from 'pixi.js';
import * as d3Selection from 'd3-selection';
import * as d3Drag from 'd3-drag';

import { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import type { SingleTrack } from '@gosling-lang/gosling-schema';
import { getTheme } from '../utils/theme';
import { drawColorLegend } from './legend';

const mockHGC = {
    libraries: {
        PIXI,
        d3Selection,
        d3Drag
    }
};

describe('Color Legend', () => {
    const g = new PIXI.Graphics();
    it('Nominal', () => {
        const t: SingleTrack = {
            data: { type: 'csv', url: '' },
            mark: 'line',
            x: { field: 'x', type: 'genomic' },
            color: { field: 'v', type: 'quantitative', legend: true },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, y: 2 },
            { x: 11, y: 22 },
            { x: 111, y: 222 }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawColorLegend(
            mockHGC,
            {
                dimensions: [100, 400],
                position: [0, 0],
                pBorder: g
            },
            null,
            model,
            getTheme()
        );
    });

    it('Quantitative', () => {
        const t: SingleTrack = {
            layout: 'circular',
            startAngle: 0,
            endAngle: 240,
            innerRadius: 10,
            outerRadius: 40,
            data: { type: 'csv', url: '' },
            mark: 'point',
            x: { field: 'x', type: 'genomic' },
            color: { field: 'v', type: 'nominal', legend: true },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, v: '2' },
            { x: 11, v: '22' },
            { x: 111, v: '222' }
        ];
        const model = new GoslingTrackModel(t, d, getTheme());
        drawColorLegend(
            mockHGC,
            {
                dimensions: [100, 400],
                position: [0, 0],
                pBorder: g
            },
            null,
            model,
            getTheme()
        );
    });
});
