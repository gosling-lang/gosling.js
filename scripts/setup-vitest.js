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

// Mock Worker to fix "ReferenceError: Worker is not defined" error in tests
class WorkerMock {
    constructor(stringUrl) {
      this.url = stringUrl;
      this.onmessage = () => {};
    }
    
    postMessage(msg) {
      this.onmessage({ data: msg });
    }
    
    terminate() {}
  }
  
  global.Worker = WorkerMock;