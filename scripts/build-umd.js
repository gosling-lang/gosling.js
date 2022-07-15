const esbuild = require('esbuild');
const path = require('path');
const pkg = require('../package.json');

esbuild.build({
    entryPoints: [path.resolve(__dirname, '../dist/gosling.mjs')],
    target: 'es2018',
    outfile: pkg.main,
    bundle: true,
    format: 'cjs',
    minify: false,
    sourcemap: true,
    inject: [path.resolve(__dirname, '../src/alias/buffer-shim.js')],
    external: ['react', 'react-dom', 'pixi.js', 'higlass'],
    define: {
        'process.platform': 'undefined',
        'process.env.THREADS_WORKER_INIT_TIMEOUT': 'undefined'
    },
    // esbuild doesn't support UMD format directy. The banner/footer
    // wraps the commonjs output as a UMD module. The function signature is copied
    // from what is generated from rollup. If the external UMD dependencies change
    // (or the name of the gosling global) this needs changing.
    banner: {
        js: `\
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('pixi.js'), require('react'), require('higlass'), require('react-dom')) :
  typeof define === 'function' && define.amd ? define(['exports', 'pixi.js', 'react', 'higlass', 'react-dom'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.gosling = {}, global.PIXI, global.React, global.hglib, global.ReactDOM));
}(this, (function (exports, pixi_js, React, higlass, ReactDOM) { 'use strict';

var __mods = { 'pixi.js': pixi_js, 'react': React, 'react-dom': ReactDOM, 'higlass': higlass };
var require = name => __mods[name];
`
    },
    footer: { js: '\n})));' }
});
