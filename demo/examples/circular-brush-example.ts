import { PixiManager } from '@pixi-manager';
import { BrushCircularTrack } from '@gosling-lang/brush-circular';
import { signal } from '@preact/signals-core';
import { panZoom } from '@gosling-lang/interactors';

export function addCircularBrush(pixiManager: PixiManager) {
    const pos0 = { x: 10, y: 100, width: 250, height: 250 };
    const circularDomain = signal<[number, number]>([0, 248956422]);
    const detailedDomain = signal<[number, number]>([160000000, 200000000]);
    const detailedDomain2 = signal<[number, number]>([0, 100000000]);

    const circularBrushTrackOptions = {
        projectionFillColor: 'gray',
        projectionStrokeColor: 'black',
        projectionFillOpacity: 0.3,
        projectionStrokeOpacity: 0.3,
        strokeWidth: 1,
        startAngle: 7.2,
        endAngle: 352.8,
        innerRadius: 50,
        outerRadius: 125,
        axisPositionHorizontal: 'left'
    };

    const overlayDiv = pixiManager.makeContainer(pos0).overlayDiv;

    new BrushCircularTrack(
        circularBrushTrackOptions,
        detailedDomain,
        pixiManager.makeContainer(pos0).overlayDiv
    ).addInteractor(plot => panZoom(plot, circularDomain));

    new BrushCircularTrack(
        circularBrushTrackOptions,
        detailedDomain2,
        pixiManager.makeContainer(pos0).overlayDiv
    ).addInteractor(plot => panZoom(plot, circularDomain));
}
