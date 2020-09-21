import { GeminiTrackModel } from '../../core/gemini-track-model';
import { getValueUsingChannel, Channel } from '../../core/gemini.schema';
// import { RESOLUTION } from '.';

export function drawRule(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = tm.data();

    /* track size */
    const trackHeight = trackInfo.dimensions[1];

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* information for rescaling tiles */
    tile.rowScale = tm.getChannelScale('row');
    tile.spriteInfos = []; // sprites for individual rows or columns

    /* style */
    const dashed = spec.style?.dashed;
    const linePattern = spec.style?.linePattern;
    const curved = spec.style?.curve;

    /* constant values */
    const strokeWidth = tm.visualProperty('strokeWidth');

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
            const x = tm.visualProperty('x', d);
            const xe = tm.visualProperty('xe', d);
            const y = tm.visualProperty('y', d);
            const color = tm.visualProperty('color', d);
            const opacity = tm.visualProperty('opacity', d);

            rowGraphics.lineStyle(
                strokeWidth,
                colorToHex(color),
                opacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            if (dashed) {
                const [dashSize, gapSize] = dashed;
                let curPos = x;

                do {
                    rowGraphics.moveTo(curPos, rowPosition + rowHeight - y);
                    rowGraphics.lineTo(curPos + dashSize, rowPosition + rowHeight - y);
                    curPos += dashSize + gapSize;
                } while (curPos < xe);
            } else {
                if (curved === undefined) {
                    rowGraphics.moveTo(x, rowPosition + rowHeight - y);
                    rowGraphics.lineTo(xe, rowPosition + rowHeight - y);
                } else if (curved === 'top') {
                    // TODO: to default value
                    const CURVE_HEIGHT = 2;
                    ///

                    const xm = x + (xe - x) / 2.0;

                    rowGraphics.moveTo(x, rowPosition + rowHeight - y + CURVE_HEIGHT / 2.0);
                    rowGraphics.lineTo(xm, rowPosition + rowHeight - y - CURVE_HEIGHT / 2.0);
                    rowGraphics.moveTo(xm, rowPosition + rowHeight - y - CURVE_HEIGHT / 2.0);
                    rowGraphics.lineTo(xe, rowPosition + rowHeight - y + CURVE_HEIGHT / 2.0);
                }
            }

            // TODO: do not support using pattern with curved
            if (linePattern) {
                const { type: pType, size: pSize } = linePattern;
                let curPos = x;

                rowGraphics.lineStyle(0);

                // TODO: to default value
                const PATTERN_GAP_SIZE = pSize * 2;
                ///

                do {
                    const x0 = curPos;
                    const x1 = curPos + pSize;
                    const ym = rowPosition + rowHeight - y;
                    const y0 = ym - pSize / 2.0;
                    const y1 = ym + pSize / 2.0;

                    rowGraphics.beginFill(colorToHex(color), opacity);
                    rowGraphics.drawPolygon(
                        pType === 'triangle-l' ? [x1, y0, x0, ym, x1, y1, x1, y0] : [x0, y0, x1, ym, x0, y1, x0, y0]
                    );
                    rowGraphics.endFill();
                    curPos += pSize + PATTERN_GAP_SIZE;
                } while (curPos < xe);
            }
        });
    });
}
