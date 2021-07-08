import { GoslingTrackModel } from '../gosling-track-model';
import { IsChannelDeep } from '../gosling.schema.guards';
import colorToHex from '../utils/color-to-hex';
import { getTheme, Theme } from '../utils/theme';
import { scaleLinear } from 'd3-scale';
import { cartesianToPolar, valueToRadian } from '../utils/polar';

const EXTENT_TICK_SIZE = 8;
const TICK_SIZE = 6;

/**
 * Axis text styles
 */
export const getAxisTextStyle = (fill = 'black') => {
    return {
        fontSize: '10px',
        fontFamily: 'sans-serif', // 'Arial',
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
export function drawLinearYAxis(HGC: any, trackInfo: any, tile: any, gos: GoslingTrackModel, theme: Theme = 'light') {
    const spec = gos.spec();
    const CIRCULAR = spec.layout === 'circular';
    const yDomain = gos.getChannelDomainArray('y');
    const yRange = gos.getChannelRangeArray('y');

    if (CIRCULAR) {
        // Wrong function call, this is for linear tracks!
        return;
    }

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
    const isLeft = IsChannelDeep(yChannel) && yChannel.axis === 'right' ? false : true; // Right position only if explicitly specified
    const yScale = scaleLinear()
        .domain(yDomain as number[])
        .range(yRange as number[]);

    /* render */
    const graphics = trackInfo.pBorder;

    rowCategories.forEach(category => {
        // if (rowCategories.length > 1 ? i !== 1 : i !== 0) {
        //     // Let's draw only one y-axis since the scale is shared anyway.
        //     // Draw the second y-axis if exist, so that track title is not occluded by the y-axis.
        //     return;
        // }

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

            const textGraphic = new HGC.libraries.PIXI.Text(t, getAxisTextStyle(getTheme(theme).axis.labelColor));
            textGraphic.anchor.x = isLeft ? 0 : 1;
            textGraphic.anchor.y = y === 0 ? 0.9 : 0.5;
            textGraphic.position.x = tickEnd;
            textGraphic.position.y = dy + rowHeight - y;

            graphics.addChild(textGraphic);
        });
    });
}

/**
 * Draw linear scale Y axis
 */
