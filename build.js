const esbuild = require("esbuild");
const { resolve } = require("path");
const pkg = require('./package.json');

/**
 * @param {Pick<import('esbuild').BuildOptions, 'minify' | 'format' | 'plugins'>}
 * @return {import('esbuild').Plugin}
 */
const PluginInlineWorker = (opt = {}) => {
  const namespace = "inline-worker";
  const prefix = `${namespace}:`;
  return {
    name: namespace,
    setup(build) {
      build.onResolve({ filter: new RegExp(`^${prefix}`) }, (args) => {
        return {
          path: resolve(args.resolveDir, args.path.slice(prefix.length)),
          namespace,
        };
      });
      build.onLoad({ filter: /.*/, namespace }, async (args) => {
        const { outputFiles } = await esbuild.build({
          entryPoints: [args.path],
          bundle: true,
          write: false,
          format: opt.format || "iife",
          minify: opt.minify || true,
          target: build.initialOptions.target,
          plugins: [
            ...(build.initialOptions.plugins || []),
            ...(opt.plugins || []),
          ],
        });
        if (outputFiles.length !== 1) {
          throw new Error("Too many files built for worker bundle.");
        }
        const { contents } = outputFiles[0];
        const base64 = Buffer.from(contents).toString("base64");
        return {
          loader: "js",
          contents:
            `export default "data:application/javascript;base64,${base64}";`,
        };
      });
    },
  };
};


const notExternal = new Set(["@gmod/bam", "@gmod/bbi", "generic-filehandle"]);
const external = ["react", "react-dom", "pixi.js", "higlass"]
	.concat(Object.keys(pkg.dependencies))
	.filter(dep => !notExternal.has(dep));

/** @type {import('esbuild').BuildOptions} */
const config = {
  entryPoints: ['./src/index.ts'],
  format: "esm",
  external: external,
  bundle: true,
  target: 'es2018',
  inject: ['./src/alias/buffer-shim.js'],
  plugins: [PluginInlineWorker()],
  banner: { js: 'var global = globalThis;' },
};

let cursor = 2;
if (process.argv[cursor] === "--watch") {
  config.watch = {
    onRebuild(error, result) {
      if (error) console.error("watch build failed:", error);
      else console.log("watch build succeeded:", result);
    },
  }, cursor++;
}

if (process.argv[cursor]) {
  config.outfile = process.argv[cursor];
}

esbuild.build(config);
