import { vi, beforeAll } from 'vitest';
import { randomFillSync } from 'crypto';
import 'vitest-canvas-mock'

beforeAll(() => {
    // jsdom doesn't come with a `URL.createObjectURL` implementation
    global.URL.createObjectURL = () => {
        return '';
    };
    global.jest = vi; // Needed to mock canvas in jest
});