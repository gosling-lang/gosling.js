import { GeminiTrackModel } from '../gemini-track-model';
import { IsChannelDeep } from '../gemini.schema.guards';

export const TITLE_STYLE = {
    fontSize: '12px',
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fill: 'black',
    background: 'white',
    lineJoin: 'round'
};

export function drawChartOutlines(HGC: any, trackInfo: any, tm: GeminiTrackModel) {
    /* helper */
    const { colorToHex } = HGC.utils;

    const graphics = trackInfo.pBorder; // use pBorder not to affected by zoomming

    if (tm.spec().title) {
        const paddingX = 10;
        const paddingY = 3;

        const text = tm.spec().title;
        const textGraphic = new HGC.libraries.PIXI.Text(text, { ...TITLE_STYLE });
        textGraphic.anchor.x = 1;
        textGraphic.anchor.y = 0;
        textGraphic.position.x = trackInfo.position[0] + trackInfo.dimensions[0] - paddingX;
        textGraphic.position.y = trackInfo.position[1] + paddingY;
        graphics.addChild(textGraphic);

        const textStyleObj = new HGC.libraries.PIXI.TextStyle(TITLE_STYLE);
        const textMetrics = HGC.libraries.PIXI.TextMetrics.measureText(text, textStyleObj);
        const textWidth = textMetrics.width;
        const textHeight = textMetrics.height;
        graphics.beginFill(colorToHex('white'), 0.7);
        graphics.lineStyle(
            1,
            colorToHex('#DBDBDB'),
            0.7, // alpha
            0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        graphics.drawRect(
            trackInfo.position[0] + trackInfo.dimensions[0] - textWidth - paddingX * 2,
            trackInfo.position[1],
            textWidth + paddingX * 2,
            textHeight + paddingY * 2
        );
    }

    // Rectangular outline
    graphics.lineStyle(
        1,
        // TODO: outline not working
        colorToHex(tm.spec().style?.outline ?? '#DBDBDB'),
        1, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.beginFill(colorToHex('white'), 0);
    graphics.drawRect(trackInfo.position[0], trackInfo.position[1], trackInfo.dimensions[0], trackInfo.dimensions[1]);

    // Borders
    const x = tm.spec().x;
    if (IsChannelDeep(x) && x.axis === 'top') {
        graphics.lineStyle(
            1,
            colorToHex('black'),
            1, // alpha
            0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        // top
        graphics.moveTo(trackInfo.position[0], trackInfo.position[1]);
        graphics.lineTo(trackInfo.position[0] + trackInfo.dimensions[0], trackInfo.position[1]);

        // bottom
        // graphics.lineStyle(
        //     1,
        //     colorToHex('black'),
        //     1, // alpha
        //     1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        // );
        // graphics.moveTo(trackInfo.position[0], trackInfo.position[1] + trackInfo.dimensions[1]);
        // graphics.lineTo(trackInfo.position[0] + trackInfo.dimensions[0], trackInfo.position[1] + trackInfo.dimensions[1]);

        // left
        // graphics.lineStyle(
        //     1,
        //     colorToHex('black'),
        //     1, // alpha
        //     1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        // );
        // graphics.moveTo(trackInfo.position[0], trackInfo.position[1]);
        // graphics.lineTo(trackInfo.position[0], trackInfo.position[1] + trackInfo.dimensions[1]);
    }
}
