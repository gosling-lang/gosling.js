import { defineConfig } from "vite";
import reactRefresh from '@vitejs/plugin-react-refresh'
import * as esbuild from "esbuild";
import { resolve } from "path";

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
    }
  }
};

export default defineConfig({
  build: {
    outDir: 'build',
    minify: false,
    target: 'es2018',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^[^.\/]|^\.[^.\/]|^\.\.[^\/]/],
    }
  },
  resolve: {
    alias: {
      "gosling.js": resolve(__dirname, "./src/index.ts"),
      "@gosling.schema": resolve(__dirname, "./src/core/gosling.schema"),
      "@higlass.schema": resolve(__dirname, "./src/core/higlass.schema"),
      "zlib": resolve(__dirname, "./src/alias/zlib.ts"),
    },
  },
  define: {
    "process.platform": "undefined",
    "process.env.THREADS_WORKER_INIT_TIMEOUT": "undefined",
  },
  plugins: [
      bundleWebWorker(),
      reactRefresh(),
  ],
});
