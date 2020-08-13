import { LIGHT_GRAY } from "../utils/colors";

export function drawZoomInstruction(HGC, obj) {

    if (!obj.zoomInstruction) {
        // assigning to the track object since we need only one of this graphics
        obj.zoomInstruction = new HGC.libraries.PIXI.Text('Zoom in to see information', {
            fontSize: "13px",
            fontFamily: "Arial",
            fill: 'black',
        });
        obj.zoomInstruction.anchor.x = 0.5;
        obj.zoomInstruction.anchor.y = 0.5;
    }

    const graphics = obj.pBorder;   // use pBorder not to affected by zoomming

    // bg
    graphics.beginFill(LIGHT_GRAY);
    graphics.drawRect(
        obj.position[0],
        obj.position[1],
        obj.dimensions[0],
        obj.dimensions[1]
    );

    // text
    obj.zoomInstruction.x = obj.position[0] + obj.dimensions[0] / 2;
    obj.zoomInstruction.y = obj.position[1] + obj.dimensions[1] / 2;

    graphics.addChild(obj.zoomInstruction);
}