// For GMOD/binary-parser.js
// ref: https://github.com/GMOD/binary-parser/blob/05ce6417e0285933b0d981138961087b7eb3707e/lib/binary_parser.js#L324-L327
// Polyfill: https://github.com/ionic-team/rollup-plugin-node-polyfills/blob/9b5fe1a9cafffd4871e6d65613ed224f807ea251/polyfills/vm.js#L129-L132
function runInThisContext(code: unknown) {
    const fn = new Function('code', 'return eval(code);');
    return fn.call(globalThis, code);
}

// https://github.com/vitejs/vite/blob/b9e837a2aa2c1a7a8f93d4b19df9f72fd3c6fb09/packages/vite/src/node/plugins/resolve.ts#L285-L291
// Just polyfills vm.runInThisContext for the browser.
export default new Proxy(
    {},
    {
        get(key) {
            if (key === 'runInThisContext') return runInThisContext;
            throw new Error(
                'Module "vm" has been externalized for browser compatibility and cannot be accessed in client code.'
            );
        }
    }
);
