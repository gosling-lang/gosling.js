import * as PIXI from 'pixi.js';

/**
 * A wrapper class for PIXI.Application
 */

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
/**
 * A wrapper class for PIXI.Application.
 * It manages the creation of PIXI containers and overlay divs.
 */
export class PixiManager {
    app: PIXI.Application<HTMLCanvasElement>;
    /** Contains the canvas and the overlayContainer */
    rootDiv: HTMLDivElement;
    /** Element which contains all of the overlay divs */
    overlayContainer: HTMLDivElement;
    /** Mapping between the position and the overlay div */
    createdContainers: Map<string, HTMLDivElement> = new Map();

    constructor(
        width: number,
        height: number,
        container: HTMLDivElement,
        fps: (fps: number) => void,
        options: { padding?: number }
    ) {
        this.app = new PIXI.Application<HTMLCanvasElement>({
            width,
            height,
            antialias: false, // When this is true, rendering is slower
            resolution: 2, // Higher resolution
            autoDensity: true, // When resolution is set, this should be true so things are scaled correctly
            view: document.createElement('canvas'),
            backgroundColor: 0xffffff,
            eventMode: 'static',
            eventFeatures: {
                move: true,
                globalMove: false,
                click: true,
                wheel: false
            }
        });
        // The wrapper div is used to add padding around the canvas
        const wrapper = document.createElement('div');
        const padding = options.padding ?? 50;
        wrapper.style.padding = `${padding}px`;
        wrapper.style.backgroundColor = 'white';
        container.appendChild(wrapper);

        // Canvas and overlay container will be added to the root div
        const rootDiv = document.createElement('div');
        rootDiv.style.position = 'relative';
        wrapper.appendChild(rootDiv);
        this.rootDiv = rootDiv;
        this.rootDiv.appendChild(this.app.view);

        // Overlays will be added to the overlay container
        this.overlayContainer = document.createElement('div');
        this.rootDiv.appendChild(this.overlayContainer);
        // Add FPS counter
        this.app.ticker.add(() => {
            fps(this.app.ticker.FPS);
        });

        console.warn('created new pixi manager');
    }

    /**
     * Returns a PIXI container and an overlay div for a given position
     * @param position
     * @returns
     */
    makeContainer(
        position: BoundingBox,
        id?: string
    ): {
        pixiContainer: PIXI.Container;
        overlayDiv: HTMLDivElement;
    } {
        const pContainer = new PIXI.Container();
        pContainer.position.set(position.x, position.y);
        this.app.stage.addChild(pContainer);

        let plotDiv: HTMLDivElement;
        const positionString = JSON.stringify(position);
        if (this.createdContainers.has(positionString)) {
            plotDiv = this.createdContainers.get(positionString)!;
        } else {
            plotDiv = createOverlayElement(position, id);
            this.createdContainers.set(positionString, plotDiv);
            this.overlayContainer.appendChild(plotDiv);
        }

        return { pixiContainer: pContainer, overlayDiv: plotDiv };
    }
    // TODO: container should be also removed from the app.stage
    clear(id: string): void {
        this.createdContainers.keys().forEach(key => {
            const div = this.createdContainers.get(key)!;
            const overlayId = div.id.split('overlay-')[1];
            if (overlayId === id) {
                this.createdContainers.delete(key);
                this.overlayContainer.removeChild(div);
                div.remove();
                return;
            }
        });
    }
    clearAll(): void {
        const children = this.app.stage.removeChildren();
        children.forEach(child => {
            child.destroy();
        });
        this.createdContainers.forEach(div => {
            div.remove();
        });
        this.createdContainers.clear();
        this.overlayContainer.innerHTML = '';
    }

    resize(width: number, height: number): void {
        this.app.renderer.resize(width, height);
        this.rootDiv.style.width = `${width}px`;
        this.rootDiv.style.height = `${height}px`;
    }

    destroy(): void {
        this.app.destroy();
    }
}

/**
 * Creates an absolute positioned div element
 * @param position
 * @returns
 */
export function createOverlayElement(
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    },
    id?: string
): HTMLDivElement {
    const overlay = document.createElement('div');

    overlay.style.position = 'absolute';
    overlay.style.left = `${position.x}px`;
    overlay.style.top = `${position.y}px`;
    overlay.style.width = `${position.width}px`;
    overlay.style.height = `${position.height}px`;
    overlay.id = `overlay-${id || Math.random().toString(36).substring(7)}`; // Add random id

    return overlay;
}
