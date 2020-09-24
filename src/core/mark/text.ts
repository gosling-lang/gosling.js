import { GeminiTrackModel } from '../gemini-track-model';
import { getValueUsingChannel, Channel } from '../gemini.schema';

export const TEXT_STYLE_GLOBAL = {
    fontSize: '12px',
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fill: 'black',
    background: 'white',
    lineJoin: 'round',
    stroke: '#ffffff',
    strokeThickness: 2
};

export function drawText(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* data */
    const data = tm.data();

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];

    /* information for rescaling tiles */
    tile.rowScale = tm.getChannelScale('row');
    tile.spriteInfos = []; // sprites for individual rows or columns

    /* text styles */
    const localTextStyle = {
        ...TEXT_STYLE_GLOBAL,
        fontSize: spec.style?.textFontSize ? `${spec.style?.textFontSize}px` : TEXT_STYLE_GLOBAL.fontSize,
        stroke: spec.style?.textStroke ?? TEXT_STYLE_GLOBAL.stroke,
        strokeThickness: spec.style?.textStrokeWidth ?? TEXT_STYLE_GLOBAL.strokeThickness,
        fontWeight: spec.style?.textFontWeight ?? TEXT_STYLE_GLOBAL.fontWeight
    };
    const textStyleObj = new HGC.libraries.PIXI.TextStyle(localTextStyle);
    let textAdded = 0;

    /* styles */
    const dy = spec.style?.dy ?? 0;

    /* render */
    rowCategories.forEach(rowCategory => {
        // we are separately drawing each row so that y scale can be more effectively shared across tiles without rerendering from the bottom
        const rowGraphics = tile.graphics;
        const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const text = tm.encodedProperty('text', d);
            const color = tm.encodedProperty('color', d);
            const cx = tm.encodedProperty('x-center', d);
            const x = tm.encodedProperty('x', d);
            const xe = tm.encodedProperty('xe', d);
            const y = tm.encodedProperty('y', d) + dy;

            if ((xe && xe < 0) || (!xe && x < 0) || (spec.width && x > spec.width)) {
                // we do not draw texts that are out of the view
                return;
            }

            if (textAdded > 100) {
                // we do not draw a large number of texts for the performance
                return;
            }

            let textGraphic;
            if (trackInfo.textGraphics.length > textAdded) {
                textGraphic = trackInfo.textGraphics[textAdded];
                textGraphic.style.fill = color;
                textGraphic.visible = true;
                textGraphic.text = text;
                textGraphic.alpha = 1;
            } else {
                textGraphic = new HGC.libraries.PIXI.Text(text, {
                    ...localTextStyle,
                    fill: color
                });
                trackInfo.textGraphics.push(textGraphic);
            }

            const metric = HGC.libraries.PIXI.TextMetrics.measureText(text, textStyleObj);
            textAdded++;

            const alphaTransition = tm.markVisibility(d, metric);
            if (!text || alphaTransition === 0) {
                textAdded--;
                textGraphic.visible = false;
                return;
            }

            textGraphic.alpha = alphaTransition;
            textGraphic.anchor.x = 0.5;
            textGraphic.anchor.y = 0.5;
            textGraphic.position.x = cx; // xe ? (xe + x) / 2.0 : x;
            textGraphic.position.y = rowPosition + y;

            rowGraphics.addChild(textGraphic);
        });
    });
}
