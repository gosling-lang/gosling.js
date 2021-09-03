const esbuild = require("esbuild");
const { resolve } = require("path");
const pkg = require("./package.json");

const skipExt = new Set(["@gmod/bam", "@gmod/bbi", "generic-filehandle"]);

/**
 * @param {Pick<import('esbuild').BuildOptions, 'minify' | 'format' | 'plugins'>}
 * @return {import('esbuild').Plugin}
 */
const inlineJsAsset = (opt = {}) => {
  const namespace = "js-asset";
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

const onRebuild = (error, result) => {
  if (error) console.error("watch build failed:", error);
  else console.log("watch build succeeded:", result);
};

/** @type {import('esbuild').BuildOptions} */
const baseConfig = {
  entryPoints: ["./src/index.ts"],
  format: "esm",
  bundle: true,
  inject: ["./src/alias/buffer-shim.js"],
  plugins: [inlineJsAsset()],
};

const esm = {
  ...baseConfig,
  outfile: pkg.module,
  target: "es2018",
  external: [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
  ].filter((dep) => !skipExt.has(dep)),
};

const banner = `\
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('pixi.js'), require('react'), require('higlass'), require('react-dom')) :
  typeof define === 'function' && define.amd ? define(['exports', 'pixi.js', 'react', 'higlass', 'react-dom'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.gosling = {}, global.PIXI, global.React, global.hglib, global.ReactDOM));
}(this, (function (exports, pixi_js, React, higlass, ReactDOM) { 'use strict';

const __mods = { 'pixi.js': pixi_js, 'react': React, 'ReactDOM': ReactDOM, 'higlass': higlass };
const require = name => __mods[name];
`;

const footer = "\n}))";

const umd = {
  ...baseConfig,
  outfile: pkg.main,
  format: "cjs",
  external: ["react", "react-dom", "pixi.js", "higlass"],
  banner: { js: banner },
  footer: { js: footer },
};

/** @type {import('esbuild').BuildOptions} */
const build = () => {
  const format = process.argv[2];
  let config;
  if (format === "--esm") config = esm;
  if (format === "--umd") config = umd;
  if (!config) {
    console.log("node build --umd/--esm [--watch]");
    process.exit(1);
  }
  if (process.argv[3] === "--watch") config.watch = { onRebuild };
  return esbuild.build(config);
};

build();
