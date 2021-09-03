import { defineConfig } from "vite";
import * as esbuild from "esbuild";
import { resolve } from "path";

/**
 * Vite plugin. Bundles code in `src/loaders/tiff/lib/decoder.worker.ts`
 * into a single file during _development only_. WebWorker modules are only
 * stable in chromium browsers, so this is a work-around to allow us to
 * develop in other browsers.
 *
 * see: https://github.com/hms-dbmi/viv/pull/469#issuecomment-877276110
 *
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
          format: 'esm',
          bundle: true,
          write: false
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
  build: { outDir: 'build' },
  resolve: {
    alias: {
      "gosling.js": resolve(__dirname, "./dist/gosling.es.js"),
      "@gosling.schema": resolve(__dirname, "./src/core/gosling.schema"),
      "@higlass.schema": resolve(__dirname, "./src/core/higlass.schema"),
    },
  },
  define: {
    "process.platform": "undefined",
    "process.env.THREADS_WORKER_INIT_TIMEOUT": "undefined",
  },
  plugins: [bundleWebWorker()],
});
