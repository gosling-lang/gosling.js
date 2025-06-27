export const fakePubSub = {
    __fake__: true,
    publish: () => {},
    subscribe: () => ({ event: 'fake', handler: () => {} }),
    unsubscribe: () => {},
    clear: () => {}
};
