import type { ScaleLinear } from 'd3-scale';
import type { GoslingTrackModel } from '../../tracks/gosling-track/gosling-track-model';
import { IsChannelDeep } from '@gosling-lang/gosling-schema';
import colorToHex from '../utils/color-to-hex';
import { cartesianToPolar, valueToRadian } from '../utils/polar';
import { isNumberArray, isStringArray } from '../utils/array';
import type { CompleteThemeDeep } from '../utils/theme';

export function drawGrid(trackInfo: any, tm: GoslingTrackModel, theme: Required<CompleteThemeDeep>) {
    drawYGridQuantitative(trackInfo, tm, theme);
    drawRowGrid(trackInfo, tm, theme);
}

export function drawRowGrid(trackInfo: any, tm: GoslingTrackModel, theme: Required<CompleteThemeDeep>) {
    const spec = tm.spec();

    if (!IsChannelDeep(spec.row) || spec.row.grid !== true) {
        // we do not need to draw grid
        return;
    }

    /* track size */
    const [trackX, trackY] = trackInfo.position;
    const [trackWidth, trackHeight] = trackInfo.dimensions;

    /* circular parameters */
    const circular = tm.spec().layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220;
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    /* row separation */
    const rowCategories = tm.getChannelDomainArray('row') as string[] | undefined;

    if (!rowCategories) {
        // We do not have categories mapped to row to draw grid with
        return;
    }

    const rowHeight = trackHeight / rowCategories.length;

    if ((circular && trackRingSize <= 20) || (!circular && rowHeight <= 20)) {
        // Height is too narrow to draw axis
        return;
    }

    /* render */
    const graphics = trackInfo.pBackground;

    const strokeWidth = theme.axis.gridStrokeWidth;
    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        if (!circular) {
            graphics.lineStyle(
                strokeWidth,
                colorToHex(theme.axis.gridColor),
                1, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            const y = trackY + rowPosition + rowHeight / 2.0;
            graphics.moveTo(trackX, y);
            graphics.lineTo(trackX + trackWidth, y);
        } else {
            const y = rowPosition + rowHeight / 2.0;
            const midR = trackOuterRadius - (y / trackHeight) * trackRingSize;
            const farR = midR + strokeWidth / 2.0;
            const nearR = midR - strokeWidth / 2.0;

            const sPos = cartesianToPolar(0, trackWidth, nearR, cx, cy, startAngle, endAngle);
            const startRad = valueToRadian(0, trackWidth, startAngle, endAngle);
            const endRad = valueToRadian(trackWidth, trackWidth, startAngle, endAngle);

            // For circular grid, we draw 'filled' arc w/ zero strokeWidth
            graphics.lineStyle(
                strokeWidth,
                colorToHex('black'),
                0, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            graphics.beginFill(colorToHex(theme.axis.gridColor), 1);
            graphics.moveTo(trackX + sPos.x, trackY + sPos.y);
            graphics.arc(trackX + cx, trackY + cy, nearR, startRad, endRad, true);
            graphics.arc(trackX + cx, trackY + cy, farR, endRad, startRad, false);
            graphics.closePath();
        }
    });
}

export function drawYGridQuantitative(trackInfo: any, tm: GoslingTrackModel, theme: Required<CompleteThemeDeep>) {
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

    /* circular parameters */
    const circular = tm.spec().layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220;
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    /* row separation */
    const rowCategories = tm.getChannelDomainArray('row') ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    if (!isStringArray(rowCategories)) {
        // We do not have categories mapped to row to draw grid with
        return;
    }

    /* Grid Components */
    const scale = tm.getChannelScale('y');
    const domain = tm.getChannelDomainArray('y');

    if (!scale || !domain || !isNumberArray(domain)) {
        // We do not have sufficient information to draw a grid
        return;
    }

    if ((circular && (rowHeight / trackHeight) * trackRingSize <= 20) || (!circular && rowHeight <= 20)) {
        // Height is too narrow to draw axis
        return;
    }

    /* render */
    const graphics = trackInfo.pBackground;
    const strokeWidth = theme.axis.gridStrokeWidth;

    rowCategories.forEach(rowCategory => {
        const rowPosition = tm.encodedValue('row', rowCategory);

        const assignedHeight = circular ? (rowHeight / trackHeight) * trackRingSize : rowHeight;
        const tickCount = Math.max(Math.ceil(assignedHeight / 40), 1);

        let ticks = (scale as ScaleLinear<any, any>).ticks(tickCount).filter(v => domain[0] <= v && v <= domain[1]);

        if (ticks.length === 1) {
            // Sometimes, ticks() gives a single value, so use a larger tickCount.
            ticks = (scale as ScaleLinear<any, any>).ticks(tickCount + 1).filter(v => domain[0] <= v && v <= domain[1]);
        }

        if (!circular) {
            graphics.lineStyle(
                strokeWidth,
                colorToHex(theme.axis.gridColor),
                1, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );
            ticks.forEach(value => {
                const y = trackY + rowPosition + rowHeight - scale(value);
                if (theme.axis.gridStrokeType === 'solid') {
                    graphics.moveTo(startX, y);
                    graphics.lineTo(endX, y);
                } else if (theme.axis.gridStrokeType === 'dashed') {
                    const [line, gap] = theme.axis.gridStrokeDash ?? [1, 1];
                    // eslint-disable-next-line
                    for (let i = startX; i < endX; i += line + gap) {
                        graphics.moveTo(i, y);
                        graphics.lineTo(i + line, y);
                    }
                }
            });
        } else {
            ticks.forEach(value => {
                const y = scale(value);
                const midR = trackOuterRadius - ((rowPosition + rowHeight - y) / trackHeight) * trackRingSize;
                const farR = midR + strokeWidth / 2.0;
                const nearR = midR - strokeWidth / 2.0;

                const sPos = cartesianToPolar(0, trackWidth, nearR, cx, cy, startAngle, endAngle);
                const startRad = valueToRadian(0, trackWidth, startAngle, endAngle);
                const endRad = valueToRadian(trackWidth, trackWidth, startAngle, endAngle);

                // For circular grid, we draw 'filled' arc w/ zero strokeWidth
                graphics.lineStyle(
                    strokeWidth,
                    colorToHex('black'),
                    0, // alpha
                    0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
                );

                graphics.beginFill(colorToHex(theme.axis.gridColor), 1);
                graphics.moveTo(trackX + sPos.x, trackY + sPos.y);
                graphics.arc(trackX + cx, trackY + cy, nearR, startRad, endRad, true);
                graphics.arc(trackX + cx, trackY + cy, farR, endRad, startRad, false);
                graphics.closePath();
            });
        }
    });
}