export function drawCircularYAxis(HGC: any, trackInfo: any, tile: any, gos: GoslingTrackModel, theme: Theme = 'light') {
    const spec = gos.spec();
    const CIRCULAR = spec.layout === 'circular';
    const yDomain = gos.getChannelDomainArray('y');
    const yRange = gos.getChannelRangeArray('y');

    if (!CIRCULAR) {
        // Wrong function call, this is for circular tracks.
        return;
    }

    if (!gos.isShowYAxis() || !yDomain || !yRange) {
        // We do not need to draw a y-axis
        return;
    }

    /* track size */
    const [tw, th] = [spec.width, spec.height];

    /* circular parameters */
    const trackInnerRadius = spec.innerRadius ?? 220;
    const trackOuterRadius = spec.outerRadius ?? 300;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const cx = tw / 2.0;
    const cy = th / 2.0;

    /* row separation */
    const rowCategories: string[] = (gos.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = th / rowCategories.length;

    if ((rowHeight / th) * trackRingSize <= 20) {
        // Height is too narrow to draw axis
        return;
    }

    /* Axis components */
    const yChannel = gos.spec().y;
    const isLeft = IsChannelDeep(yChannel) && yChannel.axis === 'right' ? false : true; // Right position only if explicitly specified
    const yScale = scaleLinear()
        .domain(yDomain as number[])
        .range(yRange as number[]);

    /* render */
    const graphics = tile.graphics; // We do not use `pBorder` as in linear layouts.

    rowCategories.forEach(category => {
        // if (rowCategories.length > 1 ? i !== 1 : i !== 0) {
        //     // Let's draw only one y-axis since the scale is shared anyway.
        //     // Draw the second y-axis if exist, so that track title is not occluded by the y-axis.
        //     return;
        // }

        const rowPosition = gos.encodedValue('row', category);

        /* Axis Baseline */
        const innerR = trackOuterRadius - ((rowPosition + rowHeight) / th) * trackRingSize;
        const outerR = trackOuterRadius - (rowPosition / th) * trackRingSize;
        const innerPos = cartesianToPolar(isLeft ? 0 : tw, tw, innerR, cx, cy, startAngle, endAngle);
        const outerPos = cartesianToPolar(isLeft ? 0 : tw, tw, outerR, cx, cy, startAngle, endAngle);

        graphics.lineStyle(
            1,
            colorToHex(getTheme(theme).axis.baselineColor),
            1, // alpha
            0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        graphics.moveTo(innerPos.x, innerPos.y);
        graphics.lineTo(outerPos.x, outerPos.y);

        /* Ticks */
        // Since we use the polar system, we use numbers 'scaled' for the polar system.
        const SCALED_TICK_SIZE = (r: number) => (TICK_SIZE * tw) / 2 / Math.PI / r;
        const SCALED_EXTENT_TICK_SIZE = (r: number) => (EXTENT_TICK_SIZE * tw) / 2 / Math.PI / r;

        // Determine ticks to display
        const axisHeight = (rowHeight / th) * trackRingSize;
        const tickCount = Math.max(Math.ceil(axisHeight / 40), 1);
        let ticks = yScale.ticks(tickCount).filter(v => yDomain[0] <= v && v <= yDomain[1]);

        if (ticks.length === 1) {
            // Sometimes, ticks() gives a single tick (e.g., only baseline), so let's use a larger tickCount.
            ticks = yScale.ticks(tickCount + 1).filter(v => yDomain[0] <= v && v <= yDomain[1]);
        }

        // Render ticks
        graphics.lineStyle(
            1,
            colorToHex(getTheme(theme).axis.tickColor),
            1, // alpha
            0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        ticks.forEach(t => {
            const y = yScale(t);

            // The current position, i.e., radius, of this tick
            const currentR = trackOuterRadius - ((rowPosition + rowHeight - y) / th) * trackRingSize;

            // Ticks are drawn in anti-clockwise direction
            const scaledStartX = isLeft ? 0 : tw - SCALED_TICK_SIZE(currentR);
            const scaledEndX = isLeft ? SCALED_TICK_SIZE(currentR) : tw;

            // The position of a tick in the polar system
            const pos = cartesianToPolar(scaledStartX, tw, currentR, cx, cy, startAngle, endAngle);
            const startRad = valueToRadian(scaledStartX, tw, startAngle, endAngle);
            const endRad = valueToRadian(scaledEndX, tw, startAngle, endAngle);

            // Render a tick
            graphics.moveTo(pos.x, pos.y);
            graphics.arc(cx, cy, currentR, startRad, endRad, true);
            graphics.arc(cx, cy, currentR, endRad, startRad, false);
            graphics.closePath();
        });

        // Two ticks on the bottom and top
        {
            // The inner tick
            const scaledStartX = isLeft ? 0 : tw - SCALED_EXTENT_TICK_SIZE(trackInnerRadius);
            const scaledEndX = isLeft ? SCALED_EXTENT_TICK_SIZE(trackInnerRadius) : tw;

            const startRad = valueToRadian(scaledStartX, tw, startAngle, endAngle);
            const endRad = valueToRadian(scaledEndX, tw, startAngle, endAngle);

            graphics.moveTo(innerPos.x, innerPos.y);
            graphics.arc(cx, cy, trackInnerRadius, startRad, endRad, true);
            graphics.arc(cx, cy, trackInnerRadius, endRad, startRad, false);
            graphics.closePath();
        }
        {
            // The outer tick
            const scaledStartX = isLeft ? 0 : tw - SCALED_EXTENT_TICK_SIZE(trackOuterRadius);
            const scaledEndX = isLeft ? SCALED_EXTENT_TICK_SIZE(trackOuterRadius) : tw;

            const startRad = valueToRadian(scaledStartX, tw, startAngle, endAngle);
            const endRad = valueToRadian(scaledEndX, tw, startAngle, endAngle);

            graphics.moveTo(outerPos.x, outerPos.y);
            graphics.arc(cx, cy, trackOuterRadius, startRad, endRad, true);
            graphics.arc(cx, cy, trackOuterRadius, endRad, startRad, false);
            graphics.closePath();
        }

        /* Labels */
        ticks.forEach(t => {
            const y = yScale(t);

            // The current position, i.e., radius, of this label
            const currentR = trackOuterRadius - ((rowPosition + rowHeight - y) / th) * trackRingSize;

            // The position of a tick in the polar system
            const pos = cartesianToPolar(SCALED_TICK_SIZE(currentR) * 2, tw, currentR, cx, cy, startAngle, endAngle);

            // ! Maybe combine this part with `axis-plugin-track.ts`
            const textGraphic = new HGC.libraries.PIXI.Text(t, getAxisTextStyle(getTheme(theme).axis.labelColor));
            textGraphic.anchor.x = isLeft ? 1 : 0;
            textGraphic.anchor.y = 0.5;
            textGraphic.position.x = pos.x;
            textGraphic.position.y = pos.y;

            textGraphic.resolution = 4;
            const txtStyle = new HGC.libraries.PIXI.TextStyle(getAxisTextStyle());
            const metric = HGC.libraries.PIXI.TextMetrics.measureText(textGraphic.text, txtStyle);

            // Scale the width of text label so that its width is the same when converted into circular form
            const txtWidth = ((metric.width / (2 * currentR * Math.PI)) * tw * 360) / (endAngle - startAngle);
            const scaledStartX = isLeft
                ? SCALED_TICK_SIZE(currentR) * 2
                : tw - SCALED_TICK_SIZE(currentR) * 2 - txtWidth;
            const scaledEndX = isLeft ? SCALED_TICK_SIZE(currentR) * 2 + txtWidth : tw - SCALED_TICK_SIZE(currentR) * 2;

            // Determine the points of a rope element for a lebel
            const ropePoints: number[] = [];
            for (let i = scaledEndX; i >= scaledStartX; i -= txtWidth / 10.0) {
                const p = cartesianToPolar(i, tw, currentR, cx, cy, startAngle, endAngle);
                ropePoints.push(new HGC.libraries.PIXI.Point(p.x, p.y));
            }

            // Render a label
            textGraphic.updateText();
            const rope = new HGC.libraries.PIXI.SimpleRope(textGraphic.texture, ropePoints);
            graphics.addChild(rope);
        });
    });
}
