declare module '*?worker' {
    const workerConstructor: {
        new (): Worker;
    };
    export default workerConstructor;
}

declare module '*?worker&inline' {
    const workerConstructor: {
        new (): Worker;
    };
    export default workerConstructor;
}

declare module 'monaco-editor/esm/vs/editor/edcore.main' {
    export * from 'monaco-editor';
}

declare module '*.png' {
    export default string;
}

declare module '*.gif' {
    export default string;
}
