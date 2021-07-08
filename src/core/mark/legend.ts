import { GoslingTrackModel } from '../gosling-track-model';
import { IsChannelDeep } from '../gosling.schema.guards';
import colorToHex from '../utils/color-to-hex';
import { getTheme, Theme } from '../utils/theme';
import { Dimension } from '../utils/position';
import { ScaleLinear } from 'd3-scale';

export const getLegendTextStyle = (fill = 'black', fontWeight = 'normal') => {
    return {
        fontSize: '12px',
        fontFamily: 'sans-serif', // 'Arial',
        fontWeight,
        fill,
        background: 'white',
        lineJoin: 'round'
        // Other possible options:
        // stroke: '#ffffff',
        // strokeThickness: 2
    };
};

export function drawColorLegend(HGC: any, trackInfo: any, tile: any, tm: GoslingTrackModel, theme: Theme = 'light') {
    const spec = tm.spec();

    if (!IsChannelDeep(spec.color) || !spec.color.legend) {
        // This means we do not need to draw a legend
        return;
    }

    switch (spec.color.type) {
        case 'nominal':
            drawColorLegendCategories(HGC, trackInfo, tile, tm, theme);
            break;
        case 'quantitative':
            drawColorLegendQuantitative(HGC, trackInfo, tile, tm, theme);
            break;
    }
}

