import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import * as esbuild from 'esbuild';
import path from 'path';

/**
 * Bundles vite worker modules during development into single scripts.
 * see: https://github.com/hms-dbmi/viv/pull/469#issuecomment-877276110
 * @returns {import('vite').Plugin}
 */
const bundleWebWorker = () => {
    return {
        name: 'bundle-web-worker',
        apply: 'serve', // plugin only applied with dev-server
        async transform(_, id) {
            if (/\?worker_file$/.test(id)) {
                // just use esbuild to bundle the worker dependencies
                const bundle = await esbuild.build({
                    entryPoints: [id],
                    inject: ['./src/alias/buffer-shim.js'],
                    format: 'esm',
                    bundle: true,
                    write: false,
                });
                if (bundle.outputFiles.length !== 1) {
                    throw new Error('Worker must be a single module.');
                }
                return bundle.outputFiles[0].text;
            }
        },
    };
};

const alias = {
    'gosling.js': path.resolve(__dirname, './src/index.ts'),
    '@gosling.schema': path.resolve(__dirname, './src/core/gosling.schema'),
    '@higlass.schema': path.resolve(__dirname, './src/core/higlass.schema'),
    'zlib': path.resolve(__dirname, './src/alias/zlib.ts'),
};

const libEsm = defineConfig({
    build: {
        outDir: 'dist',
        minify: true,
        target: 'es2018',
        emptyOutDir: false,
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            formats: ['esm'],
        },
        rollupOptions: {
            external: [/^[^.\/]|^\.[^.\/]|^\.\.[^\/]/],
        },
    },
    resolve: { alias },
});

const libUmd = defineConfig({
    build: {
        outDir: 'dist',
        minify: false,
        target: 'es2018',
        emptyOutDir: false,
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            formats: ['umd'],
            name: 'gosling',
        },
        rollupOptions: {
			output: { name: 'gosling' },
            inlineDynamicImports: true,
            external: ['react', 'react-dom', 'pixi.js', 'higlass'],
        },
    },
    resolve: { alias },
});

const editorConfig = defineConfig({
    build: { outDir: 'build' },
    resolve: { alias },
    define: {
        'process.platform': 'undefined',
        'process.env.THREADS_WORKER_INIT_TIMEOUT': 'undefined',
    },
    plugins: [
        bundleWebWorker(),
        reactRefresh(),
    ],
});

export default ({ command, mode }) => {
    if (command === 'build' && mode === 'lib-umd') return libUmd;
    if (command === 'build' && mode === 'lib-esm') return libEsm;
    return editorConfig;
};
