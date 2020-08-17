import { LIGHT_GRAY } from '../utils/colors';

export function drawZoomInstruction(HGC: any, trackInfo: any) {
    if (!trackInfo.zoomInstruction) {
        // assigning to the track object since we need only one of this graphics
        trackInfo.zoomInstruction = new HGC.libraries.PIXI.Text('Zoom in to see information', {
            fontSize: '13px',
            fontFamily: 'Arial',
            fill: 'black'
        });
        trackInfo.zoomInstruction.anchor.x = 0.5;
        trackInfo.zoomInstruction.anchor.y = 0.5;
    }

    const graphics = trackInfo.pBorder; // use pBorder not to affected by zoomming

    // bg
    graphics.beginFill(LIGHT_GRAY);
    graphics.drawRect(trackInfo.position[0], trackInfo.position[1], trackInfo.dimensions[0], trackInfo.dimensions[1]);

    // text
    trackInfo.zoomInstruction.x = trackInfo.position[0] + trackInfo.dimensions[0] / 2;
    trackInfo.zoomInstruction.y = trackInfo.position[1] + trackInfo.dimensions[1] / 2;

    graphics.addChild(trackInfo.zoomInstruction);
}
