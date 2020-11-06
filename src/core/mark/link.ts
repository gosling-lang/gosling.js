import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import { getValueUsingChannel } from '../gemini.schema.guards';

export function drawLink(HGC: any, trackInfo: any, tile: any, tm: GeminiTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = tm.data();

    /* track size */
    const [trackWidth, trackHeight] = trackInfo.dimensions;

    /* genomic scale */
    const xScale = trackInfo._xScale;

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* render */
    const g = tile.graphics;

    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            // TODO: support y1, y1e
            const xValue = getValueUsingChannel(d, spec.x as Channel) as number;
            const xeValue = getValueUsingChannel(d, spec.xe as Channel) as number;
            const x1Value = getValueUsingChannel(d, spec.x1 as Channel) as number;
            const x1eValue = getValueUsingChannel(d, spec.x1e as Channel) as number;
            const colorValue = getValueUsingChannel(d, spec.color as Channel) as string;

            let x = xScale(xValue);
            let xe = xScale(xeValue);
            let x1 = xScale(x1Value);
            let x1e = xScale(x1eValue);

            const color = tm.encodedValue('color', colorValue);
            const opacity = tm.encodedValue('opacity');

            // stroke
            g.lineStyle(
                tm.encodedValue('strokeWidth'),
                colorToHex(tm.encodedValue('stroke')),
                opacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            const botY = rowPosition + rowHeight;

            if (x1Value !== undefined && x1eValue !== undefined && xValue !== x1Value && xeValue !== x1eValue) {
                // TODO: Better way to simply this line (i.e., 'none' for 0 opacity)?
                g.beginFill(color === 'none' ? 'white' : colorToHex(color), color === 'none' ? 0 : opacity);

                g.moveTo(x, botY);

                if (spec.style?.circularLink) {
                    if (x + xe > x1 + x1e) {
                        // swap
                        const tempX = x;
                        const tempXe = xe;
                        x = x1;
                        xe = x1e;
                        x1 = tempX;
                        x1e = tempXe;
                    }

                    if (x > trackWidth || x1e < 0 || Math.abs(x1e - x) < 0.5) {
                        // Do not draw very small visual marks
                        return;
                    }

                    g.arc((x + x1e) / 2.0, botY, (x1e - x) / 2.0, -Math.PI, 0, false);
                    // g.lineTo(xe, botY);
                    g.arc((xe + x1) / 2.0, botY, (x1 - xe) / 2.0, 0, -Math.PI, true);
                    // g.lineTo(x, botY);
                    g.closePath();
                } else {
                    g.lineTo(x1, rowPosition + rowHeight);
                    g.bezierCurveTo(
                        x1 + (xe - x1) / 3.0,
                        // rowPosition + (x1 - x),
                        rowPosition + rowHeight - (xe - x1) / 2.0, //Math.min(rowHeight - (x1 - x), (xe - x1) / 2.0),
                        x1 + ((xe - x1) / 3.0) * 2,
                        // rowPosition + (x1 - x),
                        rowPosition + rowHeight - (xe - x1) / 2.0, //Math.min(rowHeight - (x1 - x), (xe - x1) / 2.0),
                        xe,
                        rowPosition + rowHeight
                    );
                    g.lineTo(x1e, rowPosition + rowHeight);
                    g.bezierCurveTo(
                        x + ((x1e - x) / 3.0) * 2,
                        // rowPosition,
                        rowPosition + rowHeight - (x1e - x) / 2.0, //Math.min(rowHeight, (x1e - x) / 2.0),
                        x + (x1e - x) / 3.0,
                        // rowPosition,
                        rowPosition + rowHeight - (x1e - x) / 2.0, //Math.min(rowHeight, (x1e - x) / 2.0),
                        x,
                        rowPosition + rowHeight
                    );
                    g.endFill();
                }
            } else {
                if (xe - x <= 0.1) {
                    // Do not draw very small links
                    return;
                }

                const midX = (x + xe) / 2.0;

                g.moveTo(x, botY);

                if (spec.style?.circularLink) {
                    if (xe < 0 || x > trackWidth) {
                        return;
                    }
                    // TODO: Better way to simply this line (i.e., 'none' for 0 opacity)?
                    g.beginFill(color === 'none' ? 'white' : colorToHex(color), color === 'none' ? 0 : opacity);
                    g.arc(midX, botY, (xe - x) / 2.0, -Math.PI, Math.PI);
                    g.closePath();
                } else {
                    g.bezierCurveTo(
                        x + (xe - x) / 3.0,
                        // rowPosition,
                        rowPosition + rowHeight - Math.min(rowHeight, (xe - x) / 2.0),
                        x + ((xe - x) / 3.0) * 2,
                        // rowPosition,
                        rowPosition + rowHeight - Math.min(rowHeight, (xe - x) / 2.0),
                        xe,
                        rowPosition + rowHeight
                    );
                }
            }
        });
    });
}
