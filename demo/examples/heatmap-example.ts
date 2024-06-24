import { PixiManager } from '@pixi-manager';
import { HeatmapTrack } from '@gosling-lang/heatmap';

export function addHeatmap(pixiManager: PixiManager) {
    // Let's add a heatmap
    const heatmapPosition = { x: 500, y: 30, width: 400, height: 400 };
    const { pixiContainer: heatmapContainer, overlayDiv: heatmapOverlayDiv } =
        pixiManager.makeContainer(heatmapPosition);
    new HeatmapTrack(heatmapContainer, heatmapOverlayDiv, {
        trackBorderWidth: 1,
        trackBorderColor: 'black',
        colorbarPosition: 'topRight'
    });
}
