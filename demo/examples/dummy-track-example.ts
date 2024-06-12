import { PixiManager } from '@pixi-manager';
import { DummyTrack } from '@gosling-lang/dummy-track';

export function addDummyTrack(pixiManager: PixiManager) {
    new DummyTrack(
        {
            width: 350,
            height: 130,
            title: 'Placeholder',
            background: '#e6e6e6',
            textFontSize: 12,
            textFontWeight: 'normal',
            textStroke: '#000',
            textStrokeWidth: 0.1,
            outline: '#fff'
        },
        pixiManager.makeContainer({
            x: 10,
            y: 30,
            width: 350,
            height: 130
        }).overlayDiv
    );
}
