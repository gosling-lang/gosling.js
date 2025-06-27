import * as PIXI from 'pixi.js';
import { scaleLinear } from 'd3-scale';
import { effect, Signal } from '@preact/signals-core';
import { type Plot } from '../tracks/utils';

/**
 * This interactor shows a cursor that follows the mouse
 */
export function cursor2D(
    plot: Plot & { pMasked: PIXI.Container },
    cursorPosX: Signal<number>,
    cursorPosY: Signal<number>
) {
    const xDomain = plot.xDomain.value;
    const yDomain = plot.yDomain?.value;

    if (!yDomain) {
        // No sufficient information to draw 2D cursor
        return;
    }

    const baseScaleX = scaleLinear().domain(xDomain).range([0, plot.domOverlay.clientWidth]);
    const baseScaleY = scaleLinear().domain(yDomain).range([0, plot.domOverlay.clientHeight]);

    const cursorX = new PIXI.Graphics();
    cursorX.lineStyle(1, 'black', 1);
    cursorX.moveTo(0, 0);
    cursorX.lineTo(0, plot.domOverlay.clientHeight);
    plot.pMasked.addChild(cursorX);

    const cursorY = new PIXI.Graphics();
    cursorY.lineStyle(1, 'black', 1);
    cursorY.moveTo(0, 0);
    cursorY.lineTo(plot.domOverlay.clientWidth, 0);
    plot.pMasked.addChild(cursorY);

    // This function will be called every time the user moves the mouse
    const moveCursor = (event: MouseEvent) => {
        // Move the cursor to the mouse position
        cursorX.position.x = event.offsetX;
        cursorY.position.y = event.offsetY;
        // Calculate the genomic position of the cursor
        const newScaleX = baseScaleX.domain(xDomain);
        const genomicPosX = newScaleX.invert(event.offsetX);
        cursorPosX.value = genomicPosX;
        const newScaleY = baseScaleY.domain(yDomain);
        const genomicPosY = newScaleY.invert(event.offsetY);
        cursorPosY.value = genomicPosY;
    };
    plot.domOverlay.addEventListener('mousemove', moveCursor);
    plot.domOverlay.addEventListener('mouseleave', () => {
        cursorPosX.value = -10; // TODO: set cursor visibility to false instead
        cursorPosY.value = -10; // TODO: set cursor visibility to false instead
    });

    // Every time the domain gets changed we want to update the cursor
    effect(() => {
        const newScaleX = baseScaleX.domain(xDomain);
        cursorX.position.x = newScaleX(cursorPosX.value);
        const newScaleY = baseScaleY.domain(yDomain);
        cursorY.position.y = newScaleY(cursorPosY.value);
    });
}
