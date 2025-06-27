import { PixiManager } from '@pixi-manager';
import { HeatmapTrack } from '@gosling-lang/heatmap';
import { DataFetcher } from '@higlass/datafetcher';
import { fakePubSub } from '../../src/core/utils/fake-pub-sub';
import { signal } from '@preact/signals-core';
import { panZoomHeatmap } from '@gosling-lang/interactors';

export function addHeatmap(pixiManager: PixiManager) {
    // Let's add a heatmap
    const heatmapPosition = { x: 500, y: 30, width: 400, height: 400 };
    const dataFetcher = new DataFetcher(
        {
            server: 'http://higlass.io/api/v1',
            tilesetUid: 'CQMd6V_cRw6iCI_-Unl3PQ'
        },
        fakePubSub
    );
    const xDomain = signal<[number, number]>([0, 3088269832]);
    const yDomain = signal<[number, number]>([0, 3088269832]);
    const heatmap = new HeatmapTrack(
        {
            trackBorderWidth: 1,
            trackBorderColor: 'black',
            colorbarPosition: 'topRight'
        },
        dataFetcher,
        pixiManager.makeContainer(heatmapPosition)
    );
    heatmap.addInteractor(plot => panZoomHeatmap(plot, xDomain, yDomain));
}
