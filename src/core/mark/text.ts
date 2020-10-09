import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import { group } from 'd3-array';
import { getValueUsingChannel, IsStackedMark } from '../gemini.schema.guards';

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

    /* track size */
    const trackHeight = trackInfo.dimensions[1];

    /* row separation */
    const rowCategories = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

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

    /* styles */
    const dy = spec.style?.dy ?? 0;

    /* render */
    if (IsStackedMark(spec)) {
        const rowGraphics = tile.graphics; // new HGC.libraries.PIXI.Graphics(); // only one row for stacked marks

        const genomicChannel = tm.getGenomicChannel();
        if (!genomicChannel || !genomicChannel.field) {
            console.warn('Genomic field is not provided in the specification');
            return;
        }
        const pivotedData = group(data, d => d[genomicChannel.field as string]);
        const xKeys = [...pivotedData.keys()];

        // TODO: users may want to align rows by values
        xKeys.forEach(k => {
            let prevYEnd = 0;
            pivotedData.get(k)?.forEach(d => {
                const text = tm.encodedProperty('text', d);
                const color = tm.encodedProperty('color', d);
                const x = tm.encodedProperty('x', d);
                const xe = tm.encodedProperty('xe', d);
                const cx = tm.encodedProperty('x-center', d);
                const y = tm.encodedProperty('y', d) + dy;

                if (cx < 0 || (spec.width && cx > spec.width)) {
                    // we do not draw texts that are out of the view
                    return;
                }

                if (trackInfo.textsBeingUsed > 1000) {
                    // TODO:
                    // we do not draw a large number of texts for the performance
                    // return;
                }

                let textGraphic;
                if (trackInfo.textGraphics.length > trackInfo.textsBeingUsed) {
                    textGraphic = trackInfo.textGraphics[trackInfo.textsBeingUsed];
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
                trackInfo.textsBeingUsed++;

                const alphaTransition = tm.markVisibility(d, metric);
                if (!text || alphaTransition === 0) {
                    trackInfo.textsBeingUsed--;
                    textGraphic.visible = false;
                    return;
                }

                textGraphic.alpha = alphaTransition;

                textGraphic.resolution = 8;
                textGraphic.updateText();

                textGraphic.texture.baseTexture.scaleMode = HGC.libraries.PIXI.SCALE_MODES.NEAREST;

                const sprite = new HGC.libraries.PIXI.Sprite(textGraphic.texture);
                sprite.x = x;
                sprite.y = rowHeight - y - prevYEnd;
                sprite.width = xe - x;
                sprite.height = y;

                rowGraphics.addChild(sprite);

                prevYEnd += y;
            });
        });
    } else {
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
                const y = tm.encodedProperty('y', d) + dy;

                if (cx < 0 || (spec.width && cx > spec.width)) {
                    // we do not draw texts that are out of the view
                    return;
                }

                if (trackInfo.textsBeingUsed > 1000) {
                    // we do not draw a large number of texts for the performance
                    return;
                }

                let textGraphic;
                if (trackInfo.textGraphics.length > trackInfo.textsBeingUsed) {
                    textGraphic = trackInfo.textGraphics[trackInfo.textsBeingUsed];
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
                trackInfo.textsBeingUsed++;

                const alphaTransition = tm.markVisibility(d, metric);
                if (!text || alphaTransition === 0) {
                    trackInfo.textsBeingUsed--;
                    textGraphic.visible = false;
                    return;
                }

                textGraphic.alpha = alphaTransition;
                textGraphic.anchor.x = 0.5;
                textGraphic.anchor.y = 0.5;
                textGraphic.position.x = cx; // xe ? (xe + x) / 2.0 : x;
                textGraphic.position.y = rowPosition + rowHeight - y;

                rowGraphics.addChild(textGraphic);
            });
        });
    }
}
