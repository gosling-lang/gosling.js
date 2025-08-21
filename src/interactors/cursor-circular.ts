import * as PIXI from 'pixi.js';
import { scaleLinear } from 'd3-scale';
import { effect, Signal } from '@preact/signals-core';
import { type Plot } from '../tracks/utils';
import { pointsToDegree, valueToRadian } from '../core/utils/polar';
import { IsXAxis, type Track } from '@gosling-lang/gosling-schema';
import { DEFAULT_AXIS_SIZE } from '../compiler/defaults';

/**
 * Updates the circular cursor for a plot that has already been initialized
 * This should be called after setDimensions to ensure cursor uses the correct dimensions
 */
export function updateCursorCircular(
    plot: Plot & {
        pMasked: PIXI.Container;
        options?: { spec?: { innerRadius?: number; outerRadius?: number; startAngle?: number; endAngle?: number } };
    },
    cursorPos: Signal<number>
) {
    // Remove existing cursor if any
    const existingCursor = (plot as any)._circularCursor;
    if (existingCursor) {
        plot.pMasked.removeChild(existingCursor);
    }

    // Reinitialize cursor with current dimensions
    cursorCircular(plot, cursorPos);
}

/**
 * This interactor shows a cursor that follows the mouse in circular plots
 */
export function cursorCircular(
    plot: Plot & {
        pMasked: PIXI.Container;
        options?: { spec?: { innerRadius?: number; outerRadius?: number; startAngle?: number; endAngle?: number } };
    },
    cursorPos: Signal<number>
) {
    const xDomain = plot.xDomain.value;

    // Calculate center point for circular layout
    const cx = plot.domOverlay.clientWidth / 2;
    const cy = plot.domOverlay.clientHeight / 2;

    // TODO: outerRadius should already have calculated considering the x axis.
    // Get innerRadius and outerRadius from the plot spec, fallback to defaults
    const innerRadius = plot.options?.spec?.innerRadius ?? 40;
    const isAxis = IsXAxis(plot.options!.spec as Track);
    const outerRadius = (plot.options?.spec?.outerRadius ?? Math.min(cx, cy)) - (isAxis ? DEFAULT_AXIS_SIZE : 0);
    const startAngle = plot.options?.spec?.startAngle ?? 0;
    const endAngle = plot.options?.spec?.endAngle ?? 360;

    const baseScaleAngle = scaleLinear()
        .domain(xDomain)
        .range([0, 2 * Math.PI]);

    const cursor = new PIXI.Graphics();
    plot.pMasked.addChild(cursor);

    // Store cursor reference for potential removal during updates
    (plot as any)._circularCursor = cursor;

    // This function will be called every time the user moves the mouse
    const moveCursor = (event: MouseEvent) => {
        // Calculate angle in degrees
        const degree = pointsToDegree(event.offsetX, event.offsetY, cx, cy);

        // Update the cursor position signal
        const angleRange = endAngle - startAngle;
        const normalizedDegree = ((degree - startAngle + 360) % 360) / angleRange;
        const newScaleAngle = baseScaleAngle.domain(plot.xDomain.value);
        const genomicPos = newScaleAngle.invert(normalizedDegree * 2 * Math.PI);
        cursorPos.value = genomicPos;

        // Use valueToRadian for proper anticlockwise coordinate conversion
        const radian = valueToRadian(
            genomicPos - plot.xDomain.value[0],
            plot.xDomain.value[1] - plot.xDomain.value[0],
            startAngle,
            endAngle
        );

        // Draw cursor as a line with fixed length (outerRadius - innerRadius)
        cursor.clear();
        cursor.lineStyle(1, 'black', 1);
        cursor.moveTo(cx + Math.cos(radian) * innerRadius, cy + Math.sin(radian) * innerRadius);
        cursor.lineTo(cx + Math.cos(radian) * outerRadius, cy + Math.sin(radian) * outerRadius);
    };

    plot.domOverlay.addEventListener('mousemove', moveCursor);
    plot.domOverlay.addEventListener('mouseleave', () => {
        cursorPos.value = Number.NEGATIVE_INFINITY;
        cursor.clear();
    });

    // Every time the domain gets changed we want to update the cursor
    effect(() => {
        if (plot.xDomain.value[0] < cursorPos.value && cursorPos.value < plot.xDomain.value[1]) {
            const radian = valueToRadian(
                cursorPos.value - plot.xDomain.value[0],
                plot.xDomain.value[1] - plot.xDomain.value[0],
                startAngle,
                endAngle
            );

            cursor.clear();
            cursor.lineStyle(1, 'black', 1);
            cursor.moveTo(cx + Math.cos(radian) * innerRadius, cy + Math.sin(radian) * innerRadius);
            cursor.lineTo(cx + Math.cos(radian) * outerRadius, cy + Math.sin(radian) * outerRadius);
        } else {
            cursor.clear();
        }
    });
}
