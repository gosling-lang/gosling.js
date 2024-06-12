import { DummyTrackClass } from './dummy-track';
import { type DummyTrackOptions } from './dummy-track';

export class DummyTrack extends DummyTrackClass {
    constructor(options: DummyTrackOptions, overlayDiv: HTMLElement) {
        const height = overlayDiv.clientHeight;
        const width = overlayDiv.clientWidth;
        // Create a new svg element. The brush will be drawn on this element
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.style.width = `${width}px`;
        svgElement.style.height = `${height}px`;
        // Add it to the overlay div
        overlayDiv.appendChild(svgElement);

        // Setup the context object
        const context = {
            id: 'test',
            svgElement: svgElement,
            getTheme: () => 'light'
        };

        super(context, options);
    }
}
