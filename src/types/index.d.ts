declare module 'js-asset:*' {
    const content: string;
    export default content;
}

declare module '*?worker' {
    const workerFactory: () => Worker;
    export default workerFactory;
}
