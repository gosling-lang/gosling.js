import { PixiManager } from '@pixi-manager';
import { HeatmapTrack } from '@gosling-lang/heatmap';
import { DataFetcher } from '@higlass/datafetcher';
import { fakePubSub } from '@higlass/utils';
import { signal } from '@preact/signals-core';

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
    new HeatmapTrack(
        {
            trackBorderWidth: 1,
            trackBorderColor: 'black',
            colorbarPosition: 'topRight'
        },
        dataFetcher,
        pixiManager.makeContainer(heatmapPosition)
    )
}
