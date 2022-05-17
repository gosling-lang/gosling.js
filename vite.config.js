import { defineConfig } from 'vitest/config';
import * as path from 'node:path';

export default defineConfig({
    test: {
        globals: true,
        setupFiles: [path.resolve(__dirname, './scripts/setup-vitest.js')],
        environment: 'jsdom',
        threads: false,
        environmentOptions: {
            jsdom: {
                resources: 'usable'
            }
        },
        coverage: {
            reportsDirectory: './coverage',
            reporter: ['lcov', 'text'],
            include: ['src', 'editor']
        },
        exclude: ['**/node_modules/**', '**/dist/**']
    }
});
