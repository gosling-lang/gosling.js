import { TextTrackClass } from './text-track';
import type { TextTrackOptions, TextTrackContext } from './text-track';
import * as PIXI from 'pixi.js';
import { fakePubSub } from '../../core/utils/fake-pub-sub';

export class TextTrack extends TextTrackClass {
    constructor(
        options: Partial<TextTrackOptions>,
        containers: {
            pixiContainer: PIXI.Container;
            overlayDiv: HTMLElement;
        }
    ) {
        const { pixiContainer, overlayDiv } = containers;
        const height = overlayDiv.clientHeight;
        const width = overlayDiv.clientWidth;

        // Setup the context object
        const context: TextTrackContext = {
            scene: pixiContainer,
            id: 'test',
            viewUid: 'test',
            pubSub: fakePubSub
        };

        super(context, options);

        // Need to set the dimensions and position of the track for it to render properly
        this.setDimensions([width, height]);
        this.setPosition([0, 0]);
    }
}
