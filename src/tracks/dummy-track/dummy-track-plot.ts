import { DummyTrackClass } from './dummy-track';
import { type DummyTrackOptions } from './dummy-track';

export class DummyTrack extends DummyTrackClass {
    constructor(options: DummyTrackOptions, overlayDiv: HTMLElement) {
        // If there is already an svg element, use it. Otherwise, create a new one
        // If we do not reuse the same SVG element, we cannot have multiple brushes on the same track.
        const existingSvgElement = overlayDiv.querySelector('svg');
        const svgElement = existingSvgElement || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        if (!existingSvgElement) {
            svgElement.style.width = `${overlayDiv.clientWidth}px`;
            svgElement.style.height = `${overlayDiv.clientHeight}px`;
            overlayDiv.appendChild(svgElement);
        }
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
