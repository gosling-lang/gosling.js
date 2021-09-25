const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const env = process.env.NODE_ENV || 'development';

function injectCss(code) {
    return `\n
function __injectStyle(css) {
  const headEl = document.head || document.getElementsByTagName('head')[0];
  const styleEl = document.createElement('style');
  styleEl.type = 'text/css';
  if (styleEl.styleSheet) {
    styleEl.styleSheet.cssText = css;
  } else {
    styleEl.appendChild(document.createTextNode(css));
  }
  headEl.appendChild(styleEl);
}
__injectStyle(${JSON.stringify(code)});\n`;
}

esbuild.build({
    entryPoints: [
        path.resolve(__dirname, '../embed/index.ts'),
    ],
    outdir: path.resolve(__dirname, '../dist/embed'),
    target: 'es2018',
    format: 'esm',
    splitting: true,
    sourcemap: true,
    bundle: true,
    minify: env === 'production',
    inject: [
        path.resolve(__dirname, '../src/alias/buffer-shim.js'),
    ],
    define: {
        'process.env.NODE_ENV': JSON.stringify(env),
    },
    plugins: [
        {
            name: 'inject-css',
            setup(build) {
                build.onLoad({ filter: /.css$/ }, async (args) => {
                    const p = fs.promises.readFile(args.path, {
                        encoding: 'utf-8',
                    });
                    return { contents: injectCss(await p), loader: 'js' };
                });
            },
        },
        {
            name: 'resolve-gosling',
            setup(build) {
                // resolve all exact references to `gosling.js` to the ESM build
                build.onResolve({ filter: /^gosling\.js$/ }, (_) => {
                    return {
                        path: path.join(__dirname, '../dist/gosling.es.js'),
                    };
                });
            },
        },
    ],
});
