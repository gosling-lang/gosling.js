import { GeminiTrackModel } from '../../core/gemini-track-model';
import { getValueUsingChannel, Channel } from '../../core/gemini.schema';
// import { RESOLUTION } from '.';

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

    const style = {
        fontSize: '12px',
        fontFamily: 'Arial',
        fill: 'black',
        lineJoin: 'round',
        stroke: '#ffffff',
        strokeThickness: 2
    };
    const textStyle = new HGC.libraries.PIXI.TextStyle(style);
    let textAdded = 0;

    /* render */
    rowCategories.forEach(rowCategory => {
        // we are separately drawing each row so that y scale can be more effectively shared across tiles without rerendering from the bottom
        const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics();
        const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const text = tm.encodedProperty('text', d);
            const color = tm.encodedProperty('color', d);
            const x = tm.encodedProperty('x', d);
            const xe = tm.encodedProperty('xe', d);
            const y = tm.encodedProperty('y', d);

            if ((xe && xe < 0) || (spec.width && x > spec.width)) {
                // we do not draw texts that are out of the view
                return;
            }

            if (textAdded > 50) {
                // we do not draw many texts for the performance
                return;
            }

            let textGraphic;
            if (trackInfo.textGraphics.length > textAdded) {
                textGraphic = trackInfo.textGraphics[textAdded];
                textGraphic.style.fill = color;
                textGraphic.visible = true;
                textGraphic.text = text;
            } else {
                textGraphic = new HGC.libraries.PIXI.Text(text, {
                    ...style,
                    fill: color
                });
                trackInfo.textGraphics.push(textGraphic);
            }

            const metric = HGC.libraries.PIXI.TextMetrics.measureText(text, textStyle);
            textAdded++;

            if (!text || (xe && xe - x < metric.width + 10)) {
                textAdded--;
                textGraphic.visible = false;
                return;
            }

            textGraphic.position.x = (x - metric.width) / 2.0 + (xe ? xe / 2.0 : 0);
            textGraphic.position.y = rowPosition + y - metric.height / 2.0;

            rowGraphics.addChild(textGraphic);
        });
    });
}
