import { PixiManager } from '@pixi-manager';
import { TextTrack } from '@gosling-lang/text-track';

export function addTextTrack(pixiManager: PixiManager) {
    const titleOptions = {
        backgroundColor: 'transparent',
        textColor: 'black',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Arial',
        offsetY: 0,
        align: 'left',
        text: 'Single-cell Epigenomic Analysis'
    };

    const titlePos = { x: 10, y: 0, width: 400, height: 24 };
    new TextTrack(titleOptions, pixiManager.makeContainer(titlePos));
}
