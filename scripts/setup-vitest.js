import { beforeAll, afterAll, vi } from 'vitest';
import { randomFillSync } from 'crypto';

global.jest = vi;

const apis = [
    'Path2D',
    'CanvasGradient',
    'CanvasPattern',
    'CanvasRenderingContext2D',
    'DOMMatrix',
    'ImageData',
    'TextMetrics',
    'ImageBitmap',
    'createImageBitmap',
];

// global.jest needs to be set before import jest-canvas-mock
(async () => {
    const mod = await import('jest-canvas-mock/lib/window');
    const getCanvasWindow = mod.default?.default || mod.default || mod;
    const canvasWindow = getCanvasWindow({ document: window.document });

    apis.forEach((api) => {
        global[api] = canvasWindow[api];
        global.window[api] = canvasWindow[api];
    });
})();

beforeAll(() => {
    // jsdom doesn't come with a WebCrypto implementation (required for uuid)
    global.crypto = {
        getRandomValues: function (buffer) {
            return randomFillSync(buffer);
        }
    };
    // jsdom doesn't come with a `URL.createObjectURL` implementation
    global.URL.createObjectURL = () => { return ''; };
});

afterAll(() => {
  delete global.jest
  delete global.window.jest
})

export {}
