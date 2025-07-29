import * as PIXI from 'pixi.js';
import { scaleLinear } from 'd3-scale';
import { effect, Signal } from '@preact/signals-core';
import { type Plot } from '../tracks/utils';
import { pointsToDegree, valueToRadian } from '../core/utils/polar';
import { DEFAULT_AXIS_SIZE } from '../compiler/defaults';

/**
 * This interactor shows a cursor that follows the mouse in circular plots
 */
export function cursorCircular(
    plot: Plot & {
        pMasked: PIXI.Container;
        options?: { spec?: { innerRadius?: number; outerRadius?: number; startAngle?: number; endAngle?: number } };
    },
    cursorPosAngle: Signal<number>,
    cursorPosRadius: Signal<number>
) {
    const xDomain = plot.xDomain.value;
    const yDomain = plot.yDomain?.value;

    if (!yDomain) {
        // No sufficient information to draw circular cursor
        return;
    }

    // Calculate center point for circular layout
    const centerX = plot.domOverlay.clientWidth / 2;
    const centerY = plot.domOverlay.clientHeight / 2;

    // Get innerRadius and outerRadius from the plot spec, fallback to defaults
    // These values should already have axis adjustments applied by the track model
    const innerRadius = plot.options?.spec?.innerRadius ?? 40;
    const outerRadius = plot.options?.spec?.outerRadius ?? Math.min(centerX, centerY);
    const startAngle = plot.options?.spec?.startAngle ?? 0;
    const endAngle = plot.options?.spec?.endAngle ?? 360;

    const baseScaleAngle = scaleLinear()
        .domain(xDomain)
        .range([0, 2 * Math.PI]);
    const baseScaleRadius = scaleLinear().domain(yDomain).range([innerRadius, outerRadius]);

    const cursor = new PIXI.Graphics();
    plot.pMasked.addChild(cursor);

    // This function will be called every time the user moves the mouse
    const moveCursor = (event: MouseEvent) => {
        // Use pointsToDegree to calculate angle in degrees (0-360, starting from 12 o'clock, anticlockwise)
        const degrees = pointsToDegree(event.offsetX, event.offsetY, centerX, centerY);

        // Update cursor position signals using track's angle range
        const angleRange = endAngle - startAngle;
        const normalizedDegree = ((degrees - startAngle + 360) % 360) / angleRange;
        const newScaleAngle = baseScaleAngle.domain(xDomain);
        const genomicPosAngle = newScaleAngle.invert(normalizedDegree * 2 * Math.PI);
        cursorPosAngle.value = genomicPosAngle;

        // For radius, use the mouse position but clamp to track bounds
        const deltaX = event.offsetX - centerX;
        const deltaY = event.offsetY - centerY;
        const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const clampedRadius = Math.max(innerRadius, Math.min(outerRadius, radius));

        const newScaleRadius = baseScaleRadius.domain(yDomain);
        const genomicPosRadius = newScaleRadius.invert(clampedRadius);
        cursorPosRadius.value = genomicPosRadius;

        // Use valueToRadian for proper anticlockwise coordinate conversion
        const radiansForDrawing = valueToRadian(genomicPosAngle, xDomain[1] - xDomain[0], startAngle, endAngle);

        // Draw cursor as a line with fixed length (outerRadius - innerRadius)
        cursor.clear();
        cursor.lineStyle(1, 'black', 1);
        cursor.moveTo(
            centerX + Math.cos(radiansForDrawing) * innerRadius,
            centerY + Math.sin(radiansForDrawing) * innerRadius
        );
        cursor.lineTo(
            centerX + Math.cos(radiansForDrawing) * outerRadius,
            centerY + Math.sin(radiansForDrawing) * outerRadius
        );
    };

    plot.domOverlay.addEventListener('mousemove', moveCursor);
    plot.domOverlay.addEventListener('mouseleave', () => {
        cursorPosAngle.value = -10; // TODO: set cursor visibility to false instead
        cursorPosRadius.value = -10; // TODO: set cursor visibility to false instead
        cursor.clear();
    });

    // Every time the domain gets changed we want to update the cursor
    effect(() => {
        const newScaleAngle = baseScaleAngle.domain(xDomain);
        const newScaleRadius = baseScaleRadius.domain(yDomain);

        if (cursorPosAngle.value >= 0 && cursorPosRadius.value >= 0) {
            // Use valueToRadian for proper anticlockwise coordinate conversion
            const radiansForDrawing = valueToRadian(
                cursorPosAngle.value,
                xDomain[1] - xDomain[0],
                startAngle,
                endAngle
            );

            cursor.clear();
            cursor.lineStyle(1, 'black', 1);
            cursor.moveTo(
                centerX + Math.cos(radiansForDrawing) * innerRadius,
                centerY + Math.sin(radiansForDrawing) * innerRadius
            );
            cursor.lineTo(
                centerX + Math.cos(radiansForDrawing) * outerRadius,
                centerY + Math.sin(radiansForDrawing) * outerRadius
            );
        }
    });
}
