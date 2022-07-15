import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';
import pkg from './package.json';

const alias = {
    'gosling.js': path.resolve(__dirname, './src/index.ts'),
    '@gosling.schema': path.resolve(__dirname, './src/core/gosling.schema'),
    '@higlass.schema': path.resolve(__dirname, './src/core/higlass.schema'),
};

const external = [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
];

const base = defineConfig({
    resolve: { alias },
    optimizeDeps: {
        esbuildOptions: {
            inject: [path.resolve(__dirname, './src/alias/buffer-shim.js')],
        }
    },
})

const esm = defineConfig({
    ...base,
    build: {
        emptyOutDir: false,
        outDir: 'dist',
        minify: false,
        target: 'es2018',
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: 'gosling'
        },
        rollupOptions: { external }
    },
});

const dev = defineConfig({
    ...base,
    build: {
        outDir: 'build'
    },
    define: {
        'process.platform': 'undefined',
        'process.env.THREADS_WORKER_INIT_TIMEOUT': 'undefined'
    },
    plugins: [reactRefresh()],
});

const testing = defineConfig({
    ...base,
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
          include: ['src', 'editor'],
        },
        deps: {
            inline: ["@pixi/polyfill"]
        }
    },
});

export default ({ command, mode }) => {
    if (command === 'build' && mode === 'lib') return esm;
    if (mode == 'test') return testing;
    return dev;
};
