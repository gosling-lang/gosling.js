import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from './package.json' assert { type: 'json' }; // must do the assert to solve https://nodejs.org/api/errors.html#err_import_assertion_type_missing

const __dirname = fileURLToPath(dirname(import.meta.url));

const alias = {
    'gosling.js': path.resolve(__dirname, './src/index.ts'),
    '@gosling-lang/gosling-schema': path.resolve(__dirname, './src/gosling-schema/index.ts'),
    '@gosling-lang/higlass-schema': path.resolve(__dirname, './src/higlass-schema/index.ts'),
    '@gosling-lang/gosling-theme': path.resolve(__dirname, './src/gosling-theme/index.ts'),
    '@gosling-lang/gosling-track': path.resolve(__dirname, './src/tracks/gosling-track/index.ts'),
    '@gosling-lang/gosling-genomic-axis': path.resolve(__dirname, './src/tracks/gosling-genomic-axis/index.ts'),
    '@gosling-lang/gosling-brush': path.resolve(__dirname, './src/tracks/gosling-brush/index.ts'),
    '@gosling-lang/dummy-track': path.resolve(__dirname, './src/tracks/dummy-track/index.ts'),
    '@data-fetchers': path.resolve(__dirname, './src/data-fetchers/index.ts'),
    zlib: path.resolve(__dirname, './src/alias/zlib.ts'),
    stream: path.resolve(__dirname, './node_modules/stream-browserify') //  gmod/gff uses stream-browserify
};

const skipExt = new Set(['@gmod/bbi']);
const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)].filter(
    dep => !skipExt.has(dep)
);

const esm = defineConfig({
    build: {
        emptyOutDir: false,
        outDir: 'dist',
        minify: false,
        target: 'es2018',
        sourcemap: true,
        lib: {
            entry: {
                gosling: path.resolve(__dirname, 'src/index.ts'),
                utils: path.resolve(__dirname, 'src/exported-utils.ts'),
                compiler: path.resolve(__dirname, 'src/exported-compiler.ts')
            },
            formats: ['es'],
        },
        rollupOptions: { external }
    },
    resolve: { alias },
    plugins: [],
});

const dev = defineConfig({
    build: { outDir: 'build' },
    resolve: { alias },
    define: {
        'process.platform': 'undefined', // because of the threads library relies on process global
        'process.env.THREADS_WORKER_INIT_TIMEOUT': 'undefined'
    },
    plugins: [],
});

const testing = defineConfig({
    resolve: { alias },
    test: {
        exclude: ['./node_modules/**', './dist/**', '**/*.test.tsx'],
        globals: true,
        setupFiles: [path.resolve(__dirname, './scripts/setup-vitest.js')],
        environment: 'jsdom',
        optimizer: {
            web: {
                include: ['vitest-canvas-mock']
            }
        },
        threads: false, // see https://github.com/vitest-dev/vitest/issues/740
        environmentOptions: {
            jsdom: {
                resources: 'usable'
            }
        },
        coverage: {
            reportsDirectory: './coverage',
            reporter: ['lcov', 'text'],
            include: ['src', 'editor']
        }
    },
    plugins: []
});

export default ({ command, mode }) => {
    if (command === 'build' && mode === 'lib') return esm;
    if (mode == 'test') return testing;
    if (mode === 'editor') {
        dev.plugins.push(react());
    }
    return dev;
};
