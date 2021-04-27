import { GoslingTrackModel } from '../gosling-track-model';
import { IsChannelDeep } from '../gosling.schema.guards';
import colorToHex from '../utils/color-to-hex';
import { getTheme, Theme } from '../utils/theme';
import { scaleLinear } from 'd3-scale';

/**
 * Axis text styles
 */
export const getAxisTextStyle = (fill = 'black') => {
    return {
        fontSize: '10px',
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fill,
        background: 'white',
        lineJoin: 'round'
        // stroke: '#ffffff',
        // strokeThickness: 2
    };
};

/**
 * Draw linear scale Y axis
 */
export function drawYAxis(HGC: any, trackInfo: any, tile: any, gos: GoslingTrackModel, theme: Theme = 'light') {
    const yDomain = gos.getChannelDomainArray('y');
    const yRange = gos.getChannelRangeArray('y');

    if (!gos.isShowYAxis() || !yDomain || !yRange) {
        // We do not need to draw a y-axis
        return;
    }

    /* track size */
    const [tw, th] = trackInfo.dimensions;
    const [tx, ty] = trackInfo.position;

    /* row separation */
    const rowCategories: string[] = (gos.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = th / rowCategories.length;

    if (rowHeight <= 20) {
        // Height is too narrow to draw axis
        return;
    }

    /* Axis components */
    const yChannel = gos.spec().y;
    const isLeft = IsChannelDeep(yChannel) && yChannel.axis === 'right' ? false : true; // Right only if explicitly specified
    const yScale = scaleLinear()
        .domain(yDomain as number[])
        .range(yRange as number[]);

    /* render */
    const graphics = trackInfo.pBorder;

    rowCategories.forEach((category, i) => {
        if (i !== 0) {
            // Let's draw only one y-axis since the scale is shared anyway.
            return;
        }

        const rowPosition = gos.encodedValue('row', category);
        const dx = isLeft ? tx : tx + tw;
        const dy = ty + rowPosition;

        /* Axis Baseline */
        graphics.lineStyle(
            1,
            colorToHex(getTheme(theme).axis.baselineColor),
            1, // alpha
            0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        graphics.moveTo(dx, dy);
        graphics.lineTo(dx, dy + rowHeight);

        /* Ticks */
        const EXTENT_TICK_SIZE = 8;
        const TICK_SIZE = 6;
        const tickCount = Math.max(Math.ceil(rowHeight / 40), 1);
        let ticks = yScale.ticks(tickCount).filter(v => yDomain[0] <= v && v <= yDomain[1]);

        if (ticks.length === 1) {
            // Sometimes, ticks() gives a single value, so use a larger tickCount.
            ticks = yScale.ticks(tickCount + 1).filter(v => yDomain[0] <= v && v <= yDomain[1]);
        }

        graphics.lineStyle(
            1,
            colorToHex(getTheme(theme).axis.tickColor),
            1, // alpha
            0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        let tickEnd = isLeft ? dx + TICK_SIZE : dx - TICK_SIZE;
        ticks.forEach(t => {
            const y = yScale(t);
            graphics.moveTo(dx, dy + rowHeight - y);
            graphics.lineTo(tickEnd, dy + rowHeight - y);
        });

        // Two ticks on the bottom and top
        tickEnd = isLeft ? dx + EXTENT_TICK_SIZE : dx - EXTENT_TICK_SIZE;
        graphics.moveTo(dx, dy);
        graphics.lineTo(tickEnd, dy);
        graphics.moveTo(dx, dy + rowHeight);
        graphics.lineTo(tickEnd, dy + rowHeight);

        /* Labels */
        ticks.forEach(t => {
            const y = yScale(t);
            tickEnd = isLeft ? dx + TICK_SIZE * 2 : dx - TICK_SIZE * 2;

            const textGraphic = new HGC.libraries.PIXI.Text(t, getAxisTextStyle(getTheme(theme).legend.labelColor));
            textGraphic.anchor.x = isLeft ? 0 : 1;
            textGraphic.anchor.y = y === 0 ? 0.9 : 0.5;
            textGraphic.position.x = tickEnd;
            textGraphic.position.y = dy + rowHeight - y;

            graphics.addChild(textGraphic);
        });
    });

    // const paddingX = 4;
    // const paddingY = 2;

    // rowCategories.forEach(category => {
    //     const rowPosition = gos.encodedValue('row', category);

    //     const textGraphic = new HGC.libraries.PIXI.Text(
    //         category,
    //         getLegendTextStyle(getTheme(theme).legend.labelColor)
    //     );
    //     textGraphic.anchor.x = 0;
    //     textGraphic.anchor.y = 0;
    //     textGraphic.position.x = trackInfo.position[0] + paddingX;
    //     textGraphic.position.y = trackInfo.position[1] + rowPosition + paddingY;

    //     graphics.addChild(textGraphic);

    //     const textStyleObj = new HGC.libraries.PIXI.TextStyle(getLegendTextStyle(getTheme(theme).legend.labelColor));
    //     const textMetrics = HGC.libraries.PIXI.TextMetrics.measureText(category, textStyleObj);

    //     graphics.beginFill(colorToHex(getTheme(theme).legend.background), getTheme(theme).legend.backgroundOpacity);
    //     graphics.lineStyle(
    //         1,
    //         colorToHex(getTheme(theme).legend.backgroundStroke),
    //         0, // alpha
    //         0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    //     );
    //     graphics.drawRect(
    //         trackInfo.position[0] + 1,
    //         trackInfo.position[1] + rowPosition + 1,
    //         textMetrics.width + paddingX * 2,
    //         textMetrics.height + paddingY * 2
    //     );
    // });
}
