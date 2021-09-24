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
const bundleWebWorker = {
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

/**
 * Transforms /node_modules/.vite/*.js to include an alias for global.
 * Only enabled during development.
 *
 * TODO: This plugin is a hack during development because some node_modules
 * contain references to `global`. If we migrate towards more browser-compatible
 * dependencies this can be removed. https://github.com/gosling-lang/gosling.js/pull/527
 *
 * @type {import('vite').Plugin}
 */
const injectGlobal = {
    name: 'inject-global',
    apply: 'serve', // only runs during
    transform(code, id) {
        if (/node_modules\/.vite\/(.*).js*/.test(id)) {
            return 'const global = globalThis;\n' + code;
        }
    },
};

const alias = {
    'gosling.js': path.resolve(__dirname, './src/index.ts'),
    '@gosling.schema': path.resolve(__dirname, './src/core/gosling.schema'),
    '@higlass.schema': path.resolve(__dirname, './src/core/higlass.schema'),
    'lodash': 'lodash-es',
    'zlib': path.resolve(__dirname, './src/alias/zlib.ts'),
    'uuid': path.resolve(__dirname, './node_modules/uuid/dist/esm-browser/index.js'),
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

const dev = defineConfig({
    build: { outDir: 'build' },
    resolve: { alias },
    define: {
        'process.platform': 'undefined',
        'process.env.THREADS_WORKER_INIT_TIMEOUT': 'undefined',
    },
    plugins: [bundleWebWorker, injectGlobal],
});

export default ({ command, mode }) => {
    if (command === 'build' && mode === 'lib') return esm;
    if (mode === 'editor') {
        dev.plugins.push(reactRefresh());
    }
	return dev;
};
