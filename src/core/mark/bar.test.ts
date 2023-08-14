import * as PIXI from 'pixi.js';
import type { SingleTrack } from '@gosling-lang/gosling-schema';
import { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import { getTheme } from '../utils/theme';
import { drawBar } from './bar';
import type { Tile } from '@higlass/services';

describe('mark:= bar', () => {
    it('x:=G, y:=V, ye:=V', () => {
        const t: SingleTrack = {
            data: { type: 'csv', url: '' },
            mark: 'bar',
            x: { field: 'g', type: 'genomic' },
            y: { value: 0 },
            ye: { value: 100 },
            width: 100,
            height: 100
        };
        const d = [{ g: 1 }];
        const model = new GoslingTrackModel(t, d, getTheme());
        const trackMock = {
            dimensions: [100, 100],
            tilesetInfo: {},
            getTilePosAndDimensions: () => {
                return { tileX: null, tileWidth: null };
            }
        };
        const tileMock = { graphics: new PIXI.Graphics(), tileData: {} };
        drawBar(trackMock, tileMock as Tile, model);
        // Should render all data (https://github.com/gosling-lang/gosling.js/pull/791)
        expect(model.getMouseEventModel().size()).toEqual(d.length);
    });
});
