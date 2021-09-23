import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import * as esbuild from 'esbuild';
import path from 'path';

import pkg from './package.json';

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
    'lodash': 'lodash-es',
    '@gmod/bgzf-filehandle': path.resolve(__dirname, './src/alias/bgzf-filehandle.ts'),
    'zlib': path.resolve(__dirname, './src/alias/zlib.ts'),
    'vm': path.resolve(__dirname, './src/alias/vm.ts'),
};



const skipExt = new Set(['@gmod/bbi']);
const external = [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
].filter((dep) => !skipExt.has(dep));

const esm = defineConfig({
    build: {
        outDir: 'dist',
        minify: false,
        target: 'es2018',
		sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: 'gosling',
        },
        rollupOptions: { external },
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
    if (command === 'build' && mode === 'lib') return esm;
    return editorConfig;
};
