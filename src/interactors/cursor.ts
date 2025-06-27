import * as PIXI from 'pixi.js';
import { scaleLinear } from 'd3-scale';
import { effect, Signal } from '@preact/signals-core';
import { type Plot } from '../tracks/utils';

/**
 * This interactor shows a cursor that follows the mouse
 */
export function cursor(plot: Plot & { pMasked: PIXI.Container }, cursorPos: Signal<number>) {
    const baseScale = scaleLinear().domain(plot.xDomain.value).range([0, plot.domOverlay.clientWidth]);

    const cursor = new PIXI.Graphics();
    cursor.lineStyle(1, 'black', 1);
    cursor.moveTo(0, 0);
    cursor.lineTo(0, plot.domOverlay.clientHeight);
    plot.pMasked.addChild(cursor);

    // This function will be called every time the user moves the mouse
    const moveCursor = (event: MouseEvent) => {
        // Move the cursor to the mouse position
        cursor.position.x = event.offsetX;
        // Calculate the genomic position of the cursor
        const newScale = baseScale.domain(plot.xDomain.value);
        const genomicPos = newScale.invert(event.offsetX);
        cursorPos.value = genomicPos;
    };
    plot.domOverlay.addEventListener('mousemove', moveCursor);
    plot.domOverlay.addEventListener('mouseleave', () => {
        cursorPos.value = -10; // TODO: set cursor visibility to false instead
    });

    // Every time the domain gets changed we want to update the cursor
    effect(() => {
        const newScale = baseScale.domain(plot.xDomain.value);
        cursor.position.x = newScale(cursorPos.value);
    });
}