export function drawColorLegendQuantitative(
    HGC: any,
    trackInfo: any,
    tile: any,
    tm: GoslingTrackModel,
    theme: Theme = 'light'
) {
    const spec = tm.spec();

    if (!IsChannelDeep(spec.color) || spec.color.type !== 'quantitative' || !spec.color.legend) {
        // This means we do not need to draw legend
        return;
    }

    /* track size */
    const [trackX, trackY] = trackInfo.position;
    const [trackWidth] = trackInfo.dimensions;

    /* Visual Parameters */
    const legendWidth = 80;
    const legendHeight = 110;
    const colorBarDim: Dimension = {
        top: 10,
        left: 55,
        width: 20,
        height: 90
    };
    const legendX = trackX + trackWidth - legendWidth - 1;
    const legendY = trackY + 1;

    /* Legend Components */
    const colorScale = tm.getChannelScale('color');
    const colorDomain = tm.getChannelDomainArray('color');

    if (!colorScale || !colorDomain) {
        // We do not have enough information for creating a color legend
        return;
    }

    /* render */
    const graphics = trackInfo.pBorder; // use pBorder not to be affected by zoomming

    // Background
    graphics.beginFill(colorToHex(getTheme(theme).legend.background), getTheme(theme).legend.backgroundOpacity);
    graphics.lineStyle(
        1,
        colorToHex(getTheme(theme).legend.backgroundStroke),
        getTheme(theme).legend.backgroundOpacity, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.drawRect(legendX, legendY, legendWidth, legendHeight);

    // Color bar
    const [startValue, endValue] = colorDomain as [number, number];
    const extent = endValue - startValue;
    [...Array(colorBarDim.height).keys()].forEach(y => {
        // For each pixel, draw a small rectangle with different color
        const value = ((colorBarDim.height - y) / colorBarDim.height) * extent + startValue;

        graphics.beginFill(
            colorToHex(colorScale(value)),
            1 // alpha
        );
        graphics.lineStyle(
            1,
            colorToHex(getTheme(theme).legend.backgroundStroke),
            0, // alpha
            0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        graphics.drawRect(legendX + colorBarDim.left, legendY + colorBarDim.top + y, colorBarDim.width, 1);
    });

    // Ticks & labels
    const tickCount = Math.max(Math.ceil(colorBarDim.height / 40), 1);
    let ticks = (colorScale as ScaleLinear<any, any>)
        .ticks(tickCount)
        .filter(v => colorDomain[0] <= v && v <= colorDomain[1]);

    if (ticks.length === 1) {
        // Sometimes, ticks() gives a single value, so use a larger tickCount.
        ticks = (colorScale as ScaleLinear<any, any>)
            .ticks(tickCount + 1)
            .filter(v => colorDomain[0] <= v && v <= colorDomain[1]);
    }
    const TICK_STROKE_SIZE = 1;
    graphics.lineStyle(
        TICK_STROKE_SIZE,
        colorToHex(getTheme(theme).legend.tickColor),
        1, // alpha
        0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );

    const tickEnd = legendX + colorBarDim.left;
    ticks.forEach(value => {
        let y = legendY + colorBarDim.top + colorBarDim.height - ((value - startValue) / extent) * colorBarDim.height;

        // Prevent ticks from exceeding outside of a color bar by the stroke size of ticks
        if (y === legendY + colorBarDim.top) {
            y += TICK_STROKE_SIZE / 2.0;
        } else if (y === legendY + colorBarDim.top + colorBarDim.height) {
            y -= TICK_STROKE_SIZE / 2.0;
        }

        // ticks
        graphics.moveTo(tickEnd - 3, y);
        graphics.lineTo(tickEnd, y);

        // labels
        const textGraphic = new HGC.libraries.PIXI.Text(value, getLegendTextStyle(getTheme(theme).legend.labelColor));
        textGraphic.anchor.x = 1;
        textGraphic.anchor.y = 0.5;
        textGraphic.position.x = tickEnd - 6;
        textGraphic.position.y = y;

        graphics.addChild(textGraphic);
    });
}

export function drawColorLegendCategories(
    HGC: any,
    trackInfo: any,
    tile: any,
    tm: GoslingTrackModel,
    theme: Theme = 'light'
) {
    /* track spec */
    const spec = tm.spec();
    if (!IsChannelDeep(spec.color) || spec.color.type !== 'nominal' || !spec.color.legend) {
        // This means we do not need to draw legend
        return;
    }

    /* color separation */
    const colorCategories: string[] = (tm.getChannelDomainArray('color') as string[]) ?? ['___SINGLE_COLOR___'];
    if (colorCategories.length === 0) {
        // We do not need to draw a legend for only one color
        return;
    }

    /* render */
    const graphics = trackInfo.pBorder; // use pBorder not to be affected by zoomming

    const paddingX = 10;
    const paddingY = 4;
    let cumY = paddingY;
    let maxWidth = 0;

    const recipe: { x: number; y: number; color: string }[] = [];

    if (spec.style?.inlineLegend) {
        // Show legend in a single horizontal line

        // !! reversed to add the last category first from the right side
        colorCategories
            .map(d => d)
            .reverse()
            .forEach(category => {
                if (maxWidth > trackInfo.dimensions[0]) {
                    // We do not draw labels overflow
                    return;
                }

                const color = tm.encodedValue('color', category);
                const textGraphic = new HGC.libraries.PIXI.Text(
                    category,
                    getLegendTextStyle(getTheme(theme).legend.labelColor)
                );
                textGraphic.anchor.x = 1;
                textGraphic.anchor.y = 0;
                textGraphic.position.x = trackInfo.position[0] + trackInfo.dimensions[0] - maxWidth - paddingX;
                textGraphic.position.y = trackInfo.position[1] + paddingY;

                graphics.addChild(textGraphic);

                const textStyleObj = new HGC.libraries.PIXI.TextStyle(
                    getLegendTextStyle(getTheme(theme).legend.labelColor)
                );
                const textMetrics = HGC.libraries.PIXI.TextMetrics.measureText(category, textStyleObj);

                if (cumY < textMetrics.height + paddingY * 3) {
                    cumY = textMetrics.height + paddingY * 3;
                }

                recipe.push({
                    x: trackInfo.position[0] + trackInfo.dimensions[0] - textMetrics.width - maxWidth - paddingX * 2,
                    y: trackInfo.position[1] + paddingY + textMetrics.height / 2.0,
                    color
                });

                maxWidth += textMetrics.width + paddingX * 3;
            });
    } else {
        // Show legend vertically

        if (spec.style?.legendTitle) {
            const textGraphic = new HGC.libraries.PIXI.Text(
                spec.style?.legendTitle,
                getLegendTextStyle(getTheme(theme).legend.labelColor, 'bold')
            );
            textGraphic.anchor.x = 1;
            textGraphic.anchor.y = 0;
            textGraphic.position.x = trackInfo.position[0] + trackInfo.dimensions[0] - paddingX;
            textGraphic.position.y = trackInfo.position[1] + cumY;

            const textStyleObj = new HGC.libraries.PIXI.TextStyle(
                getLegendTextStyle(getTheme(theme).legend.labelColor, 'bold')
            );
            const textMetrics = HGC.libraries.PIXI.TextMetrics.measureText(spec.style?.legendTitle, textStyleObj);

            graphics.addChild(textGraphic);

            cumY += textMetrics.height + paddingY * 2;
        }

        colorCategories.forEach(category => {
            if (cumY > trackInfo.dimensions[1]) {
                // We do not draw labels overflow
                return;
            }

            const color = tm.encodedValue('color', category);

            const textGraphic = new HGC.libraries.PIXI.Text(
                category,
                getLegendTextStyle(getTheme(theme).legend.labelColor)
            );
            textGraphic.anchor.x = 1;
            textGraphic.anchor.y = 0;
            textGraphic.position.x = trackInfo.position[0] + trackInfo.dimensions[0] - paddingX;
            textGraphic.position.y = trackInfo.position[1] + cumY;

            graphics.addChild(textGraphic);

            const textStyleObj = new HGC.libraries.PIXI.TextStyle(
                getLegendTextStyle(getTheme(theme).legend.labelColor)
            );
            const textMetrics = HGC.libraries.PIXI.TextMetrics.measureText(category, textStyleObj);

            if (maxWidth < textMetrics.width + paddingX * 3) {
                maxWidth = textMetrics.width + paddingX * 3;
            }

            recipe.push({
                x: trackInfo.position[0] + trackInfo.dimensions[0] - textMetrics.width - paddingX * 2,
                y: trackInfo.position[1] + cumY + textMetrics.height / 2.0,
                color
            });

            cumY += textMetrics.height + paddingY * 2;
        });
    }

    graphics.beginFill(colorToHex(getTheme(theme).legend.background), getTheme(theme).legend.backgroundOpacity);
    graphics.lineStyle(
        1,
        colorToHex(getTheme(theme).legend.backgroundStroke),
        getTheme(theme).legend.backgroundOpacity, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.drawRect(
        trackInfo.position[0] + trackInfo.dimensions[0] - maxWidth - 1,
        trackInfo.position[1] + 1,
        maxWidth,
        cumY - paddingY
    );

    recipe.forEach(r => {
        graphics.lineStyle(
            1,
            colorToHex('black'),
            0, // alpha
            0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        graphics.beginFill(colorToHex(r.color), 1);
        graphics.drawCircle(r.x, r.y, 4);
    });
}

export function drawRowLegend(HGC: any, trackInfo: any, tile: any, tm: GoslingTrackModel, theme: Theme = 'light') {
    /* track spec */
    const spec = tm.spec();
    if (
        !IsChannelDeep(spec.row) ||
        spec.row.type !== 'nominal' ||
        !spec.row.legend
        // || (!IsChannelDeep(spec.y) || spec.y.type !== 'nominal' || !spec.y.legend)
    ) {
        // we do not need to draw a legend
        return;
    }

    /* track size */
    // const trackHeight = trackInfo.dimensions[1];

    /* row separation */
    const rowCategories: string[] = (tm.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    // const rowHeight = trackHeight / rowCategories.length;
    if (rowCategories.length === 0) {
        // We do not need to draw a legend for only one category
        return;
    }

    /* render */
    const graphics = trackInfo.pBorder; // use pBorder not to affected by zoomming

    const paddingX = 4;
    const paddingY = 2;

    rowCategories.forEach(category => {
        const rowPosition = tm.encodedValue('row', category);

        const textGraphic = new HGC.libraries.PIXI.Text(
            category,
            getLegendTextStyle(getTheme(theme).legend.labelColor)
        );
        textGraphic.anchor.x = 0;
        textGraphic.anchor.y = 0;
        textGraphic.position.x = trackInfo.position[0] + paddingX;
        textGraphic.position.y = trackInfo.position[1] + rowPosition + paddingY;

        graphics.addChild(textGraphic);

        const textStyleObj = new HGC.libraries.PIXI.TextStyle(getLegendTextStyle(getTheme(theme).legend.labelColor));
        const textMetrics = HGC.libraries.PIXI.TextMetrics.measureText(category, textStyleObj);

        graphics.beginFill(colorToHex(getTheme(theme).legend.background), getTheme(theme).legend.backgroundOpacity);
        graphics.lineStyle(
            1,
            colorToHex(getTheme(theme).legend.backgroundStroke),
            0, // alpha
            0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        graphics.drawRect(
            trackInfo.position[0] + 1,
            trackInfo.position[1] + rowPosition + 1,
            textMetrics.width + paddingX * 2,
            textMetrics.height + paddingY * 2
        );
    });
}
