import { PixiManager } from '@pixi-manager';
import { BrushLinearTrack } from '@gosling-lang/brush-linear';
import { signal } from '@preact/signals-core';
import { panZoom } from '@gosling-lang/interactors';

export function addLinearBrush(pixiManager: PixiManager) {
    const pos0 = { x: 10, y: 100, width: 250, height: 250 };
    const circularDomain = signal<[number, number]>([0, 248956422]);
    const detailedDomain = signal<[number, number]>([160000000, 200000000]);

    // Brush track
    const options = {
        projectionFillColor: 'red',
        projectionStrokeColor: 'red',
        projectionFillOpacity: 0.3,
        projectionStrokeOpacity: 0.3,
        strokeWidth: 1
    };
    new BrushLinearTrack(options, detailedDomain, pixiManager.makeContainer(pos0).overlayDiv).addInteractor(plot =>
        panZoom(plot, circularDomain)
    );
}
