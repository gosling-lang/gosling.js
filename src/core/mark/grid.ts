import { ScaleLinear } from 'd3-scale';
import { GoslingTrackModel } from '../gosling-track-model';
import { IsChannelDeep } from '../gosling.schema.guards';
import colorToHex from '../utils/color-to-hex';
import { getTheme, Theme } from '../utils/theme';

export function drawGrid(HGC: any, trackInfo: any, tile: any, tm: GoslingTrackModel, theme: Theme = 'light') {
    /* track spec */
    const spec = tm.spec();
    if (!IsChannelDeep(spec.y) || spec.y.grid !== true) {
        // we do not need to draw grid
        return;
    }

    /* track size */
    const [trackX, trackY] = trackInfo.position;
    const [trackWidth, trackHeight] = trackInfo.dimensions;
    const startX = trackX;
    const endX = trackX + trackWidth;

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    /* y categories */
    // const yCategories: string[] = (tm.getChannelDomainArray('y') as string[]) ?? ['___SINGLE_Y___'];

    /* baseline */
    // const baseline = IsChannelDeep(spec.y) ? spec.y.baseline : undefined;

    /* Grid Components */
    const scale = tm.getChannelScale('y');
    const domain = tm.getChannelDomainArray('y');

    if (!scale || !domain) {
        // We do not have sufficient information to draw a grid
        return;
    }

    /* render */
    const graphics = trackInfo.pBackground;

    graphics.lineStyle(
        1,
        colorToHex(getTheme(theme).axis.gridColor),
        1, // alpha
        0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );

    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        const tickCount = Math.max(Math.ceil(rowHeight / 40), 1);

        let ticks = (scale as ScaleLinear<any, any>).ticks(tickCount).filter(v => domain[0] <= v && v <= domain[1]);

        if (ticks.length === 1) {
            // Sometimes, ticks() gives a single value, so use a larger tickCount.
            ticks = (scale as ScaleLinear<any, any>).ticks(tickCount + 1).filter(v => domain[0] <= v && v <= domain[1]);
        }

        if (tm.spec().layout === 'linear') {
            ticks.forEach(value => {
                const y = trackY + rowPosition + rowHeight - scale(value);
                graphics.moveTo(startX, y);
                graphics.lineTo(endX, y);
            });
        } else {
            // TODO:
        }

        // Baseline on the bottom
        // trackInfo.pBorder.lineStyle(
        //     0.5,
        //     colorToHex('black'),
        //     1, // alpha
        //     0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        // );
        // trackInfo.pBorder.moveTo(startX, trackY + rowPosition + rowHeight);
        // trackInfo.pBorder.lineTo(endX, trackY + rowPosition + rowHeight);

        // This is for drawing y-positions which is not ready
        // yCategories.forEach(yCategory => {
        //     const y = tm.encodedValue('y', yCategory);

        //     graphics.lineStyle(
        //         1,
        //         colorToHex(baseline === yCategory ? 'black' : 'lightgray'),
        //         1, // alpha
        //         1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        //     );

        //     graphics.moveTo(x, rowPosition + rowHeight - y);
        //     graphics.lineTo(x1, rowPosition + rowHeight - y);
        // });
    });
}
